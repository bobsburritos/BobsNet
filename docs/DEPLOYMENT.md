# Bob's Burritos — System Documentation & Deployment Guide

Pre-order breakfast burrito business at 1111 Wilshire. Residents order during the
week, orders close **Saturday 3:00 PM (America/Los_Angeles)**, delivery is
**Sunday 9 AM–12 PM**, door to door.

This document is a complete handoff: architecture, file-by-file breakdown,
deployment steps, configuration, data contract, and a test checklist. It assumes
the reader has never seen this project.

---

## 1. System overview

```
Resident's phone                     Google (free tier)               Kitchen
┌──────────────────┐   POST order   ┌──────────────────────┐   GET   ┌──────────────────┐
│ bobs-burritos.html│ ─────────────▶│ Apps Script Web App  │◀────────│ bobs-kitchen.html│
│ (GitHub Pages)    │◀───────────── │  (doPost / doGet)    │────────▶│ (LOCAL file only)│
└──────────────────┘   {ok,orderId} │        │             │  JSON   └──────────────────┘
                                    │        ▼             │              │ POST markPaid
                                    │  Google Sheet (DB)   │◀─────────────┘
                                    │  + email per order   │
                                    └──────────────────────┘
```

Payments are Venmo/Zelle, out of band. The order confirmation gives the resident
a copyable payment note (`BB-XXXXX | Name | Unit NNN | $22.00`) that they paste
into the Venmo/Zelle note field. Payment status is written back to the sheet
**only via the API** (kitchen portal button today; an automated reconciler later).

### Core principles — do not violate these
1. **The Google Sheet is a database.** No human edits cells, ever. All writes go
   through the Apps Script endpoints. This keeps the data machine-parseable.
2. **Order IDs are generated client-side** (`BB-` + base36 timestamp + random
   char) so the payment note exists even if the backend is unreachable.
3. **No payment by Saturday 3 PM = order is not cooked.** The system surfaces
   unpaid orders; the rule does the enforcement.
4. Cutoff logic runs in **America/Los_Angeles** regardless of device timezone.
   After cutoff the form does NOT block — it rolls the order to the following
   Sunday and says so explicitly.

---

## 2. The files

| File | What it is | Where it lives |
|---|---|---|
| `bobs-burritos.html` | Public order page (single file: HTML+CSS+JS, no build step, no dependencies except Google Fonts) | GitHub Pages |
| `bobs-burritos-backend.gs` | Google Apps Script: order intake, email notification, payment marking, kitchen data feed, sheet setup | Apps Script editor bound to the Google Sheet |
| `bobs-kitchen.html` | Private kitchen dashboard: cook counts, grocery list w/ cost estimates, money/unpaid tracking, delivery run | **Local file only — never publish** |
| `DEPLOYMENT.md` | This document | repo |

### 2.1 bobs-burritos.html (order page)

- **Menu** (3 cards, each with quantity steppers per variant):
  - Soyrizo Sunrise — $10 · Classic / +Avocado (+$2)
  - The Cali — $12 · avocado included, single variant
  - The Heavyweight — $10 · Classic / +Avocado (+$2)
  - All burritos come with chipotle mayo (mayo + chipotles in adobo) on the side.
- **Cutoff banner**: computes the target delivery Sunday in LA time. Before
  Sat 3 PM → yellow "Ordering for Sunday, <date>". After Sat 3 PM and all day
  Sunday → lilac "This Sunday's orders are closed — you're ordering for
  Sunday, <next date>". Refreshes every 60 s.
- **Submit flow**: generates order ID → shows payment note + copy button
  immediately → POSTs JSON to the backend. Three outcomes:
  - Backend OK → "Order received! BB-XXXXX"
  - Backend fails → "Almost there! BB-XXXXX" + copy-full-order-and-text-us
    fallback. Payment note stays visible in every path.
  - `SCRIPT_URL` empty (pre-deployment) → same fallback, no fetch attempted.
- **Config**: one constant at the top of the `<script>` block:
  `var SCRIPT_URL = '...';` — the Apps Script Web app URL.
- Placeholder image panels on each card are striped divs labeled
  "[ Your X photo goes here ]" — replace with real product photos.

### 2.2 bobs-burritos-backend.gs (Apps Script)

