# -*- coding: utf-8 -*-
"""Scaffold per-post Instagram folders under Artwork/Instagram/Posts."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "Artwork" / "Instagram" / "Posts"

POSTS = [
    {
        "slug": "01-hero-heavyweight",
        "num": 1,
        "title": "The Hero (The Heavyweight)",
        "grid": "top-left",
        "bucket": "Food Porn",
        "goal": "scroll-stopper",
        "publish_day": 9,
        "media_type": "food photo",
        "artwork_notes": "Final 4:5 feed image. Optional: reel clip, story frame.",
        "starter": "artwork/source-ref-the-heavyweight.jpeg",
        "prompt_ref": "Post 1 in ../../Prompts/prompts.md",
        "caption": (
            "This is the one that ruins other breakfast burritos for you. "
            "Sausage *and* bacon, eggs, cheese, hash browns, all hugged in a toasted tortilla "
            "\u2014 and that chipotle mayo we can't stop making. We roll these one morning a week, "
            "by hand, in small batches. Sunday's the day. You've been warned. \U0001f305\n\n"
            "Follow so you don't miss this Sunday's drop \u2192 @bobsburritosco\n"
            "Order by Sat 3PM \u2192 link in bio"
        ),
        "hashtags": (
            "#bobsburritos #breakfastburrito #lafoodie #eaterla #laeats #breakfastofchampions "
            "#burritolove #foodporn #dtlaeats #womanownedbusiness #sundaybreakfast #chipotlemayo "
            "#handrolled #smallbatch #losangelesfood #comfortfood #foodphotography #brunchla "
            "#burritosofinstagram #supportsmallbusiness"
        ),
        "alt": (
            "A breakfast burrito cut in half on a white speckled plate, showing eggs, sausage, "
            "bacon, cheese and hash browns inside, with a ramekin of chipotle mayo and a drip of "
            "sauce, in bright morning light."
        ),
        "story": "Full-bleed photo, sunrise-arc sticker, text The Heavyweight, Follow + countdown to Sat 3PM",
        "reel": "5-7s: Sauce drip then split cross-section then steam. Text: POV it's Sunday.",
        "cta": "Follow + order link in bio",
    },
    {
        "slug": "02-who-we-are",
        "num": 2,
        "title": "Who We Are (brand tile)",
        "grid": "top-center",
        "bucket": "Brand Story",
        "goal": "branding + education",
        "publish_day": 8,
        "media_type": "graphic tile",
        "artwork_notes": "On-brand purple/gold poster 1080x1350. Replace draft-tile.svg with final PNG.",
        "starter": "artwork/draft-tile.svg",
        "prompt_ref": "Post 2 in ../../Prompts/prompts.md",
        "caption": (
            "Hi, we're Bob's Burritos \U0001f44b A woman-owned kitchen that rolls breakfast burritos "
            "by hand, in small batches, one morning a week. No factory, no shortcuts \u2014 just three "
            "burritos we're a little obsessed with and a chipotle mayo people genuinely text us about. "
            "Sundays only. Delivered warm. Welcome in.\n\n"
            "Give us a follow \u2014 Sunday's about to become your favorite day.\n"
            "Order: link in bio \u00b7 @bobsburritosco"
        ),
        "hashtags": (
            "#bobsburritos #womanownedbusiness #womenownedbusiness #supportsmallbusiness #smallbatch "
            "#lafoodie #laeats #eaterla #breakfastburrito #sundayfunday #shoplocalla #madebyawoman "
            "#foodstartup #brunchla #handmadefood #dtla #losangeles #foodiesofinstagram #localbusiness "
            "#sundayritual"
        ),
        "alt": (
            "A deep purple graphic with golden yellow text reading Sunday breakfast burritos, "
            "delivered, and a sunrise-arc design in the corner."
        ),
        "story": "Headline words drop in; Tap to meet the menu",
        "reel": "8s: Roll, sauce, sunrise arcs, this tile. Text: Who is Bob's Burritos?",
        "cta": "Follow",
    },
    {
        "slug": "03-soyrizo",
        "num": 3,
        "title": "The Veggie Star (Soyrizo Sunrise)",
        "grid": "top-right",
        "bucket": "Menu Highlights",
        "goal": "awareness + inclusivity",
        "publish_day": 7,
        "media_type": "food photo",
        "artwork_notes": "Soyrizo cross-section, bright morning light, sauce ramekin.",
        "starter": "artwork/source-ref-soyrizo-sunrise.jpeg",
        "prompt_ref": "Post 3 in ../../Prompts/prompts.md",
        "caption": (
            "Proof that \"vegetarian\" and \"crave-worthy\" belong in the same sentence. "
            "The Soyrizo Sunrise \u2014 smoky soy chorizo, fluffy eggs, melty cheese, crispy hash browns "
            "\u2014 plus that chipotle mayo on the side. Ten bucks, add avocado if you're feeling it. "
            "Meat-eaters keep stealing bites. Just saying. \U0001f951\n\n"
            "Tag a vegetarian who needs this in their Sunday.\n"
            "Order by Sat 3PM \u2192 link in bio"
        ),
        "hashtags": (
            "#bobsburritos #vegetarianbreakfast #soyrizo #meatlessmonday #lafoodie #vegla #plantbased "
            "#breakfastburrito #eaterla #laeats #veggieburrito #brunchla #vegetarianla #chipotlemayo "
            "#womanownedbusiness #healthyish #foodporn #losangelesfood #sundaybreakfast #veganish"
        ),
        "alt": (
            "A vegetarian breakfast burrito cut in half showing soy chorizo, eggs, cheese and hash "
            "browns, with avocado, lime and a ramekin of chipotle mayo, in bright morning light."
        ),
        "story": "Poll: Team Soyrizo or Team Heavyweight?",
        "reel": "Slice reveal; you don't need meat to eat like this",
        "cta": "Tag a vegetarian",
    },
    {
        "slug": "04-sauce",
        "num": 4,
        "title": "The Sauce (chipotle mayo)",
        "grid": "middle-left",
        "bucket": "The Sauce",
        "goal": "differentiation",
        "publish_day": 6,
        "media_type": "food photo / macro",
        "artwork_notes": "Macro of chipotle mayo ramekin + spoon drip.",
        "starter": "(add final to artwork/)",
        "prompt_ref": "Post 4 in ../../Prompts/prompts.md",
        "caption": (
            "Let's talk about the sauce. \U0001f336\ufe0f Our house chipotle mayo is the reason half our "
            "regulars became regulars. Smoky, creamy, a little addictive \u2014 it rides shotgun with "
            "every single burrito, on the side, so you control the drizzle (or the drench, no judgment). "
            "We're not telling you the recipe. We are telling you to order extra.\n\n"
            "Comment \U0001f336\ufe0f if you'd put this on everything."
        ),
        "hashtags": (
            "#bobsburritos #chipotlemayo #sauceboss #secretsauce #lafoodie #condiments #saucegoals "
            "#breakfastburrito #eaterla #laeats #foodcloseup #macrofood #foodporn #womanownedbusiness "
            "#flavorbomb #spicymayo #dtlaeats #foodphotography #sundaybreakfast #getinmybelly"
        ),
        "alt": (
            "Extreme close-up of creamy chipotle mayo in a speckled ramekin with a spoon lifting a "
            "ribbon of sauce, a burrito blurred behind."
        ),
        "story": "Slow-mo drip boomerang; quiz extra sauce? Yes / Obviously",
        "reel": "ASMR swirl, lift, drip, dip. Text: the sauce people text us about",
        "cta": "Comment pepper emoji",
    },
    {
        "slug": "05-lineup",
        "num": 5,
        "title": "The Lineup (all three) — PIN THIS",
        "grid": "center",
        "bucket": "Menu Highlights",
        "goal": "education + sales",
        "publish_day": 5,
        "media_type": "food photo / carousel",
        "artwork_notes": "All three burritos in one frame (or carousel slides).",
        "starter": "(add final to artwork/)",
        "prompt_ref": "Post 5 in ../../Prompts/prompts.md",
        "caption": (
            "The whole lineup, one photo, zero bad choices. \U0001f32f Meet the family:\n\n"
            "\u2022 Soyrizo Sunrise \u2014 $10 (veggie)\n"
            "\u2022 The Cali \u2014 $12 (beef + avocado included)\n"
            "\u2022 The Heavyweight \u2014 $10 (sausage + bacon)\n\n"
            "Each one hand-rolled, each one with chipotle mayo on the side. Save this so you know "
            "your order before Saturday 3PM hits.\n\n"
            "Woman-owned \u00b7 Sundays only \u00b7 delivery 9AM\u201312PM\n"
            "Order \u2192 link in bio"
        ),
        "hashtags": (
            "#bobsburritos #breakfastburrito #lafoodie #eaterla #laeats #menugoals #burritolineup "
            "#pickyourfighter #womanownedbusiness #smallbatch #brunchla #dtlaeats #foodmenu "
            "#losangelesfood #sundaybreakfast #comfortfood #foodphotography #handrolled #chipotlemayo "
            "#whattoeatla"
        ),
        "alt": (
            "Three breakfast burritos in a row on a wooden board, each sliced to show different "
            "fillings, with three ramekins of chipotle mayo, in bright morning light."
        ),
        "story": "Three tap frames (one per burrito) then order link",
        "reel": "Ranking our own burritos (impossible) — no winner",
        "cta": "Save menu + pin post",
    },
    {
        "slug": "06-how-sunday-works",
        "num": 6,
        "title": "How Sunday Works (brand tile)",
        "grid": "middle-right",
        "bucket": "Education",
        "goal": "convert interest to plan",
        "publish_day": 4,
        "media_type": "graphic tile",
        "artwork_notes": "Three-step purple/gold poster. Replace draft-tile.svg with final PNG.",
        "starter": "artwork/draft-tile.svg",
        "prompt_ref": "Post 6 in ../../Prompts/prompts.md",
        "caption": (
            "Here's the rhythm, and it's easy:\n\n"
            "\U0001f4c5 Order by Saturday 3PM\n"
            "\U0001f305 We hand-roll everything Sunday morning\n"
            "\U0001f6ce\ufe0f It shows up warm, 9AM\u201312PM\n\n"
            "Pay by Venmo (@Khushbu-Kotecha) or Zelle (7148120977). We roll, you eat, your Sunday "
            "improves dramatically. Set a reminder for Saturday \u2014 the batch is small and it goes.\n\n"
            "Turn on post notifications so Saturday's reminder finds you \U0001f514\n"
            "Link in bio \u2192 @bobsburritosco"
        ),
        "hashtags": (
            "#bobsburritos #sundayritual #breakfastdelivery #orderonline #lafoodie #laeats #eaterla "
            "#howitworks #smallbatch #womanownedbusiness #sundayfunday #fooddelivery #brunchla #dtla "
            "#losangeles #weekendvibes #breakfastburrito #supportsmall #sundaybreakfast #mealprepsunday"
        ),
        "alt": (
            "A deep purple graphic titled How Sunday works with three steps — order by Saturday 3PM, "
            "rolled Sunday morning, delivered 9AM to noon — and sunrise-arc art."
        ),
        "story": "One frame per step + countdown to next Sat 3PM + link sticker",
        "reel": "Sat order ping → Sunday roll → doorstep → first bite",
        "cta": "Turn on notifications + order",
    },
    {
        "slug": "07-cali-in-hand",
        "num": 7,
        "title": "The Cali, In Hand",
        "grid": "bottom-left",
        "bucket": "Lifestyle",
        "goal": "engagement",
        "publish_day": 3,
        "media_type": "lifestyle food photo",
        "artwork_notes": "In-hand / cozy Cali shot. source-ref is plated starting point.",
        "starter": "artwork/source-ref-the-cali.jpeg",
        "prompt_ref": "Post 7 in ../../Prompts/prompts.md",
        "caption": (
            "Sunday morning, still in your comfiest sweater, holding The Cali like it's a warm hug. "
            "Seasoned beef, eggs, cheese, hash browns, avocado already inside \u2014 no upcharge \u2014 "
            "and chipotle mayo doing its thing. This is the burrito that turns \"I'll just have coffee\" "
            "into \"actually, get me one of these.\" \U0001f951\u2615\n\n"
            "Tag your Sunday-morning person \U0001faf6\n"
            "Woman-owned kitchen \u00b7 order by Sat 3PM \u00b7 link in bio"
        ),
        "hashtags": (
            "#bobsburritos #thecali #californiaburrito #breakfastburrito #lafoodie #laeats #eaterla "
            "#cozyvibes #sundaymorning #avocado #comfortfood #handheld #womanownedbusiness #brunchla "
            "#weekendmood #foodie #dtlaeats #inhandfood #sundaybreakfast #warmandcozy"
        ),
        "alt": (
            "Two hands holding a breakfast burrito cut in half, showing beef, eggs, cheese and avocado "
            "with chipotle mayo, in a warm sunlit kitchen."
        ),
        "story": "Drizzle boomerang; your Sunday sorted? + link",
        "reel": "POV unwrap, drizzle, first bite. Text: Sundays hit different.",
        "cta": "Tag Sunday person",
    },
    {
        "slug": "08-woman-owned",
        "num": 8,
        "title": "Woman-owned / Meet the maker",
        "grid": "bottom-center",
        "bucket": "Brand Story",
        "goal": "trust + community",
        "publish_day": 2,
        "media_type": "real founder photo preferred / graphic backup",
        "artwork_notes": "Prefer real kitchen/founder photo. Graphic backup: draft-tile.svg → final PNG via Prompts.",
        "starter": "artwork/draft-tile.svg",
        "prompt_ref": "Post 8 in ../../Prompts/prompts.md",
        "caption": (
            "Every burrito you order was rolled by hand in a small woman-owned kitchen \u2014 no factory, "
            "no line cooks, just someone who got a little obsessed with making the perfect breakfast "
            "burrito and refused to cut corners (or skimp on the sauce). When you order, you're supporting "
            "a real person's small business. Thank you for that \u2014 genuinely. \U0001f305\n\n"
            "Follow along and support a woman-owned kitchen \U0001f49b\n"
            "@bobsburritosco \u00b7 order by Sat 3PM \u00b7 link in bio"
        ),
        "hashtags": (
            "#bobsburritos #womanownedbusiness #womenownedbusiness #femalefounder #supportsmallbusiness "
            "#shoplocalla #madebyawoman #smallbatch #behindthebusiness #meetthemaker #lafoodie #laeats "
            "#womeninbusiness #entrepreneur #localbusiness #foodstartup #sundaybreakfast #handmade "
            "#realfood #communityfirst"
        ),
        "alt": (
            "Deep purple brand graphic with golden text about a woman-owned kitchen — or a real founder "
            "photo in a bright kitchen with burritos."
        ),
        "story": "Why I started Bob's Burritos + AMA question box",
        "reel": "15-20s kitchen b-roll + lines to camera — highest-trust content",
        "cta": "Follow + support woman-owned",
    },
    {
        "slug": "09-community",
        "num": 9,
        "title": "Community / Sunday Club (publish FIRST)",
        "grid": "bottom-right",
        "bucket": "Community",
        "goal": "belonging + follow",
        "publish_day": 1,
        "media_type": "lifestyle flat-lay",
        "artwork_notes": "Doorstep / coffee-table Sunday spread. Add final 4:5 image here.",
        "starter": "(add final to artwork/)",
        "prompt_ref": "Post 9 in ../../Prompts/prompts.md",
        "caption": (
            "This is the Bob's Burritos Sunday: warm burritos on the table, coffee in hand, chipotle "
            "mayo within reach, nowhere to be. \U0001f305 Every week a few more of you join the Sunday "
            "club \u2014 thank you for making a small woman-owned kitchen part of your weekend. First "
            "one's always the gateway. Ready to make it a habit?\n\n"
            "Follow + order your first Sunday \u2192 link in bio\n"
            "Tag us @bobsburritosco \u00b7 #BobsSundayClub"
        ),
        "hashtags": (
            "#bobsburritos #sundayclub #sundayvibes #breakfastburrito #lafoodie #laeats #eaterla "
            "#weekendmood #communityfirst #womanownedbusiness #supportsmallbusiness #brunchla #dtlaeats "
            "#sundaybreakfast #coffeeandbreakfast #flatlay #foodie #losangeles #shoplocalla #sundaymorning "
            "#BobsSundayClub"
        ),
        "alt": (
            "An overhead Sunday breakfast spread with kraft-wrapped burritos, coffee, chipotle mayo "
            "and morning light."
        ),
        "story": "Repost customer tags; join the Sunday club link",
        "reel": "Doorstep montage + first bites. Text: welcome to the Sunday club",
        "cta": "Follow + #BobsSundayClub",
    },
]


def write_post(p: dict) -> None:
    d = ROOT / p["slug"]
    d.mkdir(parents=True, exist_ok=True)
    (d / "artwork").mkdir(exist_ok=True)
    text = f"""# Post {p['num']} — {p['title']}

