# Costco / warehouse COGS reference

**Purpose:** Pack prices for kitchen estimates.  
**Last update:** 2026-08-24 (locked takeout boxes from Amazon receipt)  
**Kitchen code:** `kitchen/index.html`

### Two systems in kitchen (v2 flow)

| Zone | What | How it works |
|------|------|----------------|
| **Top: Kitchen inventory** | Condiments + cups/boxes/foil | On-hand stock on this device. Past Sundays **auto-deplete**. Shows this Sunday’s use + after |
| **Shopping list** | Food for Sunday **+** inventory shortfalls | Check **Got it** when purchased. Inventory packs **restock** stock; food lines are checklist only |
| **Bottom: This Sunday** | Cook board / money / delivery | Header ‹ › browses delivery Sundays |

**Seed once:** “Seed / adjust starting stock” (e.g. 200 cups). After that, don’t hand-edit weekly — check shopping boxes and let orders reduce tallies.

Inventory stock is **browser `localStorage`** on the kitchen device.

### Product catalog structure (bones)

Every line in code has the same shape so we can **lock exact products over time** (lowest cost that still works):

```
id, list (food|inventory), group, item, unit
brand, sku, store, pack, packSize, packPrice
confirmed: true | false   ← LOCKED green badge vs EST purple
need(t)  or  usage(t)+reorderAt
```

| Badge | Meaning |
|-------|---------|
| **LOCKED** | Exact product + pack $ you’ve confirmed — prefer this every time |
| **EST** | Placeholder brand/size/price — replace when you find the best SKU |

**How to lock a new product:** send  
`role (food/condiment/supply) | brand | item# | pack size | price | store`  
→ we set `confirmed:true` and update pack/sku/price.

Goal: same cart every Costco/TJ run, minimize $/burrito without changing the recipe.

## Locked (your Costco / TJ)

| Ingredient | Item | Pack | Price | Status |
|------------|------|------|-------|--------|
| **Eggs** | Kirkland Large 24-ct | **#637598** | **$3.28** | Confirmed |
| **Tortillas** | Mission 10" flour **40-ct** | **#208429** | **$8.99** | Confirmed |
| **Cheese** | Kirkland Mexican blend **2.5 lb × 2** | **#1165284** | **$15.31** | Confirmed (80 oz total) |
| **Ground beef** | Kirkland **88/12** | **#33724** | **$6.80 / lb** | Confirmed (sold by weight) |
| **Bacon** | Kirkland sliced **1 lb × 4** | **#7000070** | **$17.01** | Confirmed (~64 slices est.) |
| **Avocados** | Hass **6-ct** | **#647465** | **$6.23** | Confirmed (12 halves) |
| **Soy chorizo** | Trader Joe’s | **#092463** | **$2.99 / 12 oz** | Confirmed |
| **Mayo** | Kirkland Real Mayonnaise **64 oz** | **#503961** | **$5.19** | Confirmed ($0.08/oz) |
| **Chipotle sauce** | La Costeña Medium Chipotle **220 ml** | — | **$1.59** | Confirmed (for house mayo) |
| **Foil** | Kirkland Reynolds Foodservice HD **18" × 500 ft** | **#31684** | **$45.99** | Confirmed; ~400 wraps est. |
| **Hash browns** | Ore-Ida shredded **6 lb** | **#42125** | **$6.99** | Confirmed frozen |
| **Takeout boxes** | JOLLY CHEF clamshell 9x6 compostable **75-ct** | Amazon | **$19.48** | Confirmed 2026-08-14 ($0.26/box) |

TJ link: https://www.traderjoes.com/home/products/pdp/soy-chorizo-092463

### Foil math (#31684)
- Roll: 18 in × **500 ft** = 6,000 linear inches  
- Burrito sheet ~14 in along the roll → **~428 sheets** → kitchen uses **400** packs-worth as conservative packSize  
- One roll @ **$45.99** covers a large batch before reorder  

### Chipotle sauce
- Switched from “cans of chipotles in adobo” to **La Costeña Medium Chipotle Sauce 220 ml @ $1.59**  
- Portion model: **1 bottle ≈ 25 burritos** of house mayo (tune when recipe is measured)

## Still ballpark (confirm next trip)

| Ingredient | Pack we model | Pack $ | Note |
|------------|---------------|--------|------|
| Breakfast sausage | Bulk ~3 lb | $15.99 | Jimmy Dean / similar |
| Yellow onions | ~5 lb bag | $5.49 | Produce |
| Cilantro | 1 bunch | $1.29 | Grocery |
| Taco seasoning | 1 packet | $1.29 | Cali beef |
| Sauce cups + lids | 100-ct | $11.99 | Supply |

## How kitchen math works

```
packs = ceil(need / packSize)
cost  = packs × packPrice
```

### Cheese (#1165284)
- One Costco unit = **two** 2.5 lb bags = **5 lb = 80 oz** @ **$15.31**
- Need 2 oz cheese × N burritos → packs of 80 oz

### Bacon (#7000070)
- One Costco unit = **4 × 1 lb** @ **$17.01**
- Modeled as **~64 slices** (≈16 slices/lb × 4) — adjust if your pack slice count differs

### Beef (#33724)
- Priced **per pound** $6.80; pack size modeled as **1 lb (16 oz)** so multi-lb chubs count as multiple packs in the estimate

### Eggs example (~120 burritos)
| | |
|--|--|
| Need | 240 eggs |
| Packs | 10 × 24-ct |
| @ $3.28 | **$32.80** (was $55 @ old $5.50) |

## Portions (still recipe estimates)

| | |
|--|--|
| Tortilla | 1 |
| Eggs | 2 |
| Cheese | 2 oz |
| Hash browns | 3 oz |
| Soy chorizo | 4 oz (Soyrizo) |
| Beef | 4 oz (Cali) |
| Sausage | 2 oz (Heavy) |
| Bacon | 2 slices (Heavy) |
| Avocado | ½ fruit (Cali + add-ons) |

## After next shop

Paste any remaining lines as:  
`Item | # | Pack | Price`  
We’ll lock them the same way.
