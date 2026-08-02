# Bob's Burritos (BobsNet)

Sunday breakfast burritos at **1111 Wilshire**.  
Orders close **Saturday 3:00 PM (America/Los_Angeles)** · Delivery **Sunday 9 AM–12 PM**.

## Live

| | |
|--|--|
| **Order site** | https://bobsburritos.github.io/BobsNet/ |
| **GitHub** | https://github.com/bobsburritos/BobsNet |
| **Business email** | bobsburritosco@gmail.com |

## What's in the public repo

```
index.html                 Public order page
assets/                    Photos + favicon
og-image.png               Social preview
apps-script/               Backend template (no live portal key)
kitchen/index.html         Kitchen UI only (no password in file)
kitchen-config.example.js  Copy → kitchen/kitchen-config.js
docs/                      Deployment, ops, security, status
FablePlanning/             Original planning pack
```

## Private (gitignored — never publish)

```
kitchen/kitchen-config.js          email + password + portalKey + scriptUrl
local/                             READY backend, kitchen copies, screenshots
.portal_key_local_only.txt
```

## Kitchen login

1. Open `kitchen/index.html` **from disk** (or keep a local copy).
2. Email: **bobsburritosco@gmail.com**
3. Password: from `kitchen/kitchen-config.js` only.

See [docs/OPERATIONS.md](docs/OPERATIONS.md) and [docs/SECURITY.md](docs/SECURITY.md).

## Core rules

1. Google Sheet is a **database** — no hand-editing cells (whole test rows may be deleted).
2. Order IDs are generated **client-side** (`BB-…`).
3. No payment by Saturday 3 PM → order is not cooked.
4. Cutoff always uses **America/Los_Angeles**.
5. After every Apps Script edit: **Deploy → Manage deployments → New version**.

## Status

See [docs/STATUS.md](docs/STATUS.md) for live checklist and open items.
