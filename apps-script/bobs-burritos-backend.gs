/**
 * Bob's Burritos - order backend (Google Apps Script)
 *
 * AFTER ANY EDIT: Deploy > Manage deployments > pencil > Version: New version > Deploy
 * Only the Web app /exec URL is used by the public site (not Library URLs).
 */

var OWNER_EMAIL = 'bobsburritosco@gmail.com';
var PORTAL_KEY = 'change-me-to-a-long-random-string';
var SPREADSHEET_ID = '1m4Kyd07mDDpekeAuJ-XJcKU-8N2Cc3jbWtjATGJ9ZiU';

var SHEET_ORDERS = 'Orders';
var SHEET_PREP = 'Prep';
var MAX_QTY_PER_VARIANT = 20;
var MAX_TOTAL_BURRITOS = 40;
var MAX_NAME_LEN = 80;
var MAX_UNIT_LEN = 20;
var MAX_PHONE_LEN = 30;
var MAX_ORDER_ID_LEN = 24;

var HEADERS = [
  'OrderID', 'ReceivedAt', 'DeliveryDate', 'DeliveryLabel',
  'Name', 'Unit', 'Phone',
  'Soyrizo', 'SoyrizoAvo', 'Cali', 'Heavy', 'HeavyAvo',
  'Total', 'Paid', 'PaidAt', 'PaidRef'
];

var PRICES = { soyrizo: 10, cali: 12, heavy: 10, avo: 2 };

function getSS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  throw new Error('No spreadsheet. Set SPREADSHEET_ID.');
}

function ensureOrdersSheet() {
  var ss = getSS();
  var orders = ss.getSheetByName(SHEET_ORDERS);
  if (!orders) orders = ss.insertSheet(SHEET_ORDERS);
  if (orders.getLastRow() === 0) {
    orders.appendRow(HEADERS);
    orders.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    orders.setFrozenRows(1);
  }
  return orders;
}

function isoNow() {
  return Utilities.formatDate(new Date(), 'America/Los_Angeles', "yyyy-MM-dd'T'HH:mm:ss");
}

function cellText(v, dateOnly) {
  if (v === null || v === undefined || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]' && !isNaN(v.getTime())) {
    return dateOnly
      ? Utilities.formatDate(v, 'America/Los_Angeles', 'yyyy-MM-dd')
      : Utilities.formatDate(v, 'America/Los_Angeles', "yyyy-MM-dd'T'HH:mm:ss");
  }
  return String(v);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanStr(v, maxLen) {
  var s = String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > maxLen) s = s.substring(0, maxLen);
  return s;
}

function isValidOrderId(id) {
  return /^BB-[A-Z0-9]{3,20}$/i.test(id);
}

