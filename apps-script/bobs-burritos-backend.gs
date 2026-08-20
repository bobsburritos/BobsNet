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

/* Email + confirmation tracking are trailing columns Q–U so Prep SUMIFS (H–N) stay valid
   on existing sheets. Never insert columns before R — the Prep formulas are positional. */
var HEADERS = [
  'OrderID', 'ReceivedAt', 'DeliveryDate', 'DeliveryLabel',
  'Name', 'Unit', 'Phone',
  'Soyrizo', 'SoyrizoAvo', 'Cali', 'Heavy', 'HeavyAvo',
  'Total', 'Paid', 'PaidAt', 'PaidRef',
  'Email', 'EmailStatus', 'EmailSentAt', 'EmailAttempts', 'EmailLastError', 'EmailDraftId'
];
var COL_EMAIL = 17;         /* 1-based (Q) */
var COL_EMAIL_STATUS = 18;  /* R */
var COL_EMAIL_SENT_AT = 19; /* S */
var COL_EMAIL_ATTEMPTS = 20;/* T */
var COL_EMAIL_ERROR = 21;   /* U */
var COL_EMAIL_DRAFT_ID = 22;/* V */

/* Confirmation email status values (column R).
   SENT    - customer has their receipt. Terminal.
   PENDING - send failed but is retryable; the sweeper will keep trying.
   DRAFTED - send quota was gone, so a ready-to-go draft sits in Gmail. Hit Send.
   FAILED  - gave up after MAX_EMAIL_ATTEMPTS. Needs a human (kitchen "resend").
   NOEMAIL - no usable address on the row. Not retryable.
   LEGACY  - row predates confirmation tracking. Never auto-mailed (see backfill). */
var EMAIL_SENT = 'SENT';
var EMAIL_PENDING = 'PENDING';
var EMAIL_DRAFTED = 'DRAFTED';
var EMAIL_FAILED = 'FAILED';
var EMAIL_NOEMAIL = 'NOEMAIL';
var EMAIL_LEGACY = 'LEGACY';

/**
 * Draft fallback. When the Apps Script send quota (~100/day on a consumer Gmail) is gone,
 * write the receipt into Gmail Drafts instead of just waiting for midnight.
 *
 * This works because a draft is not a send: creating one costs a Gmail read/write call
 * (~20,000/day) rather than a send credit. Sending it by hand from the Gmail UI then
 * draws on Gmail's own limit (~500/day), which is a separate and much larger bucket
 * than the one Apps Script gives us. So this is real extra headroom, not a loophole.
 *
 * Set false to go back to pure auto-retry.
 */
var DRAFT_FALLBACK = true;

/**
 * Test hook: pretend the send quota is gone.
 *
 * Deliberately a plain global, never a Script Property. Apps Script resets globals
 * between executions, so this cannot survive the function that sets it — there is no
 * way to leave production wedged in "always draft" mode by forgetting to reset it.
 * Only testDraftFlowEndToEndFromEditor() sets it.
 */
var FORCE_QUOTA_BLOCK = false;

var MAX_EMAIL_ATTEMPTS = 6;      /* total attempts before FAILED */
var INLINE_EMAIL_ATTEMPTS = 2;   /* attempts during the order POST itself */
var INLINE_RETRY_SLEEP_MS = 900; /* keep the web app response well under its limit */
var RETRY_WINDOW_DAYS = 14;      /* sweeper ignores rows older than this */
var QUOTA_RESERVE = 3;           /* leave headroom so kitchen resend still works */

/* Appended to EmailLastError once the owner has actually been told about a FAILED row.
   Stored on the row (not in memory) because the alert usually needs to be sent while
   mail is broken — it has to survive and be retried until it genuinely gets out. */
var ALERT_SENTINEL = ' [owner notified]';

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
    ensureTrailingColumns(orders);
  }
  return orders;
}

/**
 * Add any missing trailing headers (Q–U) at their fixed positions.
 * Never inserts or shifts columns, so Prep's positional SUMIFS stay valid.
 *
 * When EmailStatus is created for the first time, every pre-existing data row is
 * backfilled to LEGACY. That guard matters: a blank status would otherwise look
 * "pending" to the sweeper and blast a duplicate confirmation at every past customer.
 */
