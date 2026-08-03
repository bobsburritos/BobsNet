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
- [x] Zelle destination shown (`7148120977`)
- [x] Venmo username set (`@Khushbu-Kotecha`)
- [x] Woman-owned messaging on public site
- [x] Instagram linked on site (`@bobsburritosco`)
- [x] Instagram + brand pack under `Artwork/` (playbook, prompts, posts, tiles, calendar)
- [x] Compressed menu images + cache bust
- [x] Desktop copy-button fix
- [x] Hardened backend READY (validation, server totals) — **needs Deploy New version when you return**

## Needs you (cannot automate)

1. **Apps Script:** paste `local/bobs-burritos-backend.READY.gs` → **Deploy → New version** (clipboard often has latest)
2. **Confirm Zelle** works for phone `7148120977`
3. **Delete smoke-test rows** on Orders if still present (`BB-SMOKE1`)
4. **Real product run:** phone order + pay + kitchen mark paid
5. **Instagram profile:** paste bio + link from `Artwork/Instagram/Profile/profile-setup.md`
6. **On-brand tiles:** use prompts in `Artwork/Instagram/Prompts/prompts.md` + logo in `Artwork/Brand/Logos/`
7. **Post first 9** reverse order (`Artwork/Instagram/Profile/posting-order.md`)
8. Optional: Meta Business Suite scheduling; founder photo for Post 8

## Intentionally not built yet (roadmap)

- Payment reconciler (screenshot → markPaid)
- Custom domain
- Real auth for hosted kitchen (Firebase / Cloudflare Access)
- Receipt-based grocery COGS lock-in
- SMS notifications
- Instagram Graph API auto-publish

## Paths

| What | Where |
|------|--------|
| Order site source | `index.html` |
| Kitchen UI | `kitchen/index.html` |
| Kitchen secrets | `kitchen/kitchen-config.js` (**gitignored**) |
| Backend READY | `local/bobs-burritos-backend.READY.gs` |
| Brand + content | `Artwork/` |
| Instagram pack | `Artwork/Instagram/` |
| Ops | `docs/OPERATIONS.md` |
| Security | `docs/SECURITY.md` |
