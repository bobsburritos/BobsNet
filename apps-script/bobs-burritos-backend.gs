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
var MAX_EMAIL_LEN = 120;
var MAX_ORDER_ID_LEN = 24;
var MAX_NOTE_LEN = 500;

/* Email is trailing column Q so Prep SUMIFS (H–N) stay valid on existing sheets. */
var HEADERS = [
  'OrderID', 'ReceivedAt', 'DeliveryDate', 'DeliveryLabel',
  'Name', 'Unit', 'Phone',
  'Soyrizo', 'SoyrizoAvo', 'Cali', 'Heavy', 'HeavyAvo',
  'Total', 'Paid', 'PaidAt', 'PaidRef',
  'Email'
];
var COL_EMAIL = 17; /* 1-based */

var PRICES = { soyrizo: 10, cali: 12, heavy: 10, avo: 2 };
var VENMO_USERNAME = 'Khushbu-Kotecha';
var ZELLE_TO = '7148120977';

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
  } else {
    ensureEmailColumn(orders);
  }
  return orders;
}

/** Append Email header at column Q if missing (does not shift existing qty/money columns). */
function ensureEmailColumn(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase() === 'email') return i + 1;
  }
  sheet.getRange(1, COL_EMAIL).setValue('Email').setFontWeight('bold');
  return COL_EMAIL;
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function rowEmail(r) {
  if (!r || r.length < COL_EMAIL) return '';
  return cleanStr(r[COL_EMAIL - 1], MAX_EMAIL_LEN);
}

function orderLinesFromQty(qty) {
  var lines = [];
  if (qty.soyrizo) lines.push('Soyrizo Sunrise: ' + qty.soyrizo + (qty.soyrizoAvo ? ' (avo on ' + qty.soyrizoAvo + ')' : ''));
  if (qty.cali) lines.push('The Cali: ' + qty.cali);
  if (qty.heavy) lines.push('The Heavyweight: ' + qty.heavy + (qty.heavyAvo ? ' (avo on ' + qty.heavyAvo + ')' : ''));
  return lines;
}

function customerEmailBody(kind, o, extraNote) {
  var payNote = o.orderId + ' | ' + o.name + ' | Unit ' + o.unit + ' | $' + o.total;
  var payBits = [];
  if (VENMO_USERNAME) payBits.push('Venmo @' + VENMO_USERNAME);
  if (ZELLE_TO) payBits.push('Zelle ' + ZELLE_TO);
  var payTo = payBits.length ? payBits.join(' or ') : 'Venmo / Zelle (see order page)';
  var itemLines = (o.itemLines && o.itemLines.length) ? o.itemLines.join('\n') : '(see confirmation on site)';
  var note = extraNote ? ('\n\nNote from kitchen:\n' + extraNote) : '';

  if (kind === 'payment') {
    return (
      'Hi ' + o.name + ',\n\n' +
      'Friendly reminder: we still need payment for order ' + o.orderId + ' so we can cook it.\n\n' +
      'Total: $' + o.total + '\n' +
      'Unit: ' + o.unit + '\n' +
      'Delivery: ' + o.deliveryLabel + ' (' + o.deliveryDate + ') · 9 AM–12 PM LA time\n\n' +
      'Pay by Saturday 3:00 PM (America/Los_Angeles) via ' + payTo + '.\n' +
      'Paste this exact payment note in the memo:\n' + payNote + '\n\n' +
      'No payment by the cutoff = we do not cook that order.\n' +
      note + '\n\n' +
      '— Bob\'s Burritos\n' +
      'Questions: ' + OWNER_EMAIL + '\n' +
      'This is a transactional order message only — not marketing.'
    );
  }
  if (kind === 'delivery') {
    return (
      'Hi ' + o.name + ',\n\n' +
      'Your Bob\'s Burritos order ' + o.orderId + ' is on the Sunday delivery run.\n\n' +
      'Unit: ' + o.unit + '\n' +
      'Window: 9 AM–12 PM (America/Los_Angeles) · ' + o.deliveryLabel + '\n\n' +
      'We\'ll knock / leave at your door as usual for 1111 Wilshire.\n' +
      note + '\n\n' +
      '— Bob\'s Burritos\n' +
      OWNER_EMAIL + '\n' +
      'Transactional order message only.'
    );
  }
  /* received (default) */
  return (
    'Hi ' + o.name + ',\n\n' +
    'Thanks for ordering Bob\'s Burritos — we received order ' + o.orderId + '.\n\n' +
    'Delivery: ' + o.deliveryLabel + ' (' + o.deliveryDate + ')\n' +
    'Window: Sunday 9 AM–12 PM (America/Los_Angeles)\n' +
    'Unit: ' + o.unit + '\n\n' +
    'Items:\n' + itemLines + '\n\n' +
    'TOTAL: $' + o.total + '\n\n' +
    'Please pay by Saturday 3:00 PM LA time via ' + payTo + '.\n' +
    'Include this payment note in the memo so we can match you:\n' + payNote + '\n\n' +
    'No payment by the cutoff = we do not cook that order.\n' +
    note + '\n\n' +
    '— Bob\'s Burritos (woman-owned)\n' +
    '1111 Wilshire · ' + OWNER_EMAIL + '\n\n' +
    'You received this because you placed an order and provided this email for order updates only.'
  );
}