function ensureTrailingColumns(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, Math.max(lastCol, HEADERS.length)).getValues()[0];
  var have = {};
  for (var i = 0; i < headers.length; i++) {
    var h = String(headers[i] || '').toLowerCase();
    if (h) have[h] = i + 1;
  }

  var statusWasMissing = !have['emailstatus'];
  var tracked = [
    { name: 'Email', col: COL_EMAIL },
    { name: 'EmailStatus', col: COL_EMAIL_STATUS },
    { name: 'EmailSentAt', col: COL_EMAIL_SENT_AT },
    { name: 'EmailAttempts', col: COL_EMAIL_ATTEMPTS },
    { name: 'EmailLastError', col: COL_EMAIL_ERROR },
    { name: 'EmailDraftId', col: COL_EMAIL_DRAFT_ID }
  ];
  for (var t = 0; t < tracked.length; t++) {
    if (!have[tracked[t].name.toLowerCase()]) {
      sheet.getRange(1, tracked[t].col).setValue(tracked[t].name).setFontWeight('bold');
    }
  }

  if (statusWasMissing) {
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var n = lastRow - 1;
      var fill = [];
      for (var r = 0; r < n; r++) fill.push([EMAIL_LEGACY]);
      sheet.getRange(2, COL_EMAIL_STATUS, n, 1).setValues(fill);
    }
  }
  return COL_EMAIL;
}

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isValidPhone(s) {
  var digits = String(s || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.substring(1);
  return digits.length === 10;
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

function esc_(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * HTML twin of customerEmailBody. Sent alongside the plain-text part.
 * A multipart message with a real receipt layout is markedly less likely to be
 * filed as spam than a bare text blob — and this mail is the customer's only receipt.
 * Brand colors per .claude/02_brand_kit.md — do not substitute.
 */
function customerEmailHtml(kind, o, extraNote) {
  var GRAPE = '#3D1A5C', SUN = '#FFD23F', CREAM = '#FFF4DC', ORANGE = '#FF8A3D';
  var payNote = o.orderId + ' | ' + o.name + ' | Unit ' + o.unit + ' | $' + o.total;
  var payBits = [];
  if (VENMO_USERNAME) payBits.push('Venmo <strong>@' + esc_(VENMO_USERNAME) + '</strong>');
  if (ZELLE_TO) payBits.push('Zelle <strong>' + esc_(ZELLE_TO) + '</strong>');
  var payTo = payBits.length ? payBits.join(' or ') : 'Venmo / Zelle (see order page)';

  var heading, lead;
  if (kind === 'payment') {
    heading = 'Payment needed';
    lead = 'We still need payment for this order so we can cook it.';
  } else if (kind === 'delivery') {
    heading = 'Delivery update';
    lead = 'Your order is on the Sunday delivery run.';
  } else {
    heading = 'Order received';
    lead = 'Thanks for ordering — here is your receipt. Keep it for your records.';
  }

  var itemRows = '';
  var lines = (o.itemLines && o.itemLines.length) ? o.itemLines : [];
  for (var i = 0; i < lines.length; i++) {
    itemRows +=
      '<tr><td style="padding:6px 0;border-bottom:1px solid rgba(61,26,92,.12);font-size:15px">' +
      esc_(lines[i]) + '</td></tr>';
  }
  if (!itemRows) {
    itemRows = '<tr><td style="padding:6px 0;font-size:15px">See your order ID below.</td></tr>';
  }

  var noteBlock = extraNote
    ? '<p style="margin:16px 0 0;padding:12px;background:' + CREAM + ';border-radius:8px;font-size:14px">' +
      '<strong>Note from the kitchen:</strong><br>' + esc_(extraNote) + '</p>'
    : '';

  var payBlock = (kind === 'delivery') ? '' : (
    '<p style="margin:18px 0 6px;font-size:15px">Please pay by <strong>Saturday 3:00 PM</strong> ' +
    '(America/Los_Angeles) via ' + payTo + '.</p>' +
    '<p style="margin:0 0 6px;font-size:14px">Paste this exact note in the memo so we can match your payment:</p>' +
    '<p style="margin:0;padding:12px;background:' + GRAPE + ';color:' + SUN +
    ';border-radius:8px;font-family:Consolas,Menlo,monospace;font-size:14px;word-break:break-all">' +
    esc_(payNote) + '</p>' +
    '<p style="margin:12px 0 0;font-size:13px;color:#8a2f2f"><strong>No payment by the cutoff = we don\'t cook that order.</strong></p>'
  );

  return (
    '<!doctype html><html><body style="margin:0;padding:0;background:' + CREAM + '">' +
    '<div style="max-width:560px;margin:0 auto;padding:24px 20px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:' + GRAPE + '">' +
      '<div style="background:' + GRAPE + ';border-radius:14px;padding:20px;text-align:center">' +
        '<div style="font-size:22px;font-weight:800;color:' + SUN + '">Bob\'s Burritos</div>' +
        '<div style="font-size:13px;color:' + CREAM + ';opacity:.85">1111 Wilshire &middot; woman-owned</div>' +
      '</div>' +
      '<h1 style="font-size:20px;margin:22px 0 6px">' + esc_(heading) + ' &mdash; ' + esc_(o.orderId) + '</h1>' +
      '<p style="margin:0 0 14px;font-size:15px">Hi ' + esc_(o.name) + ', ' + esc_(lead) + '</p>' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">' +
        itemRows +
        '<tr><td style="padding:10px 0;font-size:17px;font-weight:800">Total: $' + esc_(o.total) + '</td></tr>' +
      '</table>' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" ' +
        'style="border-collapse:collapse;margin:10px 0 0;font-size:14px">' +
        '<tr><td style="padding:4px 0;opacity:.7">Order ID</td><td style="padding:4px 0;text-align:right;font-weight:700">' + esc_(o.orderId) + '</td></tr>' +
        '<tr><td style="padding:4px 0;opacity:.7">Unit</td><td style="padding:4px 0;text-align:right;font-weight:700">' + esc_(o.unit) + '</td></tr>' +
        '<tr><td style="padding:4px 0;opacity:.7">Delivery</td><td style="padding:4px 0;text-align:right;font-weight:700">' + esc_(o.deliveryLabel) + '</td></tr>' +
        '<tr><td style="padding:4px 0;opacity:.7">Window</td><td style="padding:4px 0;text-align:right;font-weight:700">Sunday 9 AM&ndash;12 PM LA</td></tr>' +
      '</table>' +
      payBlock +
      noteBlock +
      '<hr style="border:0;border-top:1px solid rgba(61,26,92,.15);margin:22px 0 12px">' +
      '<p style="margin:0;font-size:12px;opacity:.7">Questions? <a href="mailto:' + esc_(OWNER_EMAIL) +
        '" style="color:' + ORANGE + '">' + esc_(OWNER_EMAIL) + '</a> &mdash; include your order ID.<br>' +
        'You received this because you placed an order and gave this address for order updates only. ' +
        'Transactional message, not marketing.</p>' +
    '</div></body></html>'
  );
}

/**
 * Send one customer mail. Never throws.
 * Returns { ok, error, retryable } so callers can tell "try again later" apart from
 * "this will never work" — the whole point of the retry queue.
 */
function sendCustomerMail(to, subject, body, htmlBody) {
  if (!to || !isValidEmail(to)) {
    return { ok: false, retryable: false, error: 'no valid address' };
  }
  if (FORCE_QUOTA_BLOCK) {
    return {
      ok: false, retryable: true, quotaBlocked: true,
      error: 'forced quota block (test hook)'
    };
  }
  var remaining = -1;
  try {
    remaining = MailApp.getRemainingDailyQuota();
  } catch (qErr) {
    remaining = -1; /* quota unreadable - fall through and let the send decide */
  }
  if (remaining >= 0 && remaining <= QUOTA_RESERVE) {
    /* quotaBlocked means MailApp was never called, so this must NOT count against the
       attempt cap. Gmail quota resets at midnight PT; burning 6 attempts in an hour
       would strand a whole day of receipts that would have sent fine tomorrow. */
    return {
      ok: false,
      retryable: true,
      quotaBlocked: true,
      error: 'gmail daily quota exhausted (' + remaining + ' left) - queued for retry'
    };
  }
  try {
    var payload = {
      to: to,
      subject: subject,
      body: body,
      replyTo: OWNER_EMAIL,
      name: "Bob's Burritos"
    };
    if (htmlBody) payload.htmlBody = htmlBody;
    MailApp.sendEmail(payload);
    return { ok: true, error: '', retryable: false };
  } catch (err) {
    return { ok: false, retryable: true, error: String(err && err.message ? err.message : err) };
  }
}

/**
 * Park the receipt in Gmail Drafts so the owner can send it by hand.
 * Costs a Gmail read/write call, not a send credit — see DRAFT_FALLBACK.
 * Never throws.
 */
function createCustomerDraft_(to, subject, body, htmlBody) {
  if (!to || !isValidEmail(to)) {
    return { ok: false, error: 'no valid address' };
  }
  try {
    var opts = { name: "Bob's Burritos", replyTo: OWNER_EMAIL };
    if (htmlBody) opts.htmlBody = htmlBody;
    var draft = GmailApp.createDraft(to, subject, body, opts);
    return { ok: true, draftId: String(draft.getId()) };
  } catch (err) {
    return { ok: false, error: String(err && err.message ? err.message : err) };
  }
}

/**
 * Is that draft still sitting in Gmail?
 * false means it is gone — the owner sent it (or deleted it), which is how a DRAFTED
 * row gets reconciled to SENT without any button to press.
 */
function draftStillExists_(draftId) {
  if (!draftId) return false;
  try {
    return !!GmailApp.getDraft(String(draftId));
  } catch (err) {
    return false; /* getDraft throws once the draft no longer exists */
  }
}

/**
 * Retry wrapper: most MailApp failures are transient and clear on an immediate second try.
 * res.attempts counts only real MailApp invocations — quota-blocked tries are free, so a
 * quota outage delays a receipt without ever exhausting its attempt budget.
 *
 * On a quota block it falls back to a Gmail draft, so the receipt is one click away
 * instead of hostage to the midnight reset.
 */
function attemptCustomerMail(to, subject, body, htmlBody, tries) {
  var billable = 0;
  var res = { ok: false, retryable: true, error: 'not attempted' };
  var max = tries > 0 ? tries : 1;
  for (var i = 0; i < max; i++) {
    res = sendCustomerMail(to, subject, body, htmlBody);
    if (!res.quotaBlocked) billable++;
    /* no point retrying a quota block in-process, and a hard failure won't change */
    if (res.ok || !res.retryable || res.quotaBlocked) break;
    if (i < max - 1) Utilities.sleep(INLINE_RETRY_SLEEP_MS);
  }
  res.attempts = billable;

  if (!res.ok && res.quotaBlocked && DRAFT_FALLBACK) {
    var d = createCustomerDraft_(to, subject, body, htmlBody);
    if (d.ok) {
      res.drafted = true;
      res.draftId = d.draftId;
      res.error = 'send quota gone - receipt drafted in Gmail, needs manual Send';
    } else {
      res.draftError = d.error;
    }
  }
  return res;
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
  if (!phone || !isValidPhone(phone)) return json({ ok: false, error: 'valid phone required' });
  if (!isValidOrderId(orderId)) return json({ ok: false, error: 'bad orderId' });
  if (deliveryDate && !isValidDateISO(deliveryDate)) return json({ ok: false, error: 'bad deliveryDate' });
  if (deliveryDate === '2026-08-23' || deliveryDate === '2026-08-30') {
    return json({ ok: false, error: 'kitchen closed that Sunday — first delivery back is Sunday, September 6' });
  }

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

  /* Row first, mail second. The order must survive even if every send attempt fails,
     and it lands as PENDING so the sweeper owns it from this moment on. */
  sheet.appendRow([
    orderId, isoNow(), deliveryDate, deliveryLabel,
    name, unit, phone,
    qty.soyrizo, qty.soyrizoAvo, qty.cali, qty.heavy, qty.heavyAvo,
    total, 'NO', '', '',
    email, EMAIL_PENDING, '', 0, ''
  ]);
  var row = sheet.getLastRow();
  sheet.getRange(row, 3).setNumberFormat('@').setValue(deliveryDate);
  sheet.getRange(row, COL_EMAIL).setValue(email);
  SpreadsheetApp.flush();

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
     Kitchen uses the sheet + kitchen portal; scheduled digest: sendKitchenDigest(). */
  var mail = attemptCustomerMail(
    email,
    "Bob's Burritos — order " + orderId + ' received ($' + total + ')',
    customerEmailBody('received', custObj, ''),
    customerEmailHtml('received', custObj, ''),
    INLINE_EMAIL_ATTEMPTS
  );
  recordEmailOutcome(sheet, row, mail, 0);

  return json({
    ok: true,
    orderId: orderId,
    total: total,
    customerEmailed: mail.ok,
    /* queued=true means "not sent yet, but the retry sweeper will keep trying" —
       the page uses this to promise a retry instead of implying the receipt is lost. */
    emailQueued: !mail.ok && mail.retryable,
    emailStatus: mail.ok ? EMAIL_SENT : (mail.retryable ? EMAIL_PENDING : EMAIL_NOEMAIL)
  });
}

/**
 * Write the outcome of a send attempt onto the order row.
 * priorAttempts lets the sweeper accumulate rather than reset the counter.
 * Wrapped so a sheet write failure can never turn a delivered email into an error response.
 */
function recordEmailOutcome(sheet, row, mail, priorAttempts) {
  try {
    /* mail.attempts is 0 for a quota block, so a quota outage never advances the cap. */
    var attempts = (priorAttempts || 0) + (mail.attempts || 0);
    var status;
    if (mail.ok) {
      status = EMAIL_SENT;
    } else if (mail.drafted) {
      status = EMAIL_DRAFTED;
    } else if (!mail.retryable) {
      status = EMAIL_NOEMAIL;
    } else if (attempts >= MAX_EMAIL_ATTEMPTS) {
      status = EMAIL_FAILED;
    } else {
      status = EMAIL_PENDING;
    }
    sheet.getRange(row, COL_EMAIL_STATUS).setValue(status);
    sheet.getRange(row, COL_EMAIL_ATTEMPTS).setValue(attempts);
    if (mail.ok) {
      sheet.getRange(row, COL_EMAIL_SENT_AT).setValue(isoNow());
      sheet.getRange(row, COL_EMAIL_ERROR).setValue('');
    } else {
      sheet.getRange(row, COL_EMAIL_ERROR).setValue(cleanStr(mail.error, 250));
    }
    if (mail.draftId) sheet.getRange(row, COL_EMAIL_DRAFT_ID).setValue(mail.draftId);
    return status;
  } catch (err) {
    return mail.ok ? EMAIL_SENT : EMAIL_PENDING;
  }
}

/** Whole days between an ISO-ish ReceivedAt and today in LA. -1 when unparseable. */
function ageInDays_(text) {
  var m = String(text || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return -1;
  var then = new Date(+m[1], +m[2] - 1, +m[3]);
  var t = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd').split('-');
  var now = new Date(+t[0], +t[1] - 1, +t[2]);
  return Math.floor((now - then) / 86400000);
}

/** Build the customer-mail object from an Orders row (shared by resend + sweeper). */
function orderObjFromRow_(r) {
  var qty = {
    soyrizo: Number(r[7]) || 0,
    soyrizoAvo: Number(r[8]) || 0,
    cali: Number(r[9]) || 0,
    heavy: Number(r[10]) || 0,
    heavyAvo: Number(r[11]) || 0
  };
  return {
    orderId: String(r[0] || ''),
    name: String(r[4] || ''),
    unit: String(r[5] || ''),
    email: rowEmail(r),
    deliveryDate: cellText(r[2], true),
    deliveryLabel: cellText(r[3], false),
    total: Number(r[12]) || 0,
    itemLines: orderLinesFromQty(qty)
  };
}

/**
 * Drain the confirmation queue: retry every PENDING row until it sends or gives up.
 * This is what makes the receipt guarantee hold — a Gmail hiccup or an exhausted daily
 * quota only delays the confirmation now, it no longer loses it.
 *
 * Runs on a time trigger; install once with installConfirmationRetryTrigger().
 *
 * Safety properties:
 *  - Script lock, so two overlapping sweeps can't double-send.
 *  - Only status PENDING is touched. SENT is terminal; LEGACY/NOEMAIL are never mailed;
 *    FAILED waits for a human via the kitchen "resend" button.
 *  - Status flips to SENT immediately after a successful send.
 *  - Bounded by MAX_EMAIL_ATTEMPTS and RETRY_WINDOW_DAYS, so nothing retries forever.
 *  - Stops the moment quota runs low, leaving the rest PENDING for the next sweep.
 */
function retryPendingConfirmations() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('retryPendingConfirmations: another sweep holds the lock, skipping');
    return { ok: true, skipped: 'locked' };
  }
  try {
    var sheet = ensureOrdersSheet();
    var rows = sheet.getDataRange().getValues();
    var sent = 0, stillPending = 0, gaveUp = 0, scanned = 0, drafted = 0;
    var draftsWaiting = 0, draftsResolved = 0;
    var quotaStopped = false;

    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var rowNum = i + 1;
      var status = String(r[COL_EMAIL_STATUS - 1] || '').toUpperCase();

      /* A drafted receipt is waiting on a human. Don't re-send it (that would duplicate
         what they are about to send by hand) — just watch for the draft to disappear,
         which means they hit Send and the row can settle to SENT on its own. */
      if (status === EMAIL_DRAFTED) {
        var did = String(r[COL_EMAIL_DRAFT_ID - 1] || '');
        if (did && !draftStillExists_(did)) {
          sheet.getRange(rowNum, COL_EMAIL_STATUS).setValue(EMAIL_SENT);
          sheet.getRange(rowNum, COL_EMAIL_SENT_AT).setValue(isoNow());
          sheet.getRange(rowNum, COL_EMAIL_ERROR).setValue('draft no longer in Gmail - treated as sent by hand');
          draftsResolved++;
        } else {
          draftsWaiting++;
        }
        continue;
      }

      if (status !== EMAIL_PENDING) continue;
      scanned++;

      var attempts = Number(r[COL_EMAIL_ATTEMPTS - 1]) || 0;
      var orderId = String(r[0] || '');
      var to = rowEmail(r);

      if (!to || !isValidEmail(to)) {
        sheet.getRange(rowNum, COL_EMAIL_STATUS).setValue(EMAIL_NOEMAIL);
        sheet.getRange(rowNum, COL_EMAIL_ERROR).setValue('no valid address on row');
        continue;
      }
      if (attempts >= MAX_EMAIL_ATTEMPTS) {
        sheet.getRange(rowNum, COL_EMAIL_STATUS).setValue(EMAIL_FAILED);
        gaveUp++;
        continue;
      }
      var age = ageInDays_(cellText(r[1], false));
      if (age > RETRY_WINDOW_DAYS) {
        sheet.getRange(rowNum, COL_EMAIL_STATUS).setValue(EMAIL_FAILED);
        sheet.getRange(rowNum, COL_EMAIL_ERROR)
          .setValue('stale: ' + age + ' days unsent, past ' + RETRY_WINDOW_DAYS + '-day retry window');
        gaveUp++;
        continue;
      }

      var o = orderObjFromRow_(r);
      var mail = attemptCustomerMail(
        to,
        "Bob's Burritos — order " + orderId + ' received ($' + o.total + ')',
        customerEmailBody('received', o, ''),
        customerEmailHtml('received', o, ''),
        1
      );
      var newStatus = recordEmailOutcome(sheet, rowNum, mail, attempts);
      if (mail.ok) {
        sent++;
      } else if (newStatus === EMAIL_DRAFTED) {
        /* Quota is account-wide, so every remaining row would draft too. Keep going —
           drafting is cheap and the point is to get every receipt within one click. */
        drafted++;
        draftsWaiting++;
        quotaStopped = true;
      } else if (newStatus === EMAIL_FAILED) {
        gaveUp++;
      } else {
        stillPending++;
        /* Quota is account-wide: if this row is blocked, every later row is too.
           Stop the sweep and leave them PENDING for after the midnight PT reset. */
        if (mail.quotaBlocked) { quotaStopped = true; break; }
      }
    }

    SpreadsheetApp.flush();
    /* Runs every sweep, not just on the transition, so an alert that could not be sent
       while mail was down is retried until it actually reaches the owner. */
    var alerted = notifyPendingFailureAlerts_(sheet);

    var result = {
      ok: true, scanned: scanned, sent: sent,
      stillPending: stillPending, gaveUp: gaveUp,
      drafted: drafted, draftsWaiting: draftsWaiting, draftsResolved: draftsResolved,
      quotaStopped: quotaStopped, alerted: alerted
    };
    Logger.log('retryPendingConfirmations: ' + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log('retryPendingConfirmations error: ' + err);
    return { ok: false, error: String(err) };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Alert the owner about every FAILED row not yet marked as notified, then mark them.
 * Only marks after the alert genuinely sends, so a swallowed alert is retried next sweep.
 * Returns how many rows were covered by a successfully delivered alert.
 */
function notifyPendingFailureAlerts_(sheet) {
  var rows = sheet.getDataRange().getValues();
  var targets = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[COL_EMAIL_STATUS - 1] || '').toUpperCase() !== EMAIL_FAILED) continue;
    var err = String(r[COL_EMAIL_ERROR - 1] || '');
    if (err.indexOf(ALERT_SENTINEL) !== -1) continue; /* already told */
    targets.push({
      rowNum: i + 1,
      err: err,
      line: String(r[0] || '') + ' · ' + rowEmail(r) + ' · ' + (err || 'send failed')
    });
  }
  if (!targets.length) return 0;

  var lines = [];
  for (var t = 0; t < targets.length; t++) lines.push(targets[t].line);
  if (!alertOwnerConfirmationFailures_(lines)) return 0; /* try again next sweep */

  for (var m = 0; m < targets.length; m++) {
    try {
      sheet.getRange(targets[m].rowNum, COL_EMAIL_ERROR)
        .setValue(cleanStr(targets[m].err + ALERT_SENTINEL, 250));
    } catch (e) {}
  }
  return targets.length;
}

/** Tell the owner which confirmations are beyond automatic recovery. Returns true if sent. */
function alertOwnerConfirmationFailures_(list) {
  try {
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: "Bob's Burritos — ACTION: " + list.length + ' confirmation email(s) could not be sent',
      name: "Bob's Burritos Kitchen",
      body:
        'These customers placed an order but never received their confirmation, and automatic\n' +
        'retries have stopped. The confirmation is their only receipt.\n\n' +
        list.join('\n') + '\n\n' +
        'Fix: open the kitchen portal, find the order, and use "Email" > resend order confirmation.\n' +
        'If sends keep failing, check the Gmail daily quota for this account.\n\n' +
        'Orders are safe in the sheet either way — only the receipt is missing.'
    });
    return true;
  } catch (err) {
    Logger.log('alertOwnerConfirmationFailures_ could not send: ' + err);
    return false;
  }
}

