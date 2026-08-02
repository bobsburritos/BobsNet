# Project status — Bob's Burritos (BobsNet)

**Last full agent pass:** 2026-08-02  
**Public site:** https://bobsburritos.github.io/BobsNet/  
**Repo:** https://github.com/bobsburritos/BobsNet  

## Live and working

- [x] Public order page (menu, photos, lightbox, LA cutoff, order form)
- [x] GitHub Pages deploy from `main`
- [x] Apps Script Web app wired (`SCRIPT_URL` in `index.html`)
- [x] Google Sheet Orders / Prep tabs
- [x] Order POST → sheet + owner email
- [x] Kitchen portal with email + password login (config gitignored)
- [x] Kitchen mark paid / cook board / grocery / delivery run
- [x] Zelle destination shown (`bobsburritosco@gmail.com`)
- [x] Compressed menu images + cache bust
- [x] Desktop copy-button fix
- [x] Hardened backend READY (validation, server totals) — **needs Deploy New version when you return**

## Needs you (cannot automate)

1. **Apps Script:** paste `local/bobs-burritos-backend.READY.gs` → **Deploy → New version** (clipboard often has latest)
2. **Venmo username** — set `VENMO_USERNAME` in `index.html` (or tell agent)
3. **Confirm Zelle** is enabled on `bobsburritosco@gmail.com` (or give phone)
4. **Delete smoke-test rows** on Orders if still present (`BB-SMOKE1`)
5. **Real product run:** phone order + pay + kitchen mark paid
6. Optional: Venmo/Zelle handles on flyers

## Intentionally not built yet (roadmap)

- Payment reconciler (screenshot → markPaid)
- Custom domain
- Real auth for hosted kitchen (Firebase / Cloudflare Access)
- Receipt-based grocery COGS lock-in
- SMS notifications

## Paths

| What | Where |
|------|--------|
| Order site source | `index.html` |
| Kitchen UI | `kitchen/index.html` |
| Kitchen secrets | `kitchen/kitchen-config.js` (**gitignored**) |
| Backend READY | `local/bobs-burritos-backend.READY.gs` |
| Ops | `docs/OPERATIONS.md` |
| Security | `docs/SECURITY.md` |
