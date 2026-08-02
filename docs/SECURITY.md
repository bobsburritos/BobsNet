# Security notes — Bob's Burritos / BobsNet

## Public vs private

| Asset | Public? | Notes |
|--------|---------|--------|
| Order site (`index.html`) | Yes (GitHub Pages) | No portal key / kitchen password |
| Apps Script Web app URL | Public by design | Anyone can POST orders; validation is server-side |
| `PORTAL_KEY` | **Private** | Kitchen + markPaid / doGet only |
| Kitchen password | **Private** | `kitchen/kitchen-config.js` only (gitignored) |
| Google Sheet | Private Google ACL | Business account owns it |

## Secrets location

- **Never commit:** `kitchen/kitchen-config.js`, `local/**`, `.portal_key_local_only.txt`
- **Template only:** `kitchen-config.example.js`, `apps-script/bobs-burritos-backend.gs` (placeholder key)
- **Live backend secrets:** paste from `local/bobs-burritos-backend.READY.gs` into Apps Script, then **Deploy → New version**

## Threat model (honest)

1. **Order spam / junk orders** — mitigated by field length limits, qty caps, honeypot, server-side price calc, orderId format check, soft de-dupe.
2. **Portal key leak** — anyone with key can list orders / mark paid. Keep key only in kitchen-config + Apps Script.
3. **Kitchen HTML on Pages** — UI can be opened at `/kitchen/` but login fails without config; still `noindex`. Prefer opening the local file.
4. **Client-side kitchen login** — deters casual access; not bank-grade if someone has the HTML+config files.
5. **XSS in kitchen** — order fields escaped before `innerHTML`.
6. **Payment fraud** — out of band Venmo/Zelle; unpaid orders simply are not cooked (business rule).

## After cloning on a new machine

1. Copy `kitchen-config.example.js` → `kitchen/kitchen-config.js`
2. Fill password + portalKey + scriptUrl
3. Open `kitchen/index.html` locally
4. Paste READY backend into Apps Script if needed; deploy new version
