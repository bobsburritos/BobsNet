# Bob's Burritos (BobsNet)

Sunday breakfast burritos at **1111 Wilshire**.  
Orders close **Saturday 3:00 PM (America/Los_Angeles)** · Delivery **Sunday 9 AM–12 PM**.

## Live

| | |
|--|--|
| **Order site** | https://bobsburritos.github.io/BobsNet/ |
| **GitHub** | https://github.com/bobsburritos/BobsNet |
| **Business email** | bobsburritosco@gmail.com |
| **Backend** | Google Apps Script Web app → Google Sheet |

## Public repo (safe to share)

```
index.html           Order page (wired to live Web app)
og-image.png         Social preview
assets/food/         Menu photos
apps-script/         Backend template (no live secrets)
docs/                Deployment + operations notes
FablePlanning/       Original planning pack
Artwork/             Source photos
```

## Private / local only (gitignored)

```
local/bobs-kitchen.html              Kitchen portal + PORTAL_KEY
local/bobs-burritos-backend.READY.gs Live backend with secrets
local/config.env                     Sheet ID + SCRIPT_URL
```

**Never commit** kitchen with a real key, or the portal key itself.

## What not to use

- Apps Script **Library** URLs (`script.google.com/macros/library/...`) — not for the website  
- Only the Web app URL ending in **`/exec`** is used by the order page

## Core rules

1. The Google Sheet is a **database** — no hand-editing cells (except deleting whole test rows).  
2. Order IDs are generated **client-side** (`BB-…`).  
3. No payment by Saturday 3 PM → order is not cooked.  
4. Cutoff always uses **America/Los_Angeles**.  
5. After every Apps Script edit: **Deploy → Manage deployments → New version**.

## Docs

- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — full architecture  
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — day-to-day runbook  
- [docs/GOOGLE-SETUP.md](docs/GOOGLE-SETUP.md) — Google setup notes  