function sendCustomerMail(to, subject, body) {
  if (!to || !isValidEmail(to)) return false;
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: body,
    replyTo: OWNER_EMAIL,
    name: "Bob's Burritos"
  });
  return true;
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
    if (data.action === 'emailCustomer') return emailCustomer(data);
    return insertOrder(data);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function insertOrder(data) {
  var name = cleanStr(data.name, MAX_NAME_LEN);
  var unit = cleanStr(data.unit, MAX_UNIT_LEN);
  var phone = cleanStr(data.phone, MAX_PHONE_LEN);
  var email = cleanStr(data.email, MAX_EMAIL_LEN).toLowerCase();
  var orderId = cleanStr(data.orderId, MAX_ORDER_ID_LEN);
  var deliveryDate = cleanStr(data.deliveryDate, 12);
  var deliveryLabel = cleanStr(data.deliverySunday || data.deliveryLabel, 60);

  if (!name || !unit) return json({ ok: false, error: 'name and unit required' });
  if (!email || !isValidEmail(email)) return json({ ok: false, error: 'valid email required' });
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
    total, 'NO', '', '',
    email
  ]);
  var row = sheet.getLastRow();
  sheet.getRange(row, 3).setNumberFormat('@').setValue(deliveryDate);
  sheet.getRange(row, COL_EMAIL).setValue(email);

  var itemLines = orderLinesFromQty(qty);
  var custObj = {
    orderId: orderId,
    name: name,
    unit: unit,
    email: email,
    deliveryDate: deliveryDate,
    deliveryLabel: deliveryLabel,
    total: total,
    itemLines: itemLines
  };

  /* Customer only — no per-order kitchen email (saves Gmail quota).
     Kitchen uses the sheet + kitchen portal; optional daily digest: sendKitchenDigest(). */
  var customerEmailed = false;
  try {
    customerEmailed = sendCustomerMail(
      email,
      "Bob's Burritos — order " + orderId + ' received',
      customerEmailBody('received', custObj, '')
    );
  } catch (custErr) {}

  return json({ ok: true, orderId: orderId, total: total, customerEmailed: customerEmailed });
}

/**
 * One kitchen email summarizing orders (not per-order).
 * Run from the script editor, or set a time-driven trigger (e.g. daily 9 AM LA).
 * Optional: pass deliveryDate 'yyyy-mm-dd' via trigger property — otherwise next Sunday.
 */