/**
 * Install (or reinstall) the confirmation retry sweep: every 10 minutes.
 * Run once from the Apps Script editor after deploy.
 */
function installConfirmationRetryTrigger() {
  var handlers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < handlers.length; i++) {
    if (handlers[i].getHandlerFunction() === 'retryPendingConfirmations') {
      ScriptApp.deleteTrigger(handlers[i]);
    }
  }
  ScriptApp.newTrigger('retryPendingConfirmations')
    .timeBased()
    .everyMinutes(10)
    .create();
  Logger.log('Confirmation retry sweep installed: every 10 minutes');
}

/** One-call setup for both scheduled jobs. Run once from the editor after deploy. */
function installAllTriggers() {
  installKitchenDigestTrigger();
  installConfirmationRetryTrigger();
  Logger.log('All triggers installed. Confirmation queue is now self-draining.');
}

/** Editor helper: what is the confirmation queue doing right now? */
function confirmationHealthFromEditor() {
  Logger.log(JSON.stringify(confirmationHealth_(), null, 2));
}

/** Counts by email status for the whole sheet, plus remaining Gmail quota. */
function confirmationHealth_() {
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  var counts = {};
  var failedIds = [];
  var draftIds = [];
  for (var i = 1; i < rows.length; i++) {
    var s = String(rows[i][COL_EMAIL_STATUS - 1] || '(blank)').toUpperCase();
    counts[s] = (counts[s] || 0) + 1;
    if (s === EMAIL_FAILED) failedIds.push(String(rows[i][0] || ''));
    if (s === EMAIL_DRAFTED) draftIds.push(String(rows[i][0] || ''));
  }
  var quota = -1;
  try { quota = MailApp.getRemainingDailyQuota(); } catch (e) {}
  return {
    counts: counts,
    failed: failedIds,
    draftsAwaitingSend: draftIds,
    remainingDailyQuota: quota,
    hint: draftIds.length
      ? 'Open Gmail > Drafts and hit Send on ' + draftIds.length + ' receipt(s).'
      : (quota === 0 ? 'Send quota gone. New receipts will be drafted for manual send.' : 'ok')
  };
}