function isValidDateISO(d) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function requireKey(data) {
  return data && data.key === PORTAL_KEY;
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'empty body' });
    }
    if (e.postData.contents.length > 20000) {
      return json({ ok: false, error: 'payload too large' });
    }
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'markPaid') return markPaid(data);
    if (data.action === 'deleteOrder') return deleteOrder(data);
    if (data.action === 'cleanupTests') return cleanupTests(data);
    return insertOrder(data);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function insertOrder(data) {
  var name = cleanStr(data.name, MAX_NAME_LEN);
  var unit = cleanStr(data.unit, MAX_UNIT_LEN);
  var phone = cleanStr(data.phone, MAX_PHONE_LEN);
  var orderId = cleanStr(data.orderId, MAX_ORDER_ID_LEN);
  var deliveryDate = cleanStr(data.deliveryDate, 12);
  var deliveryLabel = cleanStr(data.deliverySunday || data.deliveryLabel, 60);

  if (!name || !unit) return json({ ok: false, error: 'name and unit required' });
  if (!isValidOrderId(orderId)) return json({ ok: false, error: 'bad orderId' });
  if (deliveryDate && !isValidDateISO(deliveryDate)) return json({ ok: false, error: 'bad deliveryDate' });

  var qty = { soyrizo: 0, soyrizoAvo: 0, cali: 0, heavy: 0, heavyAvo: 0 };
  var items = data.items || [];
  if (Object.prototype.toString.call(items) !== '[object Array]' || items.length > 12) {
    return json({ ok: false, error: 'bad items' });
  }

  for (var i = 0; i < items.length; i++) {
    var item = items[i] || {};
    var id = String(item.id || '');
    var q = parseInt(item.qty, 10);
    if (isNaN(q) || q < 0) q = 0;
    if (q > MAX_QTY_PER_VARIANT) q = MAX_QTY_PER_VARIANT;
    if (q === 0) continue;
    if (id === 'soyrizo') {
      qty.soyrizo += q;
      if (item.avo) qty.soyrizoAvo += q;
    } else if (id === 'cali') {
      qty.cali += q;
    } else if (id === 'heavy') {
      qty.heavy += q;
      if (item.avo) qty.heavyAvo += q;
    }
  }

  if (qty.soyrizoAvo > qty.soyrizo) qty.soyrizoAvo = qty.soyrizo;
  if (qty.heavyAvo > qty.heavy) qty.heavyAvo = qty.heavy;

  var totalB = qty.soyrizo + qty.cali + qty.heavy;
  if (totalB < 1) return json({ ok: false, error: 'no burritos' });
  if (totalB > MAX_TOTAL_BURRITOS) return json({ ok: false, error: 'too many burritos' });

  var total =
    qty.soyrizo * PRICES.soyrizo +
    qty.soyrizoAvo * PRICES.avo +
    qty.cali * PRICES.cali +
    qty.heavy * PRICES.heavy +
    qty.heavyAvo * PRICES.avo;
  total = Math.round(total * 100) / 100;

  var sheet = ensureOrdersSheet();
  var last = sheet.getLastRow();
  if (last > 1) {
    var ids = sheet.getRange(2, 1, last - 1, 1).getValues();
    for (var r = 0; r < ids.length; r++) {
      if (String(ids[r][0]) === orderId) {
        return json({ ok: true, orderId: orderId, deduped: true, total: total });
      }
    }
  }

  sheet.appendRow([
    orderId, isoNow(), deliveryDate, deliveryLabel,
    name, unit, phone,
    qty.soyrizo, qty.soyrizoAvo, qty.cali, qty.heavy, qty.heavyAvo,
    total, 'NO', '', ''
  ]);
  var row = sheet.getLastRow();
  sheet.getRange(row, 3).setNumberFormat('@').setValue(deliveryDate);

  try {
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: 'Burrito order ' + orderId + ' - ' + name + ' (Unit ' + unit + ') $' + total,
      body:
        'Order ID: ' + orderId + '\n' +
        'Delivery: ' + deliveryLabel + ' (' + deliveryDate + ')\n' +
        'Name: ' + name + '\nUnit: ' + unit + '\nPhone: ' + (phone || '-') + '\n\n' +
        'Soyrizo: ' + qty.soyrizo + ' (with avo: ' + qty.soyrizoAvo + ')\n' +
        'Cali: ' + qty.cali + '\n' +
        'Heavyweight: ' + qty.heavy + ' (with avo: ' + qty.heavyAvo + ')\n\n' +
        'TOTAL: $' + total + '\n\n' +
        'Do not edit the sheet by hand.'
    });
  } catch (mailErr) {}

  return json({ ok: true, orderId: orderId, total: total });
}

function markPaid(data) {
  if (!requireKey(data)) return json({ ok: false, error: 'bad key' });
  var orderId = cleanStr(data.orderId, MAX_ORDER_ID_LEN);
  if (!isValidOrderId(orderId)) return json({ ok: false, error: 'bad orderId' });
  var ref = cleanStr(data.ref, 80) || 'api';
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === orderId) {
      sheet.getRange(i + 1, 14).setValue('YES');
      sheet.getRange(i + 1, 15).setValue(isoNow());
      sheet.getRange(i + 1, 16).setValue(ref);
      return json({ ok: true, orderId: orderId });
    }
  }
  return json({ ok: false, error: 'order not found: ' + orderId });
}

function deleteOrder(data) {
  if (!requireKey(data)) return json({ ok: false, error: 'bad key' });
  var orderId = cleanStr(data.orderId, MAX_ORDER_ID_LEN);
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === orderId) {
      sheet.deleteRow(i + 1);
      return json({ ok: true, deleted: orderId });
    }
  }
  return json({ ok: false, error: 'order not found: ' + orderId });
}

function cleanupTests(data) {
  if (data && data.key && data.key !== PORTAL_KEY) return json({ ok: false, error: 'bad key' });
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  var deleted = [];
  for (var i = rows.length - 1; i >= 1; i--) {
    var id = String(rows[i][0]);
    if (id.indexOf('BB-SMOKE') === 0 || id.indexOf('BB-TEST') === 0 || id === 'BB-SETUP') {
      sheet.deleteRow(i + 1);
      deleted.push(id);
    }
  }
  return json({ ok: true, deleted: deleted });
}

