"""Render Instagram brand tiles as 1080x1350 PNG. Run from anywhere:

    python scripts/render_ig_tiles.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "instagram" / "assets"
W, H = 1080, 1350
PURPLE = (61, 26, 92)
GOLD = (255, 210, 63)
ORANGE = (255, 138, 61)
LILAC = (201, 167, 240)
CREAM = (255, 244, 220)


def font(size: int, bold: bool = True) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def arcs(draw: ImageDraw.ImageDraw, corner: str) -> None:
    if corner == "bl":
        cx, cy = -40, H + 40
        for r, color, width in [(580, LILAC, 70), (420, ORANGE, 62), (260, GOLD, 54)]:
            draw.arc([cx - r, cy - r, cx + r, cy + r], start=270, end=360, fill=color, width=width)
    elif corner == "br":
        cx, cy = W + 20, H + 20
        for r, color, width in [(520, LILAC, 64), (360, ORANGE, 56), (200, GOLD, 48)]:
            draw.arc([cx - r, cy - r, cx + r, cy + r], start=180, end=270, fill=color, width=width)
    elif corner == "bl_small":
        cx, cy = -40, H + 40
        for r, color, width in [(480, LILAC, 64), (340, ORANGE, 56), (200, GOLD, 48)]:
            draw.arc([cx - r, cy - r, cx + r, cy + r], start=270, end=360, fill=color, width=width)


def tile_02() -> None:
    img = Image.new("RGB", (W, H), PURPLE)
    d = ImageDraw.Draw(img)
    arcs(d, "bl")
    d.text((96, 180), "BOB'S BURRITOS", font=font(28), fill=LILAC)
    y = 340
    for line in ["SUNDAY", "BREAKFAST", "BURRITOS,", "DELIVERED."]:
        d.text((96, y), line, font=font(70), fill=GOLD)
        y += 88
    d.text((96, 780), "Woman-owned · small-batch", font=font(30, bold=False), fill=CREAM)
    d.text((96, 830), "hand-rolled · famous chipotle mayo", font=font(30, bold=False), fill=CREAM)
    d.text((96, 1220), "@bobsburritosco", font=font(26, bold=False), fill=LILAC)
    img.save(OUT / "tile-02-who-we-are.png", "PNG")


def tile_06() -> None:
    img = Image.new("RGB", (W, H), PURPLE)
    d = ImageDraw.Draw(img)
    arcs(d, "br")
    d.text((96, 140), "BOB'S BURRITOS", font=font(26), fill=LILAC)
    d.text((96, 240), "HOW SUNDAY", font=font(64), fill=GOLD)
    d.text((96, 320), "WORKS", font=font(64), fill=GOLD)
    steps = [
        (1, "Order by Saturday 3PM", "Lock in before the batch closes"),
        (2, "We roll fresh Sunday morning", "Hand-rolled, small-batch, woman-owned"),
        (3, "Delivered warm 9AM–12PM", "Straight to your door at 1111 Wilshire"),
    ]
    y0 = 480
    for i, (num, title, sub) in enumerate(steps):
        cy = y0 + i * 180
        d.ellipse([100, cy, 180, cy + 80], fill=GOLD)
        tb = d.textbbox((0, 0), str(num), font=font(36))
        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        d.text((140 - tw / 2, cy + 40 - th / 2 - 4), str(num), font=font(36), fill=PURPLE)
        d.text((210, cy + 8), title, font=font(32), fill=CREAM)
        d.text((210, cy + 52), sub, font=font(24, bold=False), fill=LILAC)
    d.text((96, 1100), "Pay Venmo or Zelle · link in bio", font=font(28), fill=GOLD)
    d.text((96, 1220), "@bobsburritosco", font=font(26, bold=False), fill=LILAC)
    img.save(OUT / "tile-06-how-sunday-works.png", "PNG")


def tile_08() -> None:
    img = Image.new("RGB", (W, H), PURPLE)
    d = ImageDraw.Draw(img)
    arcs(d, "bl_small")
    d.text((96, 140), "WOMAN-OWNED", font=font(26), fill=LILAC)
    y = 280
    for line in ["MADE BY A", "WOMAN WHO", "REALLY LIKES", "BREAKFAST"]:
        d.text((96, y), line, font=font(62), fill=GOLD)
        y += 90
    d.text((96, 700), "— the kitchen behind Bob's Burritos", font=font(30, bold=False), fill=CREAM)
    d.text((96, 780), "Small-batch · hand-rolled · Sundays only", font=font(28, bold=False), fill=LILAC)
    d.text((96, 830), "Famous for the chipotle mayo", font=font(28, bold=False), fill=LILAC)
    d.rounded_rectangle([96, 940, 520, 1010], radius=36, fill=GOLD)
    d.text((150, 958), "SUPPORT LOCAL", font=font(28), fill=PURPLE)
    d.text((96, 1220), "@bobsburritosco", font=font(26, bold=False), fill=LILAC)
    img.save(OUT / "tile-08-woman-owned.png", "PNG")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    tile_02()
    tile_06()
    tile_08()
    for name in (
        "tile-02-who-we-are.png",
        "tile-06-how-sunday-works.png",
        "tile-08-woman-owned.png",
    ):
        p = OUT / name
        print(f"OK {p} ({p.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