/**
 * Proves the draft fallback works in THIS account, right now.
 * Safe to run at any time: it creates one draft addressed to the owner and deletes it
 * again, so nothing is sent and no customer is touched.
 *
 * Run this while remainingDailyQuota is 0 — a success then is direct evidence that
 * drafting does not consume send quota.
 */
function testDraftFallbackFromEditor() {
  var quota = -1;
  try { quota = MailApp.getRemainingDailyQuota(); } catch (e) {}
  var d = createCustomerDraft_(
    OWNER_EMAIL,
    "Bob's Burritos — draft fallback self-test",
    'If you can read this in Gmail > Drafts, the draft fallback works.\nThis draft deletes itself.',
    '<p>Draft fallback works. This draft deletes itself.</p>'
  );
  var verdict;
  if (d.ok) {
    var existed = draftStillExists_(d.draftId);
    try { GmailApp.getDraft(d.draftId).deleteDraft(); } catch (e2) {}
    verdict = {
      remainingDailyQuota: quota,
      draftCreated: true,
      draftReadBack: existed,
      cleanedUp: !draftStillExists_(d.draftId),
      conclusion: quota === 0
        ? 'CONFIRMED: drafting works with zero send quota left.'
        : 'Drafting works. Re-run at quota 0 to confirm independence from send quota.'
    };
  } else {
    verdict = {
      remainingDailyQuota: quota,
      draftCreated: false,
      error: d.error,
      conclusion: 'Draft fallback unavailable. Most likely the Gmail scope was not granted - '
        + 're-run installAllTriggers() and approve the prompts.'
    };
  }
  Logger.log(JSON.stringify(verdict, null, 2));
  return verdict;
}