| | |
|--|--|
| **Grid position** | {p['grid']} |
| **Content bucket** | {p['bucket']} |
| **Goal** | {p['goal']} |
| **Publish order** | Day {p['publish_day']} of reverse seed (9→1) |
| **Media type** | {p['media_type']} |
| **Status** | draft |

## Artwork

Drop final assets in **`artwork/`** (this folder).

| File | Role |
|------|------|
| `artwork/feed.png` or `.jpg` | **Main feed image** 1080×1350 (4:5) — required |
| `artwork/story.*` | Optional Story frame / crop |
| `artwork/reel.*` | Optional Reel cover or clip |
| Starter ref | `{p['starter']}` |

**Art notes:** {p['artwork_notes']}  
**Prompt:** `{p['prompt_ref']}`  
**Logo ref:** `../../../Brand/Logos/bobs-burritos-instagram-logo.jpeg`  
**Brand kit:** `../../../Brand/BRAND-KIT.md`

### Checklist

- [ ] Final feed artwork in `artwork/`
- [ ] Caption reviewed
- [ ] Hashtags ready (first comment)
- [ ] Alt text set
- [ ] Story / Reel assets (if using)
- [ ] Posted on Instagram
- [ ] Date posted: ________

---

## Caption (copy)

```
{p['caption']}
```

