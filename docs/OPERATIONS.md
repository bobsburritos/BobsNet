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

## Kitchen portal

Path (this machine only):

`D:\MiguelAznar\007_PersonalProjects\200_BobsBurritos\local\bobs-kitchen.html`

- Double-click or open in Chrome.  
- Must stay **off** GitHub (contains portal key).  
- Refresh loads that Sunday’s orders from the Web app.

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