/**
 * End-to-end test of the draft path without burning ~100 emails to reach quota 0.
 *
 * Forces one order down the quota-blocked branch and checks the whole chain: the row
 * lands DRAFTED, a real draft appears in Gmail, and the draft id is recorded in column V.
 * Addressed to OWNER_EMAIL, so no customer is involved. Nothing is sent.
 *
 * Leaves a BB-DRAFTTEST row on Orders on purpose — go hit Send on the draft, wait for
 * the next sweep, and watch that row settle to SENT by itself. That is the half of the
 * design a unit test cannot show you. Clean up afterwards with cleanupTestsFromEditor().
 *
 * What this does NOT prove: that Google still permits createDraft when the send quota is
 * genuinely 0. Real quota is untouched here. That one only gets confirmed by running
 * testDraftFallbackFromEditor() on a day you actually hit the cap.
 */
function testDraftFlowEndToEndFromEditor() {
  var TEST_ID = 'BB-DRAFTTEST';
  var sheet = ensureOrdersSheet();

  /* Clear any previous run, otherwise insertOrder dedupes and tests nothing. */
  var rows = sheet.getDataRange().getValues();
  for (var i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === TEST_ID) sheet.deleteRow(i + 1);
  }
  SpreadsheetApp.flush();

  var out;
  FORCE_QUOTA_BLOCK = true;
  try {
    var res = JSON.parse(insertOrder({
      orderId: TEST_ID,
      name: 'DRAFT FALLBACK TEST',
      unit: '000',
      email: OWNER_EMAIL,
      deliveryDate: nextSundayISO_(),
      deliverySunday: 'Draft fallback test',
      items: [{ id: 'cali', qty: 1 }]
    }).getContent());

    /* Re-read so we assert what actually landed on the sheet, not what we hoped. */
    var after = sheet.getDataRange().getValues();
    var found = null, foundRow = -1;
    for (var j = 1; j < after.length; j++) {
      if (String(after[j][0]) === TEST_ID) { found = after[j]; foundRow = j + 1; break; }
    }

    var status = found ? String(found[COL_EMAIL_STATUS - 1] || '') : '(row missing)';
    var draftId = found ? String(found[COL_EMAIL_DRAFT_ID - 1] || '') : '';
    var attempts = found ? Number(found[COL_EMAIL_ATTEMPTS - 1]) || 0 : -1;
    var draftLives = draftStillExists_(draftId);

    var okAll = (status === EMAIL_DRAFTED) && !!draftId && draftLives &&
                (attempts === 0) && (res.ok === true) && (res.customerEmailed === false);

    out = {
      orderAccepted: res.ok === true,
      orderRow: foundRow,
      emailStatus: status,
      emailAttempts: attempts,
      draftIdRecorded: draftId || '(none)',
      draftPresentInGmail: draftLives,
      quotaUntouched: (function () {
        try { return MailApp.getRemainingDailyQuota(); } catch (e) { return -1; }
      })(),
      verdict: okAll ? 'PASS' : 'FAIL',
      nextStep: okAll
        ? 'Open Gmail > Drafts, Send the "' + TEST_ID + '" receipt, wait ~10 min, then ' +
          'check Orders row ' + foundRow + ': EmailStatus should flip to SENT on its own. ' +
          'Then run cleanupTestsFromEditor() to remove the test row.'
        : 'Something is off - read the fields above. A missing draftId with ' +
          'draftPresentInGmail=false usually means the Gmail scope was not granted.'
    };
  } catch (err) {
    out = { verdict: 'ERROR', error: String(err) };
  } finally {
    FORCE_QUOTA_BLOCK = false; /* redundant - globals reset per execution - but explicit */
  }

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/** Editor helper: which receipts are sitting in Drafts waiting for a manual Send? */
function listDraftedReceiptsFromEditor() {
  var h = confirmationHealth_();
  Logger.log(
    'Receipts awaiting manual Send: ' + h.draftsAwaitingSend.length + '\n' +
    (h.draftsAwaitingSend.length ? h.draftsAwaitingSend.join('\n') : '(none)') + '\n\n' +
    'Open Gmail > Drafts, hit Send on each. The next sweep notices they are gone\n' +
    'and flips those rows to SENT by itself - nothing else to do.'
  );
  return h.draftsAwaitingSend;
}