function cleanupTestsFromEditor() {
  Logger.log(cleanupTests({}).getContent());
}

function doGet(e) {
  try {
    if (!e.parameter || e.parameter.key !== PORTAL_KEY) return json({ ok: false, error: 'bad key' });
    var date = cleanStr(e.parameter.date, 12);
    if (date && !isValidDateISO(date)) return json({ ok: false, error: 'bad date' });
    var sheet = ensureOrdersSheet();
    var rows = sheet.getDataRange().getValues();
    var orders = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var deliveryDate = cellText(r[2], true);
      if (date && deliveryDate !== date) continue;
      orders.push({
        orderId: String(r[0]),
        receivedAt: cellText(r[1], false),
        deliveryDate: deliveryDate,
        deliveryLabel: cellText(r[3], false),
        name: String(r[4] || ''),
        unit: String(r[5] || ''),
        phone: String(r[6] || ''),
        soyrizo: Number(r[7]) || 0,
        soyrizoAvo: Number(r[8]) || 0,
        cali: Number(r[9]) || 0,
        heavy: Number(r[10]) || 0,
        heavyAvo: Number(r[11]) || 0,
        total: Number(r[12]) || 0,
        paid: String(r[13]).toUpperCase() === 'YES',
        paidAt: cellText(r[14], false),
        paidRef: String(r[15] || '')
      });
    }
    return json({ ok: true, orders: orders });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function setupSheets() {
  var ss = getSS();
  ensureOrdersSheet();

  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1 && ss.getSheets().length > 1) {
    var vals = sheet1.getDataRange().getValues();
    var empty = true;
    for (var r = 0; r < vals.length && empty; r++) {
      for (var c = 0; c < vals[r].length; c++) {
        if (vals[r][c] !== '' && vals[r][c] !== null) { empty = false; break; }
      }
    }
    if (empty) {
      try { ss.deleteSheet(sheet1); } catch (e2) {}
    }
  }

  var prep = ss.getSheetByName(SHEET_PREP) || ss.insertSheet(SHEET_PREP);
  prep.clear();
  var rows = [
    ["BOB'S BURRITOS - PREP SHEET (read-only mirror)", ''],
    ['Delivery date (yyyy-mm-dd):', ''],
    ['', ''],
    ['COOK COUNTS', ''],
    ['Soyrizo Sunrise', '=SUMIFS(Orders!H:H,Orders!C:C,$B$2)'],
    ['The Cali', '=SUMIFS(Orders!J:J,Orders!C:C,$B$2)'],
    ['The Heavyweight', '=SUMIFS(Orders!K:K,Orders!C:C,$B$2)'],
    ['TOTAL BURRITOS', '=B5+B6+B7'],
    ['', ''],
    ['SHOPPING LIST', ''],
    ['Large tortillas', '=B8'],
    ['Eggs (2 per burrito)', '=B8*2'],
    ['Cheese portions', '=B8'],
    ['Hash brown servings', '=B8'],
    ['Soy chorizo servings', '=B5'],
    ['Beef servings (taco seasoned)', '=B6'],
    ['Sausage + bacon servings', '=B7'],
    ['Avocado halves', '=B6 + SUMIFS(Orders!I:I,Orders!C:C,$B$2) + SUMIFS(Orders!L:L,Orders!C:C,$B$2)'],
    ['Onion + cilantro portions', '=B8'],
    ['Sauce cups (chipotle mayo)', '=B8'],
    ['Kraft boxes', '=B8'],
    ['Foil sheets', '=B8'],
    ['', ''],
    ['MONEY', ''],
    ['Revenue expected', '=SUMIFS(Orders!M:M,Orders!C:C,$B$2)'],
    ['Paid so far', '=SUMIFS(Orders!M:M,Orders!C:C,$B$2,Orders!N:N,"YES")'],
    ['Unpaid (chase these)', '=B25-B26']
  ];
  prep.getRange(1, 1, rows.length, 2).setValues(rows);
  prep.getRange('A1').setFontWeight('bold');
  prep.getRange('A4').setFontWeight('bold');
  prep.getRange('A10').setFontWeight('bold');
  prep.getRange('A24').setFontWeight('bold');
  prep.getRange('B2').setBackground('#FFD23F').setFontWeight('bold');
  prep.setColumnWidth(1, 320);
}
