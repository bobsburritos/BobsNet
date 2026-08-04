# Bob's Burritos (BobsNet)

**Woman-owned.** Sunday breakfast burritos at **1111 Wilshire**.  
Orders close **Saturday 3:00 PM (America/Los_Angeles)** · Delivery **Sunday 9 AM–12 PM**.

## Live

| | |
|--|--|
| **Order site** | https://bobsburritos.github.io/BobsNet/ |
| **Instagram** | https://www.instagram.com/bobsburritosco/ |
| **GitHub** | https://github.com/bobsburritos/BobsNet |
| **Business email** | bobsburritosco@gmail.com |

## Where things live

| Need | Path |
|------|------|
| **Brand, Instagram, flyers, food art** | [`Artwork/`](Artwork/) — single home for creative work |
| Brand kit + logo | [`Artwork/Brand/`](Artwork/Brand/) |
| IG playbook, prompts, posts, calendar | [`Artwork/Instagram/`](Artwork/Instagram/) |
| Engineering ops | [`docs/`](docs/) (deploy, kitchen, security) |
| Live site code | `index.html`, `assets/`, `kitchen/`, `apps-script/` |

**Rule:** no floating brand/content docs. New creative work goes under `Artwork/`.

## What's in the public repo

```
index.html                 Public order page
assets/                    Web photos + favicon (shipped to Pages)
og-image.png               Live social preview
Artwork/                   Brand + content source of truth
apps-script/               Backend template (no live portal key)
kitchen/                   Kitchen UI
kitchen-config.example.js  Copy → kitchen/kitchen-config.js
docs/                      Ops, security, status (+ archive/)
scripts/                   Vault builder, tile helpers
```

## Private (gitignored — never publish)

```
kitchen/kitchen-config.js          email + password + portalKey + scriptUrl
local/                             READY backend, kitchen copies, screenshots
.portal_key_local_only.txt
```

## Kitchen (any computer)

**https://bobsburritos.github.io/BobsNet/kitchen/**

1. Open that URL on any phone/laptop.  
2. Sign in with a staff email + kitchen password.  
3. The portal key is **encrypted** in public `kitchen/vault.js` (unlocked only by password in the browser).

Private source of truth for passwords: `kitchen/kitchen-config.js` (gitignored).  
After changing passwords: `node scripts/build-kitchen-vault.js` then commit `kitchen/vault.js`.

See [docs/OPERATIONS.md](docs/OPERATIONS.md) and [docs/SECURITY.md](docs/SECURITY.md).

## Core rules

1. Google Sheet is a **database** — no hand-editing cells (whole test rows may be deleted).
2. Order IDs are generated **client-side** (`BB-…`).
3. No payment by Saturday 3 PM → order is not cooked.
4. Cutoff always uses **America/Los_Angeles**.
5. After every Apps Script edit: **Deploy → Manage deployments → New version**.
6. Creative assets and prompts live under **`Artwork/`** only.

## Status

See [docs/STATUS.md](docs/STATUS.md) for live checklist and open items.