/**
 * One kitchen email summarizing orders (not per-order).
 * Default schedule: daily 3:00 PM America/Los_Angeles — run installKitchenDigestTrigger() once.
 * Optional: pass deliveryDate 'yyyy-mm-dd' — otherwise next Sunday.
 */
function sendKitchenDigest(deliveryDateOpt) {
  var sheet = ensureOrdersSheet();
  var rows = sheet.getDataRange().getValues();
  var target = cleanStr(deliveryDateOpt || '', 12);
  if (target && !isValidDateISO(target)) target = '';
  if (!target) target = nextSundayISO_();

  var lines = [];
  var n = 0, unpaid = 0, revenue = 0, paidRev = 0, noReceipt = 0;
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var d = cellText(r[2], true);
    if (d !== target) continue;
    n++;
    var id = String(r[0] || '');
    var name = String(r[4] || '');
    var unit = String(r[5] || '');
    var phone = String(r[6] || '');
    var email = rowEmail(r);
    var total = Number(r[12]) || 0;
    var paid = String(r[13]).toUpperCase() === 'YES';
    var eStatus = String(r[COL_EMAIL_STATUS - 1] || '').toUpperCase();
    var receiptFlag = '';
    if (eStatus === EMAIL_PENDING) { receiptFlag = ' · RECEIPT RETRYING'; noReceipt++; }
    else if (eStatus === EMAIL_DRAFTED) { receiptFlag = ' · DRAFT READY - HIT SEND IN GMAIL'; noReceipt++; }
    else if (eStatus === EMAIL_FAILED) { receiptFlag = ' · !! NO RECEIPT - RESEND'; noReceipt++; }
    else if (eStatus === EMAIL_NOEMAIL) { receiptFlag = ' · no email on file'; noReceipt++; }
    revenue += total;
    if (paid) paidRev += total; else unpaid++;
    lines.push(
      (paid ? '[PAID] ' : '[UNPAID] ') + id + ' · Unit ' + unit + ' · ' + name +
      ' · $' + total + (email ? ' · ' + email : '') +
      (phone ? ' · ' + phone : ' · no phone on file') + receiptFlag
    );
  }

  var health = confirmationHealth_();
  var receiptLine = noReceipt
    ? 'CONFIRMATIONS: ' + noReceipt + ' order(s) for this date have no receipt yet (see flags below).\n'
    : 'Confirmations: all orders for this date have their receipt.\n';
  var failedLine = health.failed.length
    ? 'Needs manual resend (all dates): ' + health.failed.join(', ') + '\n'
    : '';
  var draftLine = health.draftsAwaitingSend.length
    ? 'DRAFTS WAITING IN GMAIL (just hit Send): ' + health.draftsAwaitingSend.join(', ') + '\n'
    : '';
  var quotaLine = health.remainingDailyQuota >= 0
    ? 'Gmail sends left today: ' + health.remainingDailyQuota + '\n'
    : '';

  var body =
    "Bob's Burritos — kitchen digest\n" +
    'Delivery date: ' + target + '\n' +
    'Orders: ' + n + ' · Unpaid: ' + unpaid + '\n' +
    'Revenue: $' + (Math.round(revenue * 100) / 100) +
    ' · Paid so far: $' + (Math.round(paidRev * 100) / 100) + '\n\n' +
    receiptLine + draftLine + failedLine + quotaLine + '\n' +
    (lines.length ? lines.join('\n') : '(no orders for this date)') + '\n\n' +
    'Open the kitchen portal for full board. Do not edit the sheet by hand.\n' +
    'Scheduled digest: daily 3:00 PM America/Los_Angeles (order cutoff hour).';

  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: "Bob's kitchen digest — " + target + ' (' + n + ' orders, ' + unpaid + ' unpaid)',
    body: body,
    name: "Bob's Burritos Kitchen"
  });
  return { ok: true, deliveryDate: target, orders: n, unpaid: unpaid };
}

