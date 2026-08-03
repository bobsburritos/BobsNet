# Artwork — brand & content (single home)

**All creative work lives here.** Do not drop floating brand/content files at the repo root or under `docs/`.

Engineering / ops docs stay in `docs/`. Live website files stay in `index.html`, `assets/`, `kitchen/`.

---

## Map

| Folder | What belongs here |
|--------|-------------------|
| [Brand/](./Brand/) | Logos, brand kit, social OG sources |
| [Food/](./Food/) | Product photography (source masters + web notes) |
| [Instagram/](./Instagram/) | Playbook, prompts, post packs, calendar, tiles |
| [Flyers/](./Flyers/) | Elevator / lobby TV / print marketing HTML |
| [Banners/](./Banners/) | Site ribbons, ads, highlight covers (when created) |

---

## Brand rules (short)

- **Woman-owned**, Sunday-only, sauce-first  
- Colors: purple `#3D1A5C` · gold `#FFD23F` · orange `#FF8A3D` · lilac `#C9A7F0` · cream `#FFF4DC`  
- Signature: concentric **sunrise arcs** (same as logo)  
- Food: bright morning light — never dark moody  

Full prompts: [Instagram/Prompts/prompts.md](./Instagram/Prompts/prompts.md)  
Full creative system: [Instagram/Playbook/launch-playbook.md](./Instagram/Playbook/launch-playbook.md)

---

## Website vs Artwork

| Live site (code) | Artwork (source of truth) |
|------------------|---------------------------|
| `assets/food/*.jpeg` | `Food/Source/` masters, then export to `assets/food/` |
| `og-image.png` (repo root for Pages) | `Brand/Social/` sources |
| `assets/favicon.svg` | Design in Brand when redoing favicon |

When you approve a new food photo: put master in `Food/Source/`, compress into `assets/food/`, bump `?v=` on `index.html` if needed.

---

## Rule

**No floating documents.** New content = new file under the right `Artwork/` subfolder, or a short pointer in engineering `docs/` only.
