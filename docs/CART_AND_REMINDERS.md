# Cart recovery & reminders

## What we ship now (no cookies required)

### Order page — **localStorage cart draft**
- As someone adds burritos or fills name/unit/phone, the cart is saved on **that device/browser**.
- If they leave and come back, a banner: **Continue order** / **Clear cart**.
- Cleared after a successful submit.

**Why localStorage, not cookies?**
- Larger, not sent on every request
- Perfect for “same phone/browser” recovery
- No cookie-consent banner required for this use alone

### Kitchen — **all-time stats**
- Burritos sold, orders, most popular, gross sales, paid vs unpaid, avg order
- From all rows in the sheet (every Sunday)

---

## What cookies *can* help with (optional later)

| Use | Cookie? | Notes |
|-----|---------|--------|
| Remember cart | Prefer **localStorage** (done) | Same outcome |
| Analytics (how many abandon) | Optional | Needs privacy notice if using 3rd party |
| “Remind me” email/SMS | **Not cookies** | Need contact + permission + server job |

---

## Abandoned cart **email/SMS** (not built — needs more)

To text/email someone who left items in the cart:

1. **Capture email or phone before submit** (extra field or “save cart & text me” button)  
2. Store draft cart + contact on **your backend** (Sheet/Apps Script or service)  
3. **Scheduled job** (e.g. 1–2 hours later): if no order with that contact, send reminder  
4. **Consent** (“Yes, text me about my order”) — required for SMS/email marketing in US  

Cookies alone **cannot** push a reminder to their phone after they close the tab.

### Lightweight path if you want reminders later
- Button: “Email me this cart” → posts email + cart JSON to Apps Script → you (or a script) send one follow-up  
- Or: only collect phone at checkout (already have) and **don’t** spam; use for delivery only  

---

## Recommended for Bob’s (1111 Wilshire)

1. **Keep localStorage cart** (done) — covers most “I got distracted” cases on the same phone  
2. **Kitchen stats** (done) — know volume & favorites  
3. Skip cookie banners until you add third-party analytics  
4. Add email/SMS abandonment only if conversion is a real problem after launch  