## First comment (hashtags)

```
{p['hashtags']}
```

## Alt text

{p['alt']}

## Story / Reel

- **Story:** {p['story']}
- **Reel:** {p['reel']}

## CTA

{p['cta']}
"""
    (d / "post.md").write_text(text, encoding="utf-8", newline="\n")
    print("wrote", p["slug"])


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    for p in POSTS:
        write_post(p)

    (ROOT / "README.md").write_text(
        """# Instagram posts — one folder per post

Each launch-grid post has its own folder. **Put artwork in that post’s `artwork/`** so captions, prompts, and images stay together.

## First 9 (grid)

| # | Folder | Title | Publish order |
|---|--------|-------|---------------|
| 1 | [01-hero-heavyweight/](./01-hero-heavyweight/) | Hero — Heavyweight | **Last** (day 9) |
| 2 | [02-who-we-are/](./02-who-we-are/) | Who we are | Day 8 |
| 3 | [03-soyrizo/](./03-soyrizo/) | Soyrizo Sunrise | Day 7 |
| 4 | [04-sauce/](./04-sauce/) | The sauce | Day 6 |
| 5 | [05-lineup/](./05-lineup/) | Lineup (**pin**) | Day 5 |
| 6 | [06-how-sunday-works/](./06-how-sunday-works/) | How Sunday works | Day 4 |
| 7 | [07-cali-in-hand/](./07-cali-in-hand/) | Cali in hand | Day 3 |
| 8 | [08-woman-owned/](./08-woman-owned/) | Woman-owned | Day 2 |
| 9 | [09-community/](./09-community/) | Sunday club | **First** (day 1) |

