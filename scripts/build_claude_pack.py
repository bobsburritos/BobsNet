# -*- coding: utf-8 -*-
"""Build flat numbered brand/business docs under .claude/ for Claude."""
from __future__ import annotations

from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".claude"


def write(name: str, text: str) -> None:
    OUT.mkdir(exist_ok=True)
    path = OUT / name
    path.write_text(text.strip() + "\n", encoding="utf-8", newline="\n")
    print(f"wrote {name} ({path.stat().st_size} bytes)")


def clean(text: str) -> str:
    replacements = [
        ("\u2014", "—"),
        ("â€”", "—"),
        ("â€“", "–"),
        ("â†’", "→"),
        ("Â·", "·"),
        ("Artwork/Brand/Artwork/Brand/", "Artwork/Brand/"),
    ]
    for a, b in replacements:
        text = text.replace(a, b)
    return text


def main() -> None:
    today = date.today().isoformat()

    write(
        "00_INDEX.md",
        f"""
# Bob's Burritos — Claude document pack

**Purpose:** Flat, numbered brand + business context for Claude (and any agent).  
**Source of truth in repo:** `Artwork/` (creative) and `docs/` (ops).  
**This folder:** digests + copies so Claude stays oriented. When Artwork or ops change, re-run:

```bash
python scripts/build_claude_pack.py
```

**Generated:** {today}  
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
""",
    )

    write(
        "01_business_overview.md",
        """
# 01 — Business overview

## One-liner
**Bob's Burritos** is a woman-owned, small-batch Sunday breakfast burrito kitchen. Residents order during the week; food is hand-rolled Sunday morning and delivered warm.

## Positioning (internal)
*The Sunday breakfast burrito LA plans its weekend around — woman-owned, small-batch, and famous for the sauce.*

## Origin of the name "Bob"
**There is no Bob.** The founder is **Khushbu**. Her name is constantly misspelled (Cushbob, Kushbu, Cash-bab, Koshbob, and more) on coffee cups and tickets. She embraced the most common mangling and named the business Bob's Burritos — an affectionate nod to a decade of butchered name tags. Quietly reinforces woman-owned + real person who loves breakfast.

**Reveal (payoff, not footnote):** *There is no Bob — it's Khushbu.*

## Model
- **Product:** Three breakfast burritos + house chipotle mayo on the side every order
- **Cadence:** Sundays only for delivery
- **Cutoff:** Saturday 3:00 PM America/Los_Angeles
- **Delivery window:** Sunday 9:00 AM – 12:00 PM
- **Service area:** **1111 Wilshire** residents (unit number on order)
- **Payments:** Out of band Venmo / Zelle (not card on site)
- **Order IDs:** Client-generated `BB-…`
- **Database:** Google Sheet (Orders tab) via Apps Script Web app

## Public surfaces
| Surface | URL |
|---------|-----|
| Order site | https://bobsburritos.github.io/BobsNet/ |
| Kitchen (staff) | https://bobsburritos.github.io/BobsNet/kitchen/ |
| Instagram | https://www.instagram.com/bobsburritosco/ |
| GitHub | https://github.com/bobsburritos/BobsNet |
| Business email | bobsburritosco@gmail.com |

## Tagline / slogan
Logo badge: **Rise and Roll**

## Weekly ops rhythm
1. Week: residents order on the site
2. Sat 3 PM: cutoff (site rolls late orders to next Sunday)
3. Kitchen: login → cook board, grocery, money, delivery run
4. Mark paid in kitchen only (not hand-editing sheet cells)
5. Sunday: roll, pack, deliver by unit

## Audience
Primary: 1111 Wilshire residents. Secondary: LA foodies / woman-owned supporters via Instagram (awareness; delivery still building-scoped for now).
""",
    )

    write(
        "02_brand_kit.md",
        """
# 02 — Brand kit

**Canonical full kit:** `Artwork/Brand/BRAND-KIT.md` (includes Origin Story, Meet Bob, Who's Bob? thread).

## Positioning
Woman-owned · Sunday-only · small-batch · hand-rolled · famous house chipotle mayo.  
**Founder:** Khushbu · **Brand name:** Bob's Burritos (no literal Bob).

## Origin Story / The Name
There is no Bob. Founder Khushbu's name is mangled constantly (Cushbob, Kushbu, Cash-bab, Koshbob…). She named the business after the most common mangling. Emotional payoff: *There is no Bob — it's Khushbu.* Tone: self-aware, warm, funny, human — never corporate.

## Content thread: Who's Bob?
Story highlight collecting real misspellings; gag coffee-cup close-ups; Reel of Khushbu reading the worst names aloud. See `Artwork/Instagram/Profile/whos-bob-thread.md`.

## Colors (only these for brand graphics)

| Role | Name | Hex |
|------|------|-----|
| Primary field / text on light | Grape / deep purple | `#3D1A5C` |
| Deep | Grape deep | `#2A1140` |
| CTA / headlines on purple | Golden yellow / sunbeam | `#FFD23F` |
| Warmth / energy | Sunrise orange / tangerine | `#FF8A3D` |
| Soft secondary | Lilac / lavender | `#C9A7F0` |
| Light bg / body on purple | Warm cream | `#FFF4DC` or `#FBF3E4` |

**60/30/10:** ~60% neutral (photo/cream), 30% purple, 10% yellow/orange accent.

## Signature device
Concentric **sunrise arcs/rings** — lavender outer → orange mid → gold inner — same energy as the circular logo badge.

## Typography
- **Display / logo feel:** chunky rounded bold (logo-like wordmark). Gold on purple or purple on cream.
- **Web body:** Fredoka (site).
- **Display on site titles:** Shrikhand.
- **Never:** thin fashion serifs, random script, default Canva clichés.

## Voice
Friendly · funny · bold · fresh · premium-but-approachable · self-aware · human · never corporate.
Talk like a cool friend who makes an incredible burrito — warm, a little cheeky, not salesy.
The name story unlocks humor and vulnerability without apology.

## Logo
- Primary: `Artwork/Brand/Logos/bobs-burritos-instagram-logo.jpeg`
- Circular badge: Bob's Burritos + burrito + sunrise rings + **Rise and Roll**

## Link preview / OG
- Source: `Artwork/Brand/Social/og-image-source.png` (1200×630)
- Live: `assets/brand/og-share.png` + meta tags on `index.html`
- URL: https://bobsburritos.github.io/BobsNet/assets/brand/og-share.png

## Photography rules (food)
- Bright natural window light, warm morning — **never dark moody food-porn**
- White speckled ceramic, linen, warm wood
- Hero burritos: cut cross-section toward camera
- **Sauce ramekin always in frame** for food shots
- Aspect: 4:5 feed, 9:16 Stories/Reels

## Repo home for brand
`Artwork/Brand/` — kit, logos, social sources.
""",
    )

    write(
        "03_voice_and_site_copy.md",
        """
# 03 — Voice and public site copy rules

## Woman-owned on the order page
**Exactly two placements** (do not scatter more):

1. **Hero badge:** `★ Woman-owned ★`
2. **Footer signature:** `Woman-owned · Small-batch breakfast burritos · 1111 Wilshire, Los Angeles · Sundays only`

Elsewhere use product language: small-batch, hand-rolled, Sunday, sauce — not repeated "woman-owned."

## 1111 Wilshire
- Delivery is for this building only.
- Emphasize at **checkout** (order form / unit field).
- Do not stamp every marquee line with the address if it clutters the brand story.
- Footer signature may keep the address as business location.

## Example hero subhead (approved style)
> A small-batch kitchen rolling breakfast burritos every Sunday — delivered to your door at 1111 Wilshire.

## Yellow ribbon under hero (approved)
> ★ Hand-rolled Sunday mornings, delivered to your door ★

## Marquee tone
Product + ops: hand-rolled every Sunday, delivered to your door, Sat 3 PM cutoff, house chipotle mayo — not a wall of woman-owned repeats.

## Instagram / marketing
Woman-owned is a **headline** in social storytelling (posts, playbook) even when the website keeps it to two placements. Captions and brand tiles may lead with it.

## Payments language on site
After order: copy payment note → Venmo or Zelle → paste note in memo.
Venmo: @Khushbu-Kotecha · Zelle: 7148120977

## QR / share footer
> Show a neighbor — Sundays only, order by Sat 3 PM
""",
    )

    write(
        "04_menu_and_pricing.md",
        """
# 04 — Menu and pricing

Every burrito ships with **house chipotle mayo on the side**.

| Burrito | Price | Notes |
|---------|-------|--------|
| **Soyrizo Sunrise** | $10 | Vegetarian — soy chorizo, eggs, cheese, hash browns, onions & cilantro. **+ Avocado $2** |
| **The Cali** | $12 | Taco-seasoned beef · **avocado included** — eggs, cheese, hash browns, onions & cilantro |
| **The Heavyweight** | $10 | Sausage + bacon — eggs, cheese, hash browns, onions & cilantro. **+ Avocado $2** |

## Ops rules
- No payment by Saturday 3 PM → order is not cooked.
- Cutoff timezone always **America/Los_Angeles**.
- Order IDs: `BB-…` generated client-side.
- Google Sheet is a **database** — no hand-editing cells (whole test rows may be deleted).

## Signature product story
People come back for the **chipotle mayo**. Merchandise the sauce in content.
""",
    )

    write(
        "05_payments_and_ops.md",
        """
# 05 — Payments and operations

## Payments (out of band)
| Method | Destination |
|--------|-------------|
| **Venmo** | @Khushbu-Kotecha |
| **Zelle** | 7148120977 (name: Bob's Burritos on site) |

**Payment note format** (residents paste into Venmo/Zelle memo):

```
BB-XXXXX | Name | Unit NNN | $TT.TT
```

No card processing on site. Unpaid → not cooked.

## Live endpoints
| Role | URL |
|------|-----|
| Order site | https://bobsburritos.github.io/BobsNet/ |
| Kitchen | https://bobsburritos.github.io/BobsNet/kitchen/ |
| Sheet | Google Sheet Orders/Prep (business Google account) |
| API | Apps Script Web app `/exec` (in private config / index.html SCRIPT_URL) |

## Kitchen portal
- Login: staff email + password (decrypts vault → portal key in browser).
- Public: `kitchen/vault.js` (encrypted only).
- Private: `kitchen/kitchen-config.js` (gitignored).
- After password changes: `node scripts/build-kitchen-vault.js` → commit only `vault.js`.
- Session ~12 hours.
- Features: cook board, grocery list, money (expected/paid/owed), chase unpaid, delivery run by unit, mark paid.

## After Apps Script edits
**Deploy → Manage deployments → New version** (save alone does not ship).

## Weekly flow
1. Orders all week on public site
2. Email notify business Gmail
3. Sat 3 PM cutoff
4. Kitchen prep + mark paid
5. Sunday delivery 9–12

## Source docs
- `docs/OPERATIONS.md`
- `docs/DEPLOYMENT.md`
- `docs/GOOGLE-SETUP.md`
""",
    )

    prompts_path = ROOT / "Artwork" / "Instagram" / "Prompts" / "prompts.md"
    prompts = clean(prompts_path.read_text(encoding="utf-8", errors="replace"))
    write(
        "06_ai_prompts.md",
        f"""
# 06 — AI prompts (on-brand)

**Canonical path:** `Artwork/Instagram/Prompts/prompts.md`  
**Logo ref:** `Artwork/Brand/Logos/bobs-burritos-instagram-logo.jpeg`

---

{prompts}
""",
    )

    write(
        "07_instagram_system.md",
        """
# 07 — Instagram system

## Profile
- Handle: **@bobsburritosco**
- Professional / Business + Facebook Page for scheduling tools

### Bio (paste)
```
Woman-owned Sunday breakfast burritos 🌅
Small-batch, hand-rolled, famous chipotle mayo
Order by Sat 3PM → link below
```
Link: https://bobsburritos.github.io/BobsNet/

### Highlights (suggested)
Menu · How to order · Sauce · Woman-owned · Sunday Club · FAQ

## Grid strategy (first 9)
Checkerboard food vs purple brand tiles. Publish **reverse order 9→1** so Post 1 lands top-left.

| Publish day | Post | Folder |
|-------------|------|--------|
| 1 | 09 Community | `Artwork/Instagram/Posts/09-community/` |
| 2 | 08 Woman-owned | `Artwork/Instagram/Posts/08-woman-owned/` |
| 3 | 07 Cali in hand | `Artwork/Instagram/Posts/07-cali-in-hand/` |
| 4 | 06 How Sunday works | `Artwork/Instagram/Posts/06-how-sunday-works/` |
| 5 | 05 Lineup (**pin**) | `Artwork/Instagram/Posts/05-lineup/` |
| 6 | 04 Sauce | `Artwork/Instagram/Posts/04-sauce/` |
| 7 | 03 Soyrizo | `Artwork/Instagram/Posts/03-soyrizo/` |
| 8 | 02 Who we are | `Artwork/Instagram/Posts/02-who-we-are/` |
| 9 | 01 Hero Heavyweight | `Artwork/Instagram/Posts/01-hero-heavyweight/` |

Each folder: `post.md` + `artwork/` for finals.

## Weekly content pulse
- **Thu–Sat:** sell / order push (money days)
- **Sun:** proof / live drop
- **Mon:** recap + UGC
- **Tue–Wed:** brand / BTS / sauce

Cadence targets: feed 4–5/week, Stories daily, Reels ~3/week.

## Calendar
`Artwork/Instagram/Calendar/30-day.md` + `30-day.csv`

## UGC
Tag @bobsburritosco · #BobsSundayClub · delivery card in bags.

## Who's Bob? (recurring)
Highlight + Stories of name misspellings; Reel of Khushbu reading worst ones. Reveal: no Bob — it's Khushbu.  
Docs: `Artwork/Brand/BRAND-KIT.md`, `Artwork/Instagram/Profile/whos-bob-thread.md`, Post 8 folder.

## Full playbook
See `12_instagram_playbook_full.md` or `Artwork/Instagram/Playbook/launch-playbook.md`
""",
    )

    posts_dir = ROOT / "Artwork" / "Instagram" / "Posts"
    slugs = [
        "01-hero-heavyweight",
        "02-who-we-are",
        "03-soyrizo",
        "04-sauce",
        "05-lineup",
        "06-how-sunday-works",
        "07-cali-in-hand",
        "08-woman-owned",
        "09-community",
    ]
    chunks = [
        "# 08 — First 9 Instagram posts",
        "",
        "Each post has a folder: `Artwork/Instagram/Posts/<slug>/` with `post.md` and `artwork/`.",
        "Drop final feed images in that post's `artwork/` (e.g. `feed.jpg` 1080×1350).",
        "",
    ]
    for slug in slugs:
        post_md = posts_dir / slug / "post.md"
        chunks.append("---")
        chunks.append("")
        chunks.append(f"## Folder: `{slug}/`")
        chunks.append("")
        if post_md.exists():
            chunks.append(clean(post_md.read_text(encoding="utf-8", errors="replace")))
        else:
            chunks.append("*(missing post.md)*")
        chunks.append("")
    write("08_instagram_first9.md", "\n".join(chunks))

    write(
        "09_file_map.md",
        """
# 09 — File map (repo)

## Creative (source of truth)
```
Artwork/
  Brand/           BRAND-KIT, Logos/, Social/ (OG sources)
  Food/Source/     Master food photos
  Food/Web/        Web reference copies
  Instagram/
    Playbook/      Full launch playbook
    Prompts/       AI prompts
    Posts/0N-*/    One folder per post (post.md + artwork/)
    Calendar/      30-day plan
    Profile/       Bio, posting order, UGC card
    Tiles/         Shared graphic drafts
  Flyers/          Print + lobby TV HTML
  Banners/         Future banners/covers
```

## Live site (code)
```
index.html                 Public order page
assets/food/               Menu photos (shipped)
assets/brand/og-share.png  Link preview image
og-image.png               Legacy/alternate OG at root
kitchen/index.html         Kitchen UI
kitchen/vault.js           Encrypted portal (public)
kitchen-config.example.js
apps-script/               Backend template
scripts/                   vault builder, IG helpers, build_claude_pack.py
```

## Ops docs
```
docs/OPERATIONS.md
docs/DEPLOYMENT.md
docs/GOOGLE-SETUP.md
docs/SECURITY.md
docs/STATUS.md
docs/archive/              Old Fable planning (not active brand)
```

## Private (never commit)
```
kitchen/kitchen-config.js
local/
.portal_key_local_only.txt
```

## Claude pack
```
.claude/00_INDEX.md … 12_… and CLAUDE.md
```

## Rule
No floating brand/content docs. New creative → `Artwork/`. Refresh `.claude` when those change:

```bash
python scripts/build_claude_pack.py
```
""",
    )

    write(
        "10_security_notes.md",
        """
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
""",
    )

    write(
        "11_status_open.md",
        """
# 11 — Status and open items

**Public site:** https://bobsburritos.github.io/BobsNet/  
**Repo:** https://github.com/bobsburritos/BobsNet  

## Live / done
- [x] Order page (menu, lightbox, LA cutoff, form, payments Venmo/Zelle)
- [x] GitHub Pages
- [x] Apps Script + Sheet intake + owner email
- [x] Kitchen portal (login, cook, grocery, money, delivery, mark paid)
- [x] Woman-owned: badge + footer only on site
- [x] Instagram link @bobsburritosco
- [x] Artwork/ brand + IG pack structure
- [x] Link preview OG image (assets/brand/og-share.png)
- [x] Kitchen mobile layout
- [x] Claude pack under `.claude/`

## Needs humans
1. Apps Script **Deploy → New version** when READY.gs changes
2. Confirm Zelle on 7148120977
3. Delete smoke-test sheet rows if any
4. Real Sunday product run end-to-end
5. Instagram: bio, first 9 artwork in Posts/*/artwork/, reverse post
6. Optional founder photo for Post 8

## Roadmap (not built)
Payment reconciler · custom domain · stronger kitchen auth · SMS · Graph API auto-publish

Canonical: `docs/STATUS.md`
""",
    )

    play_path = ROOT / "Artwork" / "Instagram" / "Playbook" / "launch-playbook.md"
    play = clean(play_path.read_text(encoding="utf-8", errors="replace"))
    write(
        "12_instagram_playbook_full.md",
        f"""
# 12 — Instagram launch playbook (full)

**Canonical path:** `Artwork/Instagram/Playbook/launch-playbook.md`

---

{play}
""",
    )

    write(
        "CLAUDE.md",
        """
# Claude — Bob's Burritos context

Read **`00_INDEX.md`** first, then the numbered docs in this folder for brand and business context.

- Creative source of truth: `../Artwork/`
- Ops source of truth: `../docs/`
- Brand colors & type: `02_brand_kit.md`
- Site copy rules: `03_voice_and_site_copy.md`
- Menu: `04_menu_and_pricing.md`
- Payments/ops: `05_payments_and_ops.md`
- Prompts: `06_ai_prompts.md`
- Instagram: `07_instagram_system.md` + `08_instagram_first9.md`
- File map: `09_file_map.md`
- Security: `10_security_notes.md`

Do not invent brand colors. Do not commit secrets. Refresh this pack with:

```bash
python scripts/build_claude_pack.py
```
""",
    )

    print("done →", OUT)


if __name__ == "__main__":
    main()
