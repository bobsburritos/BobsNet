/**
 * Bob's Burritos â€” order backend (Google Apps Script)
 *
 * The spreadsheet is a DATABASE. No human edits cells.
 * Writers: this script (orders via the form, payment status via markPaid).
 * Readers: the kitchen portal (doGet) and any reconciliation script.
 *
 * SETUP (one time):
 * 1. Create a Google Sheet under the business account, name it "Bobs Burritos Orders".
 * 2. Extensions > Apps Script. Paste this whole file.
 * 3. Set OWNER_EMAIL and PORTAL_KEY below.
 * 4. Run setupSheets() once. Approve permissions.
 * 5. Deploy > New deployment > Web app. Execute as: Me. Access: Anyone.
 *    Copy the Web app URL into SCRIPT_URL in both bobs-burritos.html and kitchen.html.
 *    (After ANY future edit to this file: Deploy > Manage deployments > edit > New version.)
 *
 * DATA CONTRACT (Orders tab, one row per order, append-only except Paid columns):
 *   A OrderID        BB-XXXXX, client-generated, primary key
 *   B ReceivedAt     ISO 8601, America/Los_Angeles
 *   C DeliveryDate   ISO date (yyyy-mm-dd) of the delivery Sunday
 *   D DeliveryLabel  human label ("Sunday, August 9")
 *   E Name  F Unit  G Phone
 *   H Soyrizo  I SoyrizoAvo  J Cali  K Heavy  L HeavyAvo   (I and L are subsets of H and K)
 *   M Total  N Paid (YES/NO)  O PaidAt (ISO)  P PaidRef (how it was matched)
 */

var OWNER_EMAIL = 'bobsburritosco@gmail.com'; // sheet: 1zC1mxVI3cAnyktj7yqSEhiCd4_YkbwFa024lOGtg7IE                     // <-- change me
var PORTAL_KEY = 'change-me-to-a-long-random-string';    // <-- change me; must match kitchen.html / reconciler

var SHEET_ORDERS = 'Orders';
var SHEET_PREP = 'Prep';

var HEADERS = [
  'OrderID', 'ReceivedAt', 'DeliveryDate', 'DeliveryLabel',
  'Name', 'Unit', 'Phone',
  'Soyrizo', 'SoyrizoAvo', 'Cali', 'Heavy', 'HeavyAvo',
  'Total', 'Paid', 'PaidAt', 'PaidRef'
];

function isoNow() {
  return Utilities.formatDate(new Date(), 'America/Los_Angeles', "yyyy-MM-dd'T'HH:mm:ss");
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'markPaid') { return markPaid(data); }
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

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  var orderId = data.orderId || ('BB-R' + sheet.getLastRow());
  sheet.appendRow([
    orderId, isoNow(), data.deliveryDate || '', data.deliverySunday || '',
    data.name || '', data.unit || '', data.phone || '',
    qty.soyrizo, qty.soyrizoAvo, qty.cali, qty.heavy, qty.heavyAvo,
    data.total || 0, 'NO', '', ''
  ]);

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: 'Burrito order ' + orderId + ' â€” ' + (data.name || '?') + ' (Unit ' + (data.unit || '?') + ') $' + data.total,
    body:
      'Order ID: ' + orderId + '\n' +
      'Delivery: ' + data.deliverySunday + ' (' + data.deliveryDate + ')\n' +
      'Name: ' + data.name + '\nUnit: ' + data.unit + '\nPhone: ' + (data.phone || '-') + '\n\n' +
      'Soyrizo: ' + qty.soyrizo + ' (with avo: ' + qty.soyrizoAvo + ')\n' +
      'Cali: ' + qty.cali + '\n' +
      'Heavyweight: ' + qty.heavy + ' (with avo: ' + qty.heavyAvo + ')\n\n' +
      'TOTAL: $' + data.total + '\n\n' +
      'Payment status updates happen via the kitchen portal or the reconciler â€” do not edit the sheet by hand.'
  });

  return json({ ok: true, orderId: orderId });
}

/** Programmatic payment marking. {action:'markPaid', key, orderId, ref} */
function markPaid(data) {
  if (data.key !== PORTAL_KEY) { return json({ ok: false, error: 'bad key' }); }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS);
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.orderId)) {
      sheet.getRange(i + 1, 14).setValue('YES');                       // N Paid
      sheet.getRange(i + 1, 15).setValue(isoNow());                    // O PaidAt
      sheet.getRange(i + 1, 16).setValue(String(data.ref || 'api'));   // P PaidRef
      return json({ ok: true, orderId: data.orderId });
    }
  }
  return json({ ok: false, error: 'order not found: ' + data.orderId });
}

/** Kitchen portal / reconciler read. GET ?key=...&date=2026-08-09 (date optional = all) */
function doGet(e) {
  if (!e.parameter || e.parameter.key !== PORTAL_KEY) { return json({ ok: false, error: 'bad key' }); }
  var date = e.parameter.date || '';
  var rows = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ORDERS).getDataRange().getValues();
  var orders = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (date && String(r[2]) !== date) continue;
    orders.push({
      orderId: String(r[0]), receivedAt: String(r[1]),
      deliveryDate: String(r[2]), deliveryLabel: String(r[3]),
      name: String(r[4]), unit: String(r[5]), phone: String(r[6]),
      soyrizo: Number(r[7]) || 0, soyrizoAvo: Number(r[8]) || 0,
      cali: Number(r[9]) || 0, heavy: Number(r[10]) || 0, heavyAvo: Number(r[11]) || 0,
      total: Number(r[12]) || 0,
      paid: String(r[13]).toUpperCase() === 'YES',
      paidAt: String(r[14] || ''), paidRef: String(r[15] || '')
    });
  }
  return json({ ok: true, orders: orders });
}

/** Run once to create the tabs. Safe to re-run; won't wipe order data. */
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var orders = ss.getSheetByName(SHEET_ORDERS) || ss.insertSheet(SHEET_ORDERS);
  if (orders.getLastRow() === 0) {
    orders.appendRow(HEADERS);
    orders.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    orders.setFrozenRows(1);
  }

  var prep = ss.getSheetByName(SHEET_PREP) || ss.insertSheet(SHEET_PREP);
  prep.clear();
  var rows = [
    ['BOB\'S BURRITOS â€” PREP SHEET (read-only mirror; the portal is the primary view)', ''],
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