Config at top of file:
```js
var OWNER_EMAIL = '...';   // gets an email per order — use the business Gmail
var PORTAL_KEY  = '...';   // long random string; must match kitchen.html
```

Endpoints (single Web app deployment):
- `doPost` with no `action` → **insert order**. Appends a row, emails
  OWNER_EMAIL, returns `{ok:true, orderId}`.
- `doPost` with `{action:'markPaid', key, orderId, ref}` → sets Paid=YES,
  PaidAt=now (ISO), PaidRef=`ref`. Key-gated.
- `doGet ?key=...&date=YYYY-MM-DD` → JSON array of orders for that delivery
  date (omit `date` for all orders). Key-gated. Consumed by the kitchen portal
  and (later) the payment reconciler.
- `setupSheets()` → run manually once; creates the `Orders` tab with headers and
  a read-only `Prep` mirror tab with SUMIFS formulas. Safe to re-run.

### 2.3 bobs-kitchen.html (kitchen portal)

Config at top of `<script>`:
```js
var SCRIPT_URL = '...';  // same Web app URL
var KEY = '...';         // must equal PORTAL_KEY
```

Sections, computed live from the backend feed for the selected Sunday
(defaults to the upcoming Sunday; ‹ › arrows shift weeks; Refresh re-fetches):
1. **Cook Board** — total burritos + per-type counts with avocado sub-counts.
2. **Grocery List** — purchasable units. Driven by the `GROCERY` array at the
   top of the script: each entry has a per-burrito portion (`need` function),
   a Costco pack size, and a pack price. Shows Need / Buy (packs) / Est cost
   with a running total. **All portions and prices are currently ESTIMATES** —
   replace with measured portions and receipt prices. Zero-need rows hide.
3. **Money** — expected / paid / unpaid, plus an unpaid chase list with
   order ID, name, unit, phone.
4. **Delivery Run** — orders sorted by unit number, per-order item breakdown,
   PAID/NO pill, "Mark paid" button on unpaid rows (calls markPaid with
   ref `kitchen-portal-manual`), and a per-door checkbox that fades the row
   when delivered (session-only, not persisted).

---

## 3. Data contract (Orders tab)

One row per order. Append-only except columns N–P.

| Col | Field | Format | Notes |
|---|---|---|---|
| A | OrderID | `BB-XXXXX` | client-generated, primary key |
| B | ReceivedAt | ISO 8601, LA time | `2026-08-05T18:42:11` |
| C | DeliveryDate | `YYYY-MM-DD` | the delivery Sunday; all queries key on this |
| D | DeliveryLabel | `Sunday, August 9` | human display only |
| E–G | Name, Unit, Phone | strings | |
| H | Soyrizo | int | total soyrizo burritos |
| I | SoyrizoAvo | int | subset of H that get avocado |
| J | Cali | int | all Cali include avocado |
| K | Heavy | int | |
| L | HeavyAvo | int | subset of K |
| M | Total | number | dollars |
| N | Paid | `YES` / `NO` | written only by markPaid |
| O | PaidAt | ISO 8601 | |
| P | PaidRef | string | how the payment was matched (audit trail) |

Payment note format (what residents paste into Venmo/Zelle):
`BB-XXXXX | Name | Unit NNN | $TT.TT` — pipe-delimited, ID first, exact amount
last, designed for reliable machine extraction from screenshots.

---

## 4. Deployment steps

### Step 0 — Business Google account
Create a dedicated Gmail (e.g. `bobsburritos1111@gmail.com`). Everything below
happens under this account, never a personal one. Point Venmo notification
email here; forward bank Zelle notification emails here with a Gmail filter.

### Step 1 — Sheet + Apps Script
1. In the business account, create a Google Sheet named `Bobs Burritos Orders`.
2. Extensions → Apps Script. Delete default code, paste all of
   `bobs-burritos-backend.gs`.
3. Set `OWNER_EMAIL` and `PORTAL_KEY` (generate a long random string, e.g.
   `openssl rand -hex 24`).
4. Run `setupSheets()` once from the editor; approve the permission prompts.
5. Deploy → New deployment → type **Web app** → Execute as: **Me** →
   Who has access: **Anyone** → Deploy. Copy the Web app URL.
   - ⚠ **Every future edit to the script requires Deploy → Manage
     deployments → ✎ → Version: New version.** Editing code without a new
     version silently serves the old code.