Reverse publish so the grid ends with Post 1 top-left: **9 → 8 → 7 → 6 → 5 → 4 → 3 → 2 → 1**.  
See [../Profile/posting-order.md](../Profile/posting-order.md).

## Folder layout (every post)

```
01-hero-heavyweight/
  post.md          ← caption, hashtags, alt, Story/Reel, checklist
  artwork/         ← YOUR final images/video go here
    feed.jpg       ← name it clearly when ready
```

## Adding a new post later

1. Copy `_template/` → `10-your-slug/`
2. Fill `post.md`
3. Drop files in `artwork/`
4. Link it from Calendar if scheduled

## Related

- Prompts: [../Prompts/prompts.md](../Prompts/prompts.md)
- Playbook: [../Playbook/launch-playbook.md](../Playbook/launch-playbook.md)
- Brand kit: [../../Brand/BRAND-KIT.md](../../Brand/BRAND-KIT.md)
- Logo: [../../Brand/Logos/](../../Brand/Logos/)
""",
        encoding="utf-8",
        newline="\n",
    )

    t = ROOT / "_template"
    (t / "artwork").mkdir(parents=True, exist_ok=True)
    (t / "artwork" / ".gitkeep").write_text("", encoding="utf-8")
    (t / "post.md").write_text(
        """# Post NN — Title

| | |
|--|--|
| **Grid position** | |
| **Content bucket** | |
| **Goal** | |
| **Publish order** | |
| **Media type** | |
| **Status** | draft |

## Artwork

Drop final assets in **`artwork/`**.

| File | Role |
|------|------|
| `artwork/feed.png` or `.jpg` | Main feed image 1080×1350 (4:5) |
| `artwork/story.*` | Optional Story |
| `artwork/reel.*` | Optional Reel |

**Prompt:** (link or paste)  
**Brand kit:** `../../../Brand/BRAND-KIT.md`

### Checklist

- [ ] Final feed artwork in `artwork/`
- [ ] Caption reviewed
- [ ] Hashtags ready
- [ ] Alt text set
- [ ] Posted
- [ ] Date posted: ________

---

## Caption (copy)

```
(paste caption)
```

## First comment (hashtags)

```
(paste hashtags)
```

## Alt text

(paste)

## Story / Reel

- **Story:**
- **Reel:**

## CTA

(paste)
""",
        encoding="utf-8",
        newline="\n",
    )
    print("template ok")


if __name__ == "__main__":
    main()
