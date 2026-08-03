# Costco / warehouse COGS reference

**Purpose:** Ballpark pack prices for kitchen grocery estimates.  
**Last research pass:** 2026-08-03  
**Live prices vary** by warehouse, week, and membership; replace with **your receipt** when you shop.

Kitchen code: `kitchen/index.html` → `GROCERY` array.

## Portions (still estimates until you measure)

| Use in burrito | Amount |
|----------------|--------|
| Tortilla | 1 large flour |
| Eggs | 2 large |
| Cheese | ~2 oz shredded |
| Hash browns | ~3 oz |
| Soy chorizo | ~4 oz (Soyrizo only) |
| Ground beef | ~4 oz (Cali only) |
| Sausage | ~2 oz (Heavy only) |
| Bacon | ~2 slices (Heavy only) |
| Avocado | ½ fruit (Cali included + avo add-ons) |
| Onion | ~1 oz |
| Chipotle mayo | ~1.5 oz mayo base + chipotle |

## Pack price table (ballpark)

| Ingredient | Pack we model | Pack $ | Source / note |
|------------|---------------|--------|----------------|
| **Eggs** | Kirkland Signature Large **24-ct** item **#637598** | **$3.28** | **Your Costco shelf** (confirmed) |
| Flour tortillas | Mission-style multi-pack ~**40-ct** | **$9.49** | Costco Mission multi-pack typically ~$8–11 |
| Shredded cheese | Kirkland shredded ~**2.5 lb (40 oz)** | **$12.89** | Kirkland cheddar/Mexican blend often ~$11–14 |
| Hash browns | Ore-Ida shredded **6 lb** (item ~42125 business) | **$9.49** | Costco frozen hash brown ballpark ~$8–11 |
| Soy chorizo | Trader Joe’s **12 oz** | **$3.49** | Usually **not** Costco; TJ ~$3–4 |
| Ground beef | Kirkland 80/20 **1 lb** | **$5.79** | Moves with beef market; often ~$5–7/lb |
| Breakfast sausage | Bulk roll/links ~**3 lb** | **$15.99** | Jimmy Dean / similar bulk ~$14–18 |
| Bacon | Kirkland bacon multi-pack (~**48 slices** est.) | **$17.99** | Kirkland bacon packs often ~$16–22 |
| Avocados | Hass bag **6-ct** | **$7.99** | Costco bags often **$6.99–$9.99** seasonal |
| Yellow onions | Bag ~**5 lb** | **$5.49** | Produce bag ~$4–7 |
| Cilantro | **1 bunch** | **$1.29** | Usually supermarket $0.99–1.99 |
| Mayo | Kirkland mayo ~**64 oz** | **$7.69** | Kirkland mayo often ~$7–9 |
| Chipotles in adobo | **7 oz can** | **$1.89** | Grocery/Costco multi; ~$1.50–2.50/can |
| Taco seasoning | **1 packet** | **$1.29** | Or Costco bulk jar (then re-model pack size) |
| Sauce cups + lids | **100-ct** 2 oz | **$11.99** | Restaurant supply ~$10–15 |
| Takeout boxes | **50-ct** kraft/#3 | **$18.99** | Supply ~$15–25 |
| Foil | Kirkland/Reynolds HD roll (~**130** wraps est.) | **$16.99** | Costco foil ~$15–22; Reynolds HD 2-pk often ~$21 |

## Example: eggs math (why $55 looked wrong)

| Burritos | Eggs needed (×2) | Packs of 24 | @ $5.50 old | @ **$3.28** now |
|----------|------------------|-------------|-----------------|-----------------|
| 120 | 240 | 10 | **$55.00** | **$32.80** |

## How kitchen estimates work

```
packs_to_buy = ceil(need / packSize)
est_cost     = packs_to_buy × packPrice
```

UI shows: `N × pack description @ $packPrice`.

## Update after your next Costco run

Send or paste:

```
Item | Brand | Item# | Pack size | Price paid | Date | Warehouse
```

We’ll lock those lines as `note: 'receipt YYYY-MM-DD'`.

## Not Costco (call out)

| Item | Typical source |
|------|----------------|
| Soy chorizo | Trader Joe’s |
| Cilantro | Any grocery |
| Sauce cups / boxes | Restaurant Depot / Amazon |
| Chipotle cans | Grocery if not in multi-pack at Costco |
