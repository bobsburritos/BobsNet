# Bob's Burritos — operations

## Live endpoints

| Role | URL |
|------|-----|
| Order site | https://bobsburritos.github.io/BobsNet/ |
| Web app (API) | `…/macros/s/…/exec` (see `local/config.env`) |
| Sheet | https://docs.google.com/spreadsheets/d/1m4Kyd07mDDpekeAuJ-XJcKU-8N2Cc3jbWtjATGJ9ZiU/edit |

Ignore any **Library** URL. Only the Web app `/exec` URL matters.

## Sheet tabs

| Tab | Purpose |
|-----|---------|
| **Orders** | Database of orders (append-only except Paid columns via API) |
| **Prep** | Read-only style mirror / shopping formulas |
| Sheet1 | Delete if empty — not used |

## Weekly flow

1. Residents order on the public site during the week.  
2. Orders land in **Orders** + email to `bobsburritosco@gmail.com`.  
3. Saturday 3 PM LA cutoff (site rolls late orders to the next Sunday).  
4. Kitchen: open `local/bobs-kitchen.html` in a browser (local file).  
5. Mark paid via kitchen portal only (not by typing in the sheet).  
6. Sunday delivery run from kitchen “Delivery Run” section.

## Kitchen portal (any computer)

**Live URL (use this):**  
https://bobsburritos.github.io/BobsNet/kitchen/

### Login
| Field | Value |
|--------|--------|
| **Email** | Staff emails configured in vault (e.g. `bobsburritosco@gmail.com`) |
| **Password** | Your kitchen password (never stored in the public page as plain text) |

### How multi-device auth works
- Public file `kitchen/vault.js` holds the **portal key encrypted** with each user’s password.
- On login, the browser decrypts secrets with your password (needs **HTTPS** — Pages is fine).
- Session lasts ~12 hours in that browser tab (sessionStorage).

### Change passwords / add staff
1. Edit **private** `kitchen/kitchen-config.js` (gitignored) with users + portalKey + scriptUrl  
2. Run: `node scripts/build-kitchen-vault.js`  
3. Commit + push **only** `kitchen/vault.js` (not kitchen-config.js)

Template: `kitchen-config.example.js`

## After editing Apps Script

1. Save in editor  
2. **Deploy → Manage deployments → pencil → Version: New version → Deploy**  
3. Saving alone does **not** update the live site

## Confirmation emails (the customer's only receipt)

The backend retries failed confirmations automatically every 10 minutes. You only
step in when a receipt is marked **FAILED**.

**Required once per Apps Script project:** run `installAllTriggers()` from the editor.
Check Apps Script → Triggers lists `retryPendingConfirmations` and `sendKitchenDigest`.
Without it nothing retries and failed receipts stay unsent.

### Reading the board
| Chip on an order | Meaning | Do |
|---|---|---|
| *(no chip)* | Receipt sent | nothing |
| `✉ Receipt retrying…` | Queued, retrying automatically | nothing, wait |
| `✉ Draft ready — hit Send in Gmail` | Send quota gone; receipt is written and waiting | open **Gmail → Drafts**, press **Send** |
| `⚠ No receipt — resend` | Gave up. Customer has no receipt. | **✉ Email → resend order confirmation** |
| `⚠ No email on file` | No usable address | contact by phone if needed |

### When you're out of send quota (drafts)
Hitting the ~100/day Gmail cap no longer blocks receipts. Each new one is written into
**Gmail → Drafts**, fully formatted. You just press **Send** — nothing to retype.

- `listDraftedReceiptsFromEditor()` in the Apps Script editor lists which orders are waiting.
- After you send them, **do nothing else.** The next 10-minute sweep sees the draft is gone
  and flips the row to `SENT` by itself.
- The system will **never** auto-send a draft — that would duplicate what you just sent.
- Sending by hand from Gmail draws on Gmail's own ~500/day limit, which is a separate,
  larger allowance than the ~100/day the script gets. That's why this buys real headroom.

### Diagnosing
Apps Script editor → run `confirmationHealthFromEditor()` → View → Logs. Shows counts
per status, order IDs needing resend, and **remaining Gmail sends today**.

Gmail caps a consumer account at ~100 sends/day. If `remainingDailyQuota` is 0, queued
receipts drain automatically after midnight PT — no action needed. If you regularly
exceed it, move to Google Workspace (1,500/day).

You'll also get an automatic **ACTION** email listing any receipt that could not be sent,
and the 3:00 PM digest reports receipt health for the upcoming Sunday.

Sheet columns **R–U** on Orders carry the per-order detail (status, sent time, attempts,
last error). Read them, don't hand-edit them — the retry sweep owns those cells.

## Cleanup smoke-test rows

**Option A — Sheet (allowed for whole test rows)**  
On **Orders**, delete the entire row for `BB-SMOKE1` (not individual cells).

**Option B — Editor (after pasting latest READY.gs)**  
1. Function dropdown → `cleanupTestsFromEditor` → Run  
2. Deploy **New version** so kitchen sees clean data  

## Payment

Venmo/Zelle are out of band. Residents copy a note like:

`BB-XXXXX | Name | Unit NNN | $TT.TT`

Venmo: **@Khushbu-Kotecha** · Zelle: **7148120977** (wired on the public order page).
