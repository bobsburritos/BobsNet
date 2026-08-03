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
