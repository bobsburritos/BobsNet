# Brand tiles (Posts 2, 6, 8)

| File | Post | Size |
|------|------|------|
| `tile-02-who-we-are.svg` | 2 Who we are | 1080×1350 (4:5) |
| `tile-06-how-sunday-works.svg` | 6 How Sunday works | 1080×1350 |
| `tile-08-woman-owned.svg` | 8 Woman-owned story | 1080×1350 |

Colors: purple `#3D1A5C` · gold `#FFD23F` · orange `#FF8A3D` · lilac `#C9A7F0` · cream `#FFF4DC`

## Export to Instagram PNG

### Browser (fast)

1. Open the SVG in Chrome/Edge (double-click or drag into a tab).
2. Zoom so the tile fills the view, or use an online SVG→PNG at **1080×1350**.
3. Or open `export-tiles.html` in this folder — it draws each tile and offers download buttons (if present).

### Canva / Figma

1. Import SVG or recreate using same hexes and copy.
2. Export **PNG**, 1080×1350, sRGB.

### ImageMagick (if installed)

```powershell
magick -background none tile-02-who-we-are.svg -resize 1080x1350 PNG32:tile-02-who-we-are.png
```

Prefer a **real founder photo** for Post 8 when ready; keep this tile as backup.
