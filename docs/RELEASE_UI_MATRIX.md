# Release UI matrix (manual — no real money)

Do this on **desktop** and **phone** for the live order page:  
https://bobsburritos.github.io/BobsNet/

Backend automated suite: `python scripts/release_matrix_test.py`  
Results: `docs/RELEASE_MATRIX_RESULTS.md`

---

## Payments (never complete a transfer)

| Step | Pass? |
|------|--------|
| After order, see **Venmo @Khushbu-Kotecha** | |
| After order, see **Zelle 7148120977** | |
| Payment note format `BB-… \| Name \| Unit \| $…` | |
| **Copy payment note** works | |
| **Copy Zelle info** works | |
| **Open Venmo** opens correct user → **close without paying** | |
| Full order copy works | |

---

## Menu steppers (all combinations)

For each row, set qty, confirm **summary total**, then clear (or place TEST order).

| # | Cart | Expected total |
|---|------|----------------|
| 1 | 1× Soyrizo classic | $10 |
| 2 | 1× Soyrizo + avo | $12 |
| 3 | 1× Cali | $12 |
| 4 | 1× Heavy classic | $10 |
| 5 | 1× Heavy + avo | $12 |
| 6 | 2× Cali | $24 |
| 7 | 1 Soyrizo + 1 Cali + 1 Heavy | $32 |
| 8 | 1 Soyrizo+avo + 1 Heavy+avo + 1 Cali | $36 |
| 9 | Plus to 10 on one item, minus to 0 | Qty clamps 0–10 |
| 10 | All zero → Place order | Error: need burritos + name + unit |

---

## Form validation

| Input | Action | Pass if |
|-------|--------|---------|
| Empty name | Place order | Blocked + error message |
| Empty unit | Place order | Blocked |
| Empty cart | Place order | Blocked |
| Name only spaces | | Treated empty / blocked |
| Phone blank | Valid order | Allowed |
| Phone filled | Valid order | Shows on kitchen |
| Honeypot “Company” | Leave empty (hidden) | Never fill |

---

## Schedule / cutoff copy

| Check | Pass? |
|-------|--------|
| Notice shows correct next Sunday delivery | |
| Mentions Sat 3 PM cutoff | |
| 1111 Wilshire only at checkout (unit field / order subhead) | |

---

## Media / chrome

| Check | Pass? |
|-------|--------|
| Menu photos open lightbox | |
| Lightbox closes (X / Esc / outside) | |
| Instagram chip / footer link works | |
| QR / share section present | |
| Mobile: form usable, buttons tappable | |

---

## After Place order (backend)

| Check | Pass? |
|-------|--------|
| **Order received! BB-…** (not “Almost there”) | |
| Sheet row appears | |
| Email to bobsburritosco@gmail.com | |
| Kitchen shows order for that Sunday | |
| Mark paid works on test row | |
| Delete test rows when done | |

---

## Kitchen smoke

https://bobsburritos.github.io/BobsNet/kitchen/

| Check | Pass? |
|-------|--------|
| Login on phone | |
| Day picker prev/next | |
| Refresh loads orders | |
| Cook board numbers sensible | |
| Delivery cards readable on mobile | |
| Log out | |

---

## Release gate

- [ ] `release_matrix_test.py` all PASS  
- [ ] This UI matrix checked desktop + phone  
- [ ] Payment handles verified without sending money  
- [ ] All `BB-REL*` and `TEST` rows deleted  
- [ ] Instagram art + post plan ready (separate track)  
