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
- [x] Customer email required on order form + auto “order received” confirmation (Apps Script MailApp)
- [x] Confirmation email retry queue — status tracked per order (Orders R–V), retried every
      10 min, quota-aware, owner alerted on give-up, kitchen chips + resend, on-page
      “Copy my receipt” fallback (see `docs/DEPLOYMENT.md` §6)
- [x] Draft fallback — when the ~100/day Gmail send cap is hit, receipts are written to
      Gmail Drafts for one-click manual Send, then self-reconcile to `SENT`
- [x] Kitchen “Email customer” (payment / delivery / resend confirmation)
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

1. **Deploy the backend + run `installAllTriggers()` once** in the Apps Script editor.
   Paste `local/bobs-burritos-backend.READY.gs`, Deploy → New version, then run
   `installAllTriggers()` and approve the prompts. **The confirmation retry queue does
   not run until this is done** — without it a failed receipt stays unsent forever.
2. **Delete test rows** on Orders (`BB-REL*`, `BB-DRY*`, `TEST`)
3. **Browser smoke:** one test order + payment UI (no real transfer) + kitchen mark paid.
   Confirm the confirmation email arrives, then check Orders column R reads `SENT`.
4. **Confirm Zelle** phone `7148120977` resolves in bank app (cancel before send)
5. **Instagram:** bio + art in `Posts/*/artwork/` + post 9→1
6. Optional: founder photo for Post 8 / Who's Bob?

## Intentionally not built yet (roadmap)

- Payment reconciler (screenshot → markPaid)
- Custom domain
- Real auth for hosted kitchen (Firebase / Cloudflare Access)
- Receipt-based grocery COGS lock-in
- SMS notifications (email is the primary customer channel for now)
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
