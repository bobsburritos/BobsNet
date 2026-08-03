# 05 — Payments and operations

## Payments (out of band)
| Method | Destination |
|--------|-------------|
| **Venmo** | @Khushbu-Kotecha |
| **Zelle** | 7148120977 (name: Bob's Burritos on site) |

**Payment note format** (residents paste into Venmo/Zelle memo):

```
BB-XXXXX | Name | Unit NNN | $TT.TT
```

No card processing on site. Unpaid → not cooked.

## Live endpoints
| Role | URL |
|------|-----|
| Order site | https://bobsburritos.github.io/BobsNet/ |
| Kitchen | https://bobsburritos.github.io/BobsNet/kitchen/ |
| Sheet | Google Sheet Orders/Prep (business Google account) |
| API | Apps Script Web app `/exec` (in private config / index.html SCRIPT_URL) |

## Kitchen portal
- Login: staff email + password (decrypts vault → portal key in browser).
- Public: `kitchen/vault.js` (encrypted only).
- Private: `kitchen/kitchen-config.js` (gitignored).
- After password changes: `node scripts/build-kitchen-vault.js` → commit only `vault.js`.
- Session ~12 hours.
- Features: cook board, grocery list, money (expected/paid/owed), chase unpaid, delivery run by unit, mark paid.

## After Apps Script edits
**Deploy → Manage deployments → New version** (save alone does not ship).

## Weekly flow
1. Orders all week on public site
2. Email notify business Gmail
3. Sat 3 PM cutoff
4. Kitchen prep + mark paid
5. Sunday delivery 9–12

## Source docs
- `docs/OPERATIONS.md`
- `docs/DEPLOYMENT.md`
- `docs/GOOGLE-SETUP.md`
