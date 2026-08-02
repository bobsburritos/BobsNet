# Bob's Burritos (BobsNet)

Sunday breakfast burritos at **1111 Wilshire** — residents order during the week, orders close **Saturday 3:00 PM (America/Los_Angeles)**, delivery **Sunday 9 AM–12 PM**.

## Live site (GitHub Pages)

After Pages is enabled:

**https://bobsburritos.github.io/BobsNet/**

| Public file | Purpose |
|-------------|---------|
| `index.html` | Order page (HTML/CSS/JS, no build step) |
| `og-image.png` | Link preview image |

## Repo layout

```
index.html              → public order form
og-image.png            → social preview
apps-script/            → Google Apps Script source (paste into Sheet)
docs/DEPLOYMENT.md      → full architecture + deploy checklist
FablePlanning/          → original planning pack
Artwork/                → product photos (for the order cards)
local/                  → GITIGNORED: kitchen portal + live secrets
```

**Never commit** the kitchen portal once it has a real `KEY`, or any file with a live Apps Script URL / portal key.

## What you still do in Google (business account)

Use **`bobsburritosco@gmail.com`**:

1. Create Google Sheet: `Bobs Burritos Orders`
2. Extensions → Apps Script → paste `local/bobs-burritos-backend.READY.gs`  
   (that copy already has `OWNER_EMAIL` + a matching `PORTAL_KEY`)
3. Run `setupSheets()` once; approve permissions
4. Deploy → New deployment → **Web app** → Execute as **Me** → Access **Anyone**
5. Copy the Web app URL

Then wire the URL:

- Public: set `SCRIPT_URL` in `index.html` and commit/push
- Kitchen: set `SCRIPT_URL` in `local/bobs-kitchen.html` only (do not commit)

Full steps and smoke tests: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

## Core rules

1. The Google Sheet is a **database** — no hand-editing cells.
2. Order IDs are generated **client-side** (`BB-…`).
3. No payment by Saturday 3 PM → order is not cooked.
4. Cutoff always uses **America/Los_Angeles**.
