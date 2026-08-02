#!/usr/bin/env python3
"""Generate og-image.png (1200x630 link-preview card) with a scannable QR.

Usage:  python3 make-og-image.py https://your-real-url.github.io/bobs-burritos/
Re-run with the real URL at deploy time — a QR made from a placeholder is dead.
"""
import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

URL = sys.argv[1] if len(sys.argv) > 1 else 'https://YOUR-USERNAME.github.io/bobs-burritos/'

GRAPE = (61, 26, 92)
SUNBEAM = (255, 210, 63)
CREAM = (255, 244, 220)
TANGERINE = (255, 138, 61)
LILAC = (201, 167, 240)
W, H = 1200, 630

TEXT_X = 450          # left edge of all text — right of the sun arch
QR_PANEL_X = 935      # left edge of QR panel; text must stay left of this

img = Image.new('RGB', (W, H), GRAPE)
d = ImageDraw.Draw(img)

# Sun arch, tucked into the bottom-left corner, clear of all text
cx, cy = 120, H + 170
for r, c in [(350, LILAC), (265, TANGERINE), (180, SUNBEAM), (100, CREAM)]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

def font(size, bold=True):
    path = ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold
            else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
    return ImageFont.truetype(path, size)

def fit_font(text, max_width, start_size, bold=True):
    size = start_size
    while size > 12 and d.textlength(text, font=font(size, bold)) > max_width:
        size -= 2
    return font(size, bold)

max_text_w = QR_PANEL_X - TEXT_X - 40   # keep everything clear of the QR panel

# Title
title = "BOB'S BURRITOS"
f = fit_font(title, W - TEXT_X - 60, 82)   # title may run under full width (QR sits lower)
d.text((TEXT_X, 90), title, font=f, fill=SUNBEAM)
d.text((TEXT_X + 3, 93), title, font=f, fill=SUNBEAM)

# Tagline
f = fit_font("Sunday breakfast burritos,", max_text_w, 40, bold=False)
d.text((TEXT_X, 215), "Sunday breakfast burritos,", font=f, fill=CREAM)
d.text((TEXT_X, 268), "delivered to your door.", font=f, fill=CREAM)

# Yellow pill, sized to its text
pill_text = "Order by Sat 3 PM · from $10"
pf = fit_font(pill_text, max_text_w - 64, 30)
tw = d.textlength(pill_text, font=pf)
px0, py0 = TEXT_X, 365
px1, py1 = px0 + tw + 64, py0 + 74
d.rounded_rectangle([px0, py0, px1, py1], radius=37, fill=SUNBEAM)
d.text((px0 + 32, py0 + 20), pill_text, font=pf, fill=GRAPE)

# Info lines — cream for contrast, clear of the arch
d.text((TEXT_X, 475), "Delivered Sundays 9 AM–12 PM", font=font(30), fill=CREAM)
d.text((TEXT_X, 530), "1111 Wilshire residents only", font=font(26, False), fill=LILAC)

# QR panel bottom-right
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=1)
qr.add_data(URL)
qr.make(fit=True)
qimg = qr.make_image(fill_color='#3D1A5C', back_color='white').convert('RGB').resize((190, 190), Image.NEAREST)
d.rounded_rectangle([QR_PANEL_X - 15, 350, QR_PANEL_X + 205, 597], radius=20, fill='white')
img.paste(qimg, (QR_PANEL_X, 365))
lbl = 'scan to order'
lf = font(22)
lw = d.textlength(lbl, font=lf)
d.text((QR_PANEL_X + (190 - lw) / 2, 561), lbl, font=lf, fill=GRAPE)

img.save('og-image.png')
print('wrote og-image.png for', URL)
