# Go-live checklist — art, orders, payments (no real money required)

**Order site:** https://bobsburritos.github.io/BobsNet/  
**Kitchen:** https://bobsburritos.github.io/BobsNet/kitchen/  
**Last dry-run order API:** `BB-DRYRUN1` → `{"ok":true}` (delete that sheet row when you see it)

---

## How payments actually work (important)

The site **never takes money**. It only:

1. Saves the order to Google Sheets  
2. Shows **where** to pay (Venmo / Zelle)  
3. Gives a **payment note** to paste so you can match the order  

| Piece | Status on live site |
|--------|---------------------|
| Venmo handle | `@Khushbu-Kotecha` |
| Zelle | `7148120977` (Bob's Burritos) |
| Payment note format | `BB-XXXXX \| Name \| Unit NNN \| $TT.TT` |
| “Open Venmo” button | Deep-link with amount + note when possible |
| “Copy Zelle info” | Copies name, number, amount, note |
| Card / Stripe | **Not used** |

So you can test **everything** without sending $1.

---

## A. Order system (do this first — ~15 min)

### A1. Place a real browser test order
1. Open https://bobsburritos.github.io/BobsNet/ (hard refresh)  
2. Add 1× Cali (or cheapest item)  
3. Name: `TEST DELETE` · Unit: `000` · Phone: optional  
4. Place order  

**Pass if:**
- [ ] Green confirmation: **Order received! BB-…**
- [ ] Payment note shows Venmo **@Khushbu-Kotecha** and Zelle **7148120977**
- [ ] **Copy payment note** works  
- [ ] **Open Venmo** opens Venmo app or venmo.com to the right user (you can **close without sending**)  
- [ ] **Copy Zelle info** pastes the right phone + amount + note  

### A2. Confirm Google Sheet + email
- [ ] New row on **Orders** with same Order ID  
- [ ] Email to `bobsburritosco@gmail.com` (check spam)  
- [ ] Total matches menu math  

### A3. Kitchen (no payment needed)
1. https://bobsburritos.github.io/BobsNet/kitchen/  
2. Log in with staff email + kitchen password  

**Pass if:**
- [ ] Login works on phone  
- [ ] Correct Sunday shows the test order  
- [ ] Cook board counts look right  
- [ ] Delivery run lists Unit 000 / TEST  
- [ ] **Mark paid** on the test order → sheet Paid flips (still no real money)  
- [ ] Unpaid chase list updates  

### A4. Cleanup
- [ ] Delete test rows (`TEST DELETE`, `BB-DRYRUN1`, old `BB-SMOKE*`) as **whole rows** only  

### A5. Apps Script deploy (if you changed backend recently)
- [ ] Apps Script editor → **Deploy → Manage deployments → New version**  
  (Save alone does not update the live Web app.)

---

## B. Payment handles (no send — visual / account checks)

### Venmo (@Khushbu-Kotecha)
- [ ] Open https://venmo.com/Khushbu-Kotecha (or app search) — profile is the intended payee  
- [ ] From order confirmation, **Open Venmo** lands on that user with amount prefilled if possible  
- [ ] **Stop before Pay** — screenshot is enough for your records  

### Zelle (7148120977)
- [ ] In your bank app, start Zelle “Send” and type `7148120977` — it resolves to the person/business you expect  
- [ ] **Cancel before confirming**  
- [ ] Confirm the number is the one on the business Zelle enrollment  

### Matching (ops, after real Sundays)
- [ ] You understand: customer pays → you find note `BB-…` → kitchen **Mark paid**  
- [ ] No auto-reconcile yet — that’s manual (and fine for launch)

---

## C. Resident clarity (UX walkthrough)

Pretend you’re a neighbor who never ordered before:

| Step | Clear? |
|------|--------|
| What you get (3 burritos + mayo) | |
| Prices + avocado upcharge | |
| Order by Sat 3 PM / Sun 9–12 delivery | |
| Unit number = 1111 Wilshire only | |
| After order: pay Venmo or Zelle | |
| Must paste payment note | |
| What if site fails (“Almost there” + copy order) | |

Optional polish later (not blockers):
- Short FAQ accordion on order page  
- “Don’t send money without the BB- note” line under pay buttons  

---

## D. Instagram / art (main creative work from here)

| Step | Where |
|------|--------|
| Profile bio + link | `.claude` / `Artwork/Instagram/Profile/profile-setup.md` |
| Logo as profile pic | `Artwork/Brand/Logos/` |
| Highlight shells | Menu, How to order, Sauce, **Who’s Bob?**, Woman-owned, Sunday Club |
| **Art per post** | `Artwork/Instagram/Posts/0N-*/artwork/` (drop `feed.jpg` 1080×1350) |
| Captions | each `post.md` |
| Publish order | **9 → 1** (see `Profile/posting-order.md`) |
| Pin | Post 5 (lineup) after it’s up |
| Post 8 | Khushbu reveal: *There is no Bob — it’s Khushbu* |

Prompts: `Artwork/Instagram/Prompts/prompts.md` + logo ref.

---

## E. Done enough to open for real neighbors?

**Yes, if A1–A4 pass.**  
Payments are “correct” when:
1. Orders land in the sheet  
2. Confirmation shows the right Venmo/Zelle  
3. You can match a note and mark paid in kitchen  

You do **not** need a real transfer to prove that.

When a real order pays: check Venmo/Zelle notification → open kitchen → Mark paid → done.

---

## Quick reference

| Item | Value |
|------|--------|
| Venmo | @Khushbu-Kotecha |
| Zelle | 7148120977 |
| Kitchen | https://bobsburritos.github.io/BobsNet/kitchen/ |
| Brand / Bob story | `Artwork/Brand/BRAND-KIT.md` |
| Claude pack | `.claude/00_INDEX.md` |