function sendKitchenDigest(deliveryDateOpt) {
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  var target = cleanStr(deliveryDateOpt || '', 12);
  if (target && !isValidDateISO(target)) target = '';
  if (!target) target = nextSundayISO_();

  var lines = [];
  var n = 0, unpaid = 0, revenue = 0, paidRev = 0;
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var d = cellText(r[2], true);
    if (d !== target) continue;
    n++;
    var id = String(r[0] || '');
    var name = String(r[4] || '');
    var unit = String(r[5] || '');
    var email = rowEmail(r);
    var total = Number(r[12]) || 0;
    var paid = String(r[13]).toUpperCase() === 'YES';
    revenue += total;
    if (paid) paidRev += total; else unpaid++;
    lines.push(
      (paid ? '[PAID] ' : '[UNPAID] ') + id + ' · Unit ' + unit + ' · ' + name +
      ' · $' + total + (email ? ' · ' + email : '')
    );
  }

  var body =
    "Bob's Burritos — kitchen digest\n" +
    'Delivery date: ' + target + '\n' +
    'Orders: ' + n + ' · Unpaid: ' + unpaid + '\n' +
    'Revenue: $' + (Math.round(revenue * 100) / 100) +
    ' · Paid so far: $' + (Math.round(paidRev * 100) / 100) + '\n\n' +
    (lines.length ? lines.join('\n') : '(no orders for this date)') + '\n\n' +
    'Open the kitchen portal for full board. Do not edit the sheet by hand.\n' +
    'To schedule: Apps Script → Triggers → sendKitchenDigest → Day timer.';

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: "Bob's kitchen digest — " + target + ' (' + n + ' orders, ' + unpaid + ' unpaid)',
    body: body,
    name: "Bob's Burritos Kitchen"
  });
  return { ok: true, deliveryDate: target, orders: n, unpaid: unpaid };
}

/** Next Sunday from "now" in America/Los_Angeles (for digest default). */
function nextSundayISO_() {
  var now = new Date();
  var la = Utilities.formatDate(now, 'America/Los_Angeles', 'yyyy-MM-dd');
  var parts = la.split('-');
  var y = +parts[0], m = +parts[1] - 1, d = +parts[2];
  var local = new Date(y, m, d);
  var dow = local.getDay(); /* 0=Sun */
  var add = dow === 0 ? 7 : 7 - dow;
  var sun = new Date(y, m, d + add);
  return Utilities.formatDate(sun, 'America/Los_Angeles', 'yyyy-MM-dd');
}

/** Kitchen portal: email customer about payment / delivery / resend receipt. */
function emailCustomer(data) {
  if (!requireKey(data)) return json({ ok: false, error: 'bad key' });
  var orderId = cleanStr(data.orderId, MAX_ORDER_ID_LEN);
  if (!isValidOrderId(orderId)) return json({ ok: false, error: 'bad orderId' });
  var kind = cleanStr(data.kind || 'received', 20).toLowerCase();
  if (kind !== 'payment' && kind !== 'delivery' && kind !== 'received') {
    kind = 'received';
  }
  var note = cleanStr(data.note || '', MAX_NOTE_LEN);

  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[0]) !== orderId) continue;
    var email = rowEmail(r);
    if (!email || !isValidEmail(email)) {
      return json({ ok: false, error: 'no email on file for ' + orderId });
    }
    var qty = {
      soyrizo: Number(r[7]) || 0,
      soyrizoAvo: Number(r[8]) || 0,
      cali: Number(r[9]) || 0,
      heavy: Number(r[10]) || 0,
      heavyAvo: Number(r[11]) || 0
    };
    var o = {
      orderId: orderId,
      name: String(r[4] || ''),
      unit: String(r[5] || ''),
      email: email,
      deliveryDate: cellText(r[2], true),
      deliveryLabel: cellText(r[3], false),
      total: Number(r[12]) || 0,
      itemLines: orderLinesFromQty(qty)
    };
    var subjects = {
      received: "Bob's Burritos — order " + orderId + ' received',
      payment: "Bob's Burritos — payment needed for " + orderId,
      delivery: "Bob's Burritos — delivery update " + orderId
    };
    try {
      sendCustomerMail(email, subjects[kind] || subjects.received, customerEmailBody(kind, o, note));
      return json({ ok: true, orderId: orderId, kind: kind, to: email });
    } catch (err) {
      return json({ ok: false, error: 'send failed: ' + String(err) });
    }
  }
  return json({ ok: false, error: 'order not found: ' + orderId });
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
        paidRef: String(r[15] || ''),
        email: rowEmail(r)
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
