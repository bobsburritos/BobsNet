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
- [x] Hardened backend READY **deployed** — release matrix **25/25 PASS**

## Needs you (cannot automate)

1. **Delete test rows** on Orders (`BB-REL*`, `BB-DRY*`, `TEST`)
2. **Browser smoke:** one test order + payment UI (no real transfer) + kitchen mark paid
3. **Confirm Zelle** phone `7148120977` resolves in bank app (cancel before send)
4. **Instagram:** bio + art in `Posts/*/artwork/` + post 9→1
5. Optional: founder photo for Post 8 / Who's Bob?

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
