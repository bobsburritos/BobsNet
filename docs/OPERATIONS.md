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

## Cleanup smoke-test rows

**Option A — Sheet (allowed for whole test rows)**  
On **Orders**, delete the entire row for `BB-SMOKE1` (not individual cells).

**Option B — Editor (after pasting latest READY.gs)**  
1. Function dropdown → `cleanupTestsFromEditor` → Run  
2. Deploy **New version** so kitchen sees clean data  

## Payment

Venmo/Zelle are out of band. Residents copy a note like:

`BB-XXXXX | Name | Unit NNN | $TT.TT`

Add your real Venmo/Zelle handle on the public page when ready (ask agent to wire it).
