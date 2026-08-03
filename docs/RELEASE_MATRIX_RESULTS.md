# Release matrix results

**Run:** synthetic orders against live Apps Script (no payments).  
**Score:** **16/25** automated checks — **all happy-path menu cases PASS**; **9 validation/dedupe checks FAIL because live backend is an older deployment**

## Critical finding (before launch)

Live Web app accepts almost any POST and returns only:

```json
{"ok":true,"orderId":"..."}
```

It does **not** match `local/bobs-burritos-backend.READY.gs` or `apps-script/bobs-burritos-backend.gs`, which:

- Reject missing name/unit, bad orderId, empty cart, bad date, etc.
- Compute **server-side total**
- **Dedupe** repeat orderIds

| Layer | Status |
|--------|--------|
| **Happy path orders** (all menu combos) | **Working** — land in sheet |
| **Client-side form** (empty cart / name / unit) | Protects normal users |
| **Server validation** | **Weak / outdated on live** — redeploy READY |
| **Payments** | Not in API — UI only (Venmo/Zelle) |

### What you must do before neighbors order

1. Open Google Apps Script bound to the Orders sheet  
2. Paste contents of **`local/bobs-burritos-backend.READY.gs`** (or the hardened `apps-script/bobs-burritos-backend.gs` **with your real** `PORTAL_KEY` / sheet id)  
3. **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**  
4. Re-run: `python scripts/release_matrix_test.py`  
5. Expect **25/25** (or 24/25 if one edge differs)  

Until then: real customers are still mostly fine (browser blocks empty form), but junk/API spam is easier.

---

## Cleanup (do this now)

In Google Sheet **Orders**, delete **entire rows** where OrderID starts with:

- `BB-REL`  
- `BB-DRY`  
- `BB-SMOKE` / `TEST`  

You will have many `BB-REL*` rows from this matrix + failed-validation rows that still inserted on the old API.

---

## Happy path — all PASSED (menu / combos)

| Result | Order ID | Case |
|--------|----------|------|
| PASS | BB-REL01S | Soyrizo classic ×1 |
| PASS | BB-REL01A | Soyrizo +avo ×1 |
| PASS | BB-REL01C | Cali ×1 |
| PASS | BB-REL01H | Heavy classic ×1 |
| PASS | BB-REL01B | Heavy +avo ×1 |
| PASS | BB-REL02A | Cali ×2 |
| PASS | BB-REL02B | Cali ×5 |
| PASS | BB-REL02C | Cali ×10 |
| PASS | BB-REL03A | Soyrizo + Cali |
| PASS | BB-REL03B | All three classic |
| PASS | BB-REL03C | Both avo + Cali |
| PASS | BB-REL03D | Party tray multi-line |
| PASS | BB-REL03E | 5+5+5 variety |
| PASS | BB-REL04A | Name/unit trim + phone format |
| PASS | BB-REL04B | Max-length name/unit |
| PASS | BB-REL04C | Unicode name |

**Conclusion:** every real menu option and multi-item cart the site can build **is accepted by the backend**.

---

## Validation / safety — FAILED on live (old API)

These **should** return `ok:false` after READY deploy. On live they returned `ok:true` (and may have written junk rows):

| Order ID | Case |
|----------|------|
| BB-RELFAIL1 | Missing name |
| BB-RELFAIL2 | Missing unit |
| BB-RELFAIL3 | Bad orderId |
| BB-RELFAIL4 | Qty 0 |
| BB-RELFAIL5 | Empty items |
| BB-RELFAIL6 | Bad date format |
| BB-RELFAIL7 | Unknown item only |
| BB-RELFAIL8 | Too many burritos |
| BB-REL01C-DEDUPE | Second post same ID (no `deduped:true`) |

---

## Payments (no money sent)

Not exercised by this script (by design). Confirm manually:

1. Browser test order → confirm screen  
2. Venmo **@Khushbu-Kotecha** · Zelle **7148120977**  
3. Copy note / Open Venmo / Copy Zelle — **do not pay**  
4. Kitchen **Mark paid** on a test row  

See `docs/RELEASE_UI_MATRIX.md` and `docs/GO_LIVE_CHECKLIST.md`.

---

## Re-run after deploy

```powershell
cd D:\MiguelAznar\007_PersonalProjects\200_BobsBurritos
python scripts/release_matrix_test.py
```

Then open kitchen, confirm a few `BB-REL*` rows display, **Mark paid** one, delete all test rows.