/**
 * Install (or reinstall) a daily trigger: sendKitchenDigest at 3:00 PM LA.
 * Run once from the Apps Script editor after deploy. Authorizes mail + triggers.
 */
function installKitchenDigestTrigger() {
  var handlers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < handlers.length; i++) {
    if (handlers[i].getHandlerFunction() === 'sendKitchenDigest') {
      ScriptApp.deleteTrigger(handlers[i]);
    }
  }
  ScriptApp.newTrigger('sendKitchenDigest')
    .timeBased()
    .atHour(15)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone('America/Los_Angeles')
    .create();
  Logger.log('Kitchen digest trigger installed: daily 3:00 PM America/Los_Angeles');
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
    var o = orderObjFromRow_(r);
    var subjects = {
      received: "Bob's Burritos — order " + orderId + ' received ($' + o.total + ')',
      payment: "Bob's Burritos — payment needed for " + orderId,
      delivery: "Bob's Burritos — delivery update " + orderId
    };
    var mail = attemptCustomerMail(
      email,
      subjects[kind] || subjects.received,
      customerEmailBody(kind, o, note),
      customerEmailHtml(kind, o, note),
      INLINE_EMAIL_ATTEMPTS
    );

    /* A manual resend of the receipt clears the row's confirmation debt; payment and
       delivery notices are separate messages and must not overwrite receipt status. */
    if (kind === 'received') {
      recordEmailOutcome(sheet, i + 1, mail, Number(r[COL_EMAIL_ATTEMPTS - 1]) || 0);
    }
    if (!mail.ok) {
      return json({ ok: false, error: 'send failed: ' + mail.error, retryable: mail.retryable });
    }
    return json({ ok: true, orderId: orderId, kind: kind, to: email });
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
    if (id.indexOf('BB-SMOKE') === 0 || id.indexOf('BB-TEST') === 0 ||
        id.indexOf('BB-DRAFTTEST') === 0 || id === 'BB-SETUP') {
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
        email: rowEmail(r),
        emailStatus: String(r[COL_EMAIL_STATUS - 1] || '').toUpperCase(),
        emailSentAt: cellText(r[COL_EMAIL_SENT_AT - 1], false),
        emailAttempts: Number(r[COL_EMAIL_ATTEMPTS - 1]) || 0,
        emailLastError: String(r[COL_EMAIL_ERROR - 1] || '')
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
