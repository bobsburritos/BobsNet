# Release matrix results

**Run:** synthetic orders against live Apps Script (no payments).
**Endpoint:** `https://script.google.com/macros/s/AKfycbwpvyRwhYQJIiz-lmPyp…`
**Score:** **25/25** passed, 0 failed

## Cleanup

In Google Sheet **Orders**, delete whole rows whose OrderID starts with `BB-REL`.

## Results

| Result | Order ID | Case | HTTP | Response |
|--------|----------|------|------|----------|
| PASS | `BB-REL01S` | RELTEST Soyrizo classic x1 | 200 | `{"ok": true, "orderId": "BB-REL01S", "total": 10}` |
| PASS | `BB-REL01A` | RELTEST Soyrizo +avo x1 | 200 | `{"ok": true, "orderId": "BB-REL01A", "total": 12}` |
| PASS | `BB-REL01C` | RELTEST Cali x1 | 200 | `{"ok": true, "orderId": "BB-REL01C", "total": 12}` |
| PASS | `BB-REL01H` | RELTEST Heavy classic x1 | 200 | `{"ok": true, "orderId": "BB-REL01H", "total": 10}` |
| PASS | `BB-REL01B` | RELTEST Heavy +avo x1 | 200 | `{"ok": true, "orderId": "BB-REL01B", "total": 12}` |
| PASS | `BB-REL02A` | RELTEST qty ladder 2 | 200 | `{"ok": true, "orderId": "BB-REL02A", "total": 24}` |
| PASS | `BB-REL02B` | RELTEST qty ladder 5 | 200 | `{"ok": true, "orderId": "BB-REL02B", "total": 60}` |
| PASS | `BB-REL02C` | RELTEST qty ladder 10 | 200 | `{"ok": true, "orderId": "BB-REL02C", "total": 120}` |
| PASS | `BB-REL03A` | RELTEST Soyrizo+Cali | 200 | `{"ok": true, "orderId": "BB-REL03A", "total": 22}` |
| PASS | `BB-REL03B` | RELTEST All three classic | 200 | `{"ok": true, "orderId": "BB-REL03B", "total": 32}` |
| PASS | `BB-REL03C` | RELTEST Both avo options + Cali | 200 | `{"ok": true, "orderId": "BB-REL03C", "total": 60}` |
| PASS | `BB-REL03D` | RELTEST Party tray | 200 | `{"ok": true, "orderId": "BB-REL03D", "total": 134}` |
| PASS | `BB-REL03E` | RELTEST Max-ish variety | 200 | `{"ok": true, "orderId": "BB-REL03E", "total": 180}` |
| PASS | `BB-REL04A` |   Name  With   Spaces   | 200 | `{"ok": true, "orderId": "BB-REL04A", "total": 12}` |
| PASS | `BB-REL04B` | AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | 200 | `{"ok": true, "orderId": "BB-REL04B", "total": 10}` |
| PASS | `BB-REL04C` | Unicode Café Ñoño | 200 | `{"ok": true, "orderId": "BB-REL04C", "total": 12}` |
| PASS | `BB-RELFAIL1` | missing name | 200 | `{"ok": false, "error": "name and unit required"}` |
| PASS | `BB-RELFAIL2` | missing unit | 200 | `{"ok": false, "error": "name and unit required"}` |
| PASS | `BB-RELFAIL3` | bad orderId | 200 | `{"ok": false, "error": "bad orderId"}` |
| PASS | `BB-RELFAIL4` | no burritos | 200 | `{"ok": false, "error": "no burritos"}` |
| PASS | `BB-RELFAIL5` | empty items | 200 | `{"ok": false, "error": "no burritos"}` |
| PASS | `BB-RELFAIL6` | bad date | 200 | `{"ok": false, "error": "bad deliveryDate"}` |
| PASS | `BB-RELFAIL7` | unknown item only | 200 | `{"ok": false, "error": "no burritos"}` |
| PASS | `BB-RELFAIL8` | too many burritos | 200 | `{"ok": false, "error": "too many burritos"}` |
| PASS | `BB-REL01C-DEDUPE` | dedupe same orderId | 200 | `{"ok": true, "orderId": "BB-REL01C", "deduped": true, "total": 12}` |

## Menu matrix covered

- Soyrizo classic / Soyrizo+avo
- Cali
- Heavy classic / Heavy+avo
- Qty 1, 2, 5, 10
- Multi-item combos including all three + avo mix
- Name/unit trim, max length, unicode, phone formats
- Validation: missing name/unit, bad orderId, empty cart, bad date, unknown item, too many
- Dedupe same orderId

## Manual UI (do on phone + desktop)

See `docs/RELEASE_UI_MATRIX.md`

