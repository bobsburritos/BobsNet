# 10 — Security notes

## Public vs private

| Asset | Public? | Notes |
|--------|---------|--------|
| Order site | Yes (Pages) | No portal key / kitchen password |
| Apps Script Web app URL | Public by design | Validation server-side |
| PORTAL_KEY | **Private** | Kitchen + markPaid |
| Kitchen password | **Private** | kitchen-config.js only |
| Google Sheet | Private ACL | Business Google owns it |

## Never commit
- `kitchen/kitchen-config.js`
- `local/**`
- `.portal_key_local_only.txt`
- Plain passwords in any file

## Threat model (honest)
1. Order spam — limits, honeypot, server totals, orderId format
2. Portal key leak — list orders / mark paid
3. Kitchen UI is public path but needs password vault
4. Client-side kitchen auth is convenience, not bank-grade
5. XSS: kitchen escapes order fields
6. Payment fraud: unpaid simply not cooked

## After clone
1. Copy kitchen-config.example.js → kitchen-config.js
2. Fill password + portalKey + scriptUrl
3. Build vault if needed; open kitchen on HTTPS Pages or local

Canonical: `docs/SECURITY.md`
