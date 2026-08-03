# Bob's Burritos — Claude document pack

**Purpose:** Flat, numbered brand + business context for Claude (and any agent).  
**Source of truth in repo:** `Artwork/` (creative) and `docs/` (ops).  
**This folder:** digests + copies so Claude stays oriented. When Artwork or ops change, re-run:

```bash
python scripts/build_claude_pack.py
```

**Generated:** 2026-08-02  
**Repo:** https://github.com/bobsburritos/BobsNet  
**Order site:** https://bobsburritos.github.io/BobsNet/  
**Kitchen:** https://bobsburritos.github.io/BobsNet/kitchen/  
**Instagram:** https://www.instagram.com/bobsburritosco/

## Numbered set

| File | Topic |
|------|--------|
| `00_INDEX.md` | This map |
| `01_business_overview.md` | What we sell, who, where, weekly rhythm |
| `02_brand_kit.md` | Colors, type, logo, voice, signature arcs |
| `03_voice_and_site_copy.md` | Public site copy rules (woman-owned, Wilshire) |
| `04_menu_and_pricing.md` | Menu, prices, add-ons, sauce |
| `05_payments_and_ops.md` | Venmo/Zelle, kitchen, sheet, weekly ops |
| `06_ai_prompts.md` | On-brand image/prompt pack |
| `07_instagram_system.md` | Profile, grid, calendar, posting order |
| `08_instagram_first9.md` | First 9 posts (captions + artwork folders) |
| `09_file_map.md` | Where files live in the repo |
| `10_security_notes.md` | Public vs private, secrets |
| `11_status_open.md` | Live checklist + open human tasks |
| `12_instagram_playbook_full.md` | Full launch playbook (long) |
| `CLAUDE.md` | Short entrypoint for Claude Code |

## Rules for agents

1. Do **not** invent new brand colors or fonts.  
2. Creative assets go under `Artwork/`, never floating at repo root.  
3. Secrets never in git: kitchen passwords, portal key, `local/`.  
4. Woman-owned on the **order page** only in hero badge + footer signature.  
5. 1111 Wilshire is delivery zone; emphasize at **checkout**, not every marquee line.