### Step 2 — Wire the frontends
1. `bobs-burritos.html`: set `SCRIPT_URL` to the Web app URL.
2. `bobs-kitchen.html`: set `SCRIPT_URL` and `KEY` (= PORTAL_KEY).

### Step 3 — GitHub Pages (order page only)
1. Create a public repo, add **only** `bobs-burritos.html` (rename to
   `index.html` for a clean URL).
   - ⚠ Do **not** commit `bobs-kitchen.html` (contains PORTAL_KEY) or the
     `.gs` file with real values. If the repo must hold them, keep the repo
     private and Pages will still... no — Pages on a free account requires a
     public repo. Keep kitchen + script out entirely.
2. Repo Settings → Pages → Deploy from branch → main → root. Site appears at
   `https://<user>.github.io/<repo>/` within a few minutes.
3. The kitchen portal is opened as a local file (`file://.../bobs-kitchen.html`)
   in a browser on the kitchen laptop/phone. It fetches the backend remotely;
   nothing runs locally.

### Step 4 — Smoke test (do all of these before announcing)
- [ ] Submit a test order pre-cutoff → row appears in sheet with correct
      ISO dates, email arrives, confirmation shows order ID + payment note,
      both copy buttons work on a phone.
- [ ] Multi-variant order (e.g. 1 Heavyweight Classic + 2 Heavyweight +Avo)
      → sheet shows Heavy=3, HeavyAvo=2, total $34.00.
- [ ] Set device clock ≠ LA timezone → banner still keys off LA time.
- [ ] Temporarily set `SCRIPT_URL=''` → fallback flow shows payment note +
      copy-full-order.
- [ ] Kitchen portal loads the test Sunday, counts match, Mark paid flips the
      row (check PaidAt/PaidRef populate), delivery checkboxes fade rows.
- [ ] Delete test rows... **no** — never hand-edit. For test data, either use a
      throwaway sheet, or accept test rows dated to a past Sunday where they'll
      never appear in a real query. (If you must clear, delete entire test rows,
      never individual cells.)

### Gotchas that will bite if changed
- The order form POSTs with `Content-Type: text/plain` **on purpose** — it
  avoids a CORS preflight that Apps Script cannot answer. Changing it to
  `application/json` silently breaks all submissions.
- Apps Script GET/POST follow a 302 redirect to `googleusercontent.com`;
  `fetch` handles this. Don't add `mode:'no-cors'` — you'd lose the response.
- `PORTAL_KEY` in the URL/HTML is secrecy, not authentication. Acceptable for
  names + unit numbers; keep the kitchen file and key private.
- Order IDs are non-sequential by design (collision-proof across devices).
  Chronology comes from ReceivedAt.

---

## 5. Business constants (for reference)

- Prices: Soyrizo $10, Cali $12 (avo included), Heavyweight $10; +$2 avocado
  add-on on Soyrizo/Heavyweight. Same chipotle mayo with everything.
- Beef is taco-seasoned; seasoning goes on the beef, not in the sauce.
- Packaging per unit: foil-wrapped burrito + 2 oz sauce cup inside a kraft #3
  fold-to-go box (7¾" × 5½" × 2½"), order ID + burrito type written on the
  foil/box. Multi-burrito orders bagged per unit, bag labeled with order ID.
- Estimated COGS ≈ $4.20–4.40/burrito incl. packaging (pre-receipt estimates).

## 6. Not built yet (roadmap)
1. **Payment reconciler** (local Python + Ollama vision model, e.g.
   Qwen2.5-VL 7B): screenshots of Venmo/Zelle activity → extract
   {sender, amount, note} → GET unpaid orders → match (exact on order ID in
   note; fallback amount+name fuzzy) → POST markPaid with descriptive ref;
   ambiguous matches go to a manual-review report, never auto-guessed.
   Start in report-only mode before enabling auto-write.
2. Real product photos into the three card placeholders.
3. Lobby flyer with QR code to the order URL.
4. Cost model lock-in: replace the `GROCERY` estimates in bobs-kitchen.html
   with measured portions + Costco receipt prices.
5. Ingredients/COGS tabs in the sheet fed by logged receipts (via script,
   not hand entry).
