/**
 * Bob's Burritos - order backend TEMPLATE (public repo).
 *
 * Do not put real PORTAL_KEY here. Use local/bobs-burritos-backend.READY.gs on the machine.
 *
 * Live sheet ID (reference): 1m4Kyd07mDDpekeAuJ-XJcKU-8N2Cc3jbWtjATGJ9ZiU
 * Live Web app is configured in index.html SCRIPT_URL.
 *
 * AFTER ANY EDIT in the real project:
 * Deploy > Manage deployments > pencil > Version: New version > Deploy
 */

var OWNER_EMAIL = 'bobsburritosco@gmail.com';
var PORTAL_KEY = 'change-me-to-a-long-random-string';
var SPREADSHEET_ID = '1m4Kyd07mDDpekeAuJ-XJcKU-8N2Cc3jbWtjATGJ9ZiU';

var SHEET_ORDERS = 'Orders';
var SHEET_PREP = 'Prep';

var HEADERS = [
  'OrderID', 'ReceivedAt', 'DeliveryDate', 'DeliveryLabel',
  'Name', 'Unit', 'Phone',
  'Soyrizo', 'SoyrizoAvo', 'Cali', 'Heavy', 'HeavyAvo',
  'Total', 'Paid', 'PaidAt', 'PaidRef'
];

function getSS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  throw new Error('No spreadsheet. Set SPREADSHEET_ID.');
}

function ensureOrdersSheet() {
  var ss = getSS();
  var orders = ss.getSheetByName(SHEET_ORDERS) || ss.insertSheet(SHEET_ORDERS);
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

function doPost(e) {
  try {
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
  var qty = { soyrizo: 0, soyrizoAvo: 0, cali: 0, heavy: 0, heavyAvo: 0 };
  (data.items || []).forEach(function (item) {
    if (item.id === 'soyrizo') {
      qty.soyrizo += item.qty;
      if (item.avo) qty.soyrizoAvo += item.qty;
    } else if (item.id === 'cali') {
      qty.cali += item.qty;
    } else if (item.id === 'heavy') {
      qty.heavy += item.qty;
      if (item.avo) qty.heavyAvo += item.qty;
    }
  });

  var sheet = ensureOrdersSheet();
  var orderId = data.orderId || ('BB-R' + sheet.getLastRow());
  var deliveryDate = String(data.deliveryDate || '');
  sheet.appendRow([
    orderId, isoNow(), deliveryDate, String(data.deliverySunday || ''),
    data.name || '', data.unit || '', data.phone || '',
    qty.soyrizo, qty.soyrizoAvo, qty.cali, qty.heavy, qty.heavyAvo,
    data.total || 0, 'NO', '', ''
  ]);
  var last = sheet.getLastRow();
  sheet.getRange(last, 3).setNumberFormat('@').setValue(deliveryDate);

  try {
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: 'Burrito order ' + orderId + ' - ' + (data.name || '?') + ' (Unit ' + (data.unit || '?') + ') $' + data.total,
      body:
        'Order ID: ' + orderId + '\n' +
        'Delivery: ' + data.deliverySunday + ' (' + deliveryDate + ')\n' +
        'Name: ' + data.name + '\nUnit: ' + data.unit + '\nPhone: ' + (data.phone || '-') + '\n\n' +
        'TOTAL: $' + data.total
    });
  } catch (mailErr) {}

  return json({ ok: true, orderId: orderId });
}

function markPaid(data) {
  if (data.key !== PORTAL_KEY) return json({ ok: false, error: 'bad key' });
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.orderId)) {
      sheet.getRange(i + 1, 14).setValue('YES');
      sheet.getRange(i + 1, 15).setValue(isoNow());
      sheet.getRange(i + 1, 16).setValue(String(data.ref || 'api'));
      return json({ ok: true, orderId: data.orderId });
    }
  }
  return json({ ok: false, error: 'order not found: ' + data.orderId });
}

function deleteOrder(data) {
  if (data.key !== PORTAL_KEY) return json({ ok: false, error: 'bad key' });
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.orderId)) {
      sheet.deleteRow(i + 1);
      return json({ ok: true, deleted: data.orderId });
    }
  }
  return json({ ok: false, error: 'order not found: ' + data.orderId });
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
    var date = e.parameter.date || '';
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
        name: String(r[4] || ''), unit: String(r[5] || ''), phone: String(r[6] || ''),
        soyrizo: Number(r[7]) || 0, soyrizoAvo: Number(r[8]) || 0,
        cali: Number(r[9]) || 0, heavy: Number(r[10]) || 0, heavyAvo: Number(r[11]) || 0,
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
  ensureOrdersSheet();
  var ss = getSS();
  var prep = ss.getSheetByName(SHEET_PREP) || ss.insertSheet(SHEET_PREP);
  prep.clear();
  var rows = [
    ["BOB'S BURRITOS - PREP SHEET", ''],
    ['Delivery date (yyyy-mm-dd):', ''],
    ['', ''],
    ['COOK COUNTS', ''],
    ['Soyrizo Sunrise', '=SUMIFS(Orders!H:H,Orders!C:C,$B$2)'],
    ['The Cali', '=SUMIFS(Orders!J:J,Orders!C:C,$B$2)'],
    ['The Heavyweight', '=SUMIFS(Orders!K:K,Orders!C:C,$B$2)'],
    ['TOTAL BURRITOS', '=B5+B6+B7']
  ];
  prep.getRange(1, 1, rows.length, 2).setValues(rows);
}
