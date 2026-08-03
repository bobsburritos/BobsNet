# Release matrix results

**Endpoint:** `https://script.google.com/macros/s/AKfycbwpvyRwhYQJIiz-lmPypoKC-2GvWzzMOzfD_RL_0-GLO36U2r2voebsNX6lpIyPqcIO/exec`  
**Score:** **25/25 PASS** (0 failed)  
**Status:** Hardened Apps Script is **live** (validation + server totals + dedupe)

## What this proves (no real money)

| Check | Result |
|--------|--------|
| All menu variants (Soyrizo ±avo, Cali, Heavy ±avo) | PASS |
| Qty 1 / 2 / 5 / 10 | PASS |
| Multi-item carts | PASS |
| Server-side totals match prices | PASS |
| Reject missing name/unit | PASS |
| Reject bad orderId | PASS |
| Reject empty cart | PASS |
| Reject bad date | PASS |
| Reject unknown items / over-limit qty | PASS |
| Dedupe same orderId | PASS |

## Cleanup

In Google Sheet **Orders**, delete **whole rows** whose OrderID starts with:

- `BB-REL`
- `BB-DRY`
- Any other `TEST` / `PROBE` rows

(Many `BB-REL*` may already exist from earlier runs; dedupe kept IDs stable.)

## Your remaining smoke (browser, ~10 min)

1. https://bobsburritos.github.io/BobsNet/ — place `TEST DELETE` / unit `000`  
2. Confirm **Order received!** + Venmo `@Khushbu-Kotecha` + Zelle `7148120977`  
3. Open Venmo link → **exit without paying**  
4. Kitchen → see order → Mark paid → delete row  

## Re-run anytime

```powershell
python scripts/release_matrix_test.py
```
