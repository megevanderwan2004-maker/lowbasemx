# PROJECT_CONTEXT.md

> Last updated: 2026-08-07 (Ritual banner + warm palette pass)
> Purpose: Give a future Claude Code session (or human contributor) everything needed to continue this project without prior conversation context.

---

## 1. Project overview

**Lowlabs** is a Mexican reseller working directly with Garmin at reseller pricing, plus a curated supplement line. Brand positioning is "curated wellness and technology" — premium wellness editorial, not sporty gadget. All customer-facing content is in Spanish (es-MX), prices in MXN.

The site started as a **single-product landing page** for the Garmin CIRQA Smart Band (launched 2026-07-21) and became, on 2026-07-30, a **five-product storefront**, then a **nine-product storefront** carrying three brands — Garmin (4 wearables), Cymbiotika (3 supplements) and Promix (2 supplements). Prenatal Multivitamin was added then dropped as a duplicate of Women's Multivitamin. The homepage no longer sells one product: it opens on a goal-based assistant, then two product carousels, then one editorial chapter per supplement.

The main competitor is **DelMaz** (delmaz.mx), the official Garmin distributor in Mexico for 18 years. Lowlabs differentiates on price, a much shorter catalogue, and brand aesthetics.

## 2. Current state

`deploy/` is **canonical and the only actively maintained variant.** It is a static site of 11 HTML pages plus a shared CSS/JS/catalogue triplet. No build step at request time; product pages are generated ahead of time by a Node script (section 4).

**What works today**
- 11 pages: home, `/tienda`, and 9 product pages, all internally linked and verified.
- Goal-based assistant on the homepage (3 goals → recommended product + complements → link to the product page). The cards are full-bleed photos with a liquid-glass footer.
- Two floating carousels on the home ("Los más buscados" and the supplements selection) plus one carousel per Tienda aisle: cut-out packshots or product loops, no card frame, arrows above 900px.
- Shopify checkout for the CIRQA only — colour/size selection drives a pre-selected variant redirect.
- Liquid-glass design system: white translucent surfaces, ink text, a masked gradient rim shared by buttons, both bars, and the footer.

**What is NOT connected**
- **Vercel: nothing is deployed.** `vercel whoami` returns no credentials on this machine and the connected Vercel account has zero projects. `vercel.json` is correct and ready; someone has to run `vercel login` (browser flow) then `vercel --prod`, or import the GitHub repo from the Vercel dashboard.
- **Shopify: only the CIRQA is wired.** The other eight products have no `shopify` block in `catalog.js`, so their buy button opens a `mailto:` order instead. See section 7.
- **Prices are provisional for every product except the CIRQA** — chosen below MSRP, not confirmed by the owner. The two Cymbiotika newcomers sit at $400 MXN, the placeholder price from the Canva mock-up; the Promix pair is converted from the US store at a rounded rate. Copy, highlights and spec tables for all five supplements are placeholders.
- **Brand mismatch on `synbiotic`** — the entry is still named *Cymbiotika Synbiotic* but its visual (card, PDP, home banner) is a **Ritual Essential Prenatal** bottle. Name, brand, price and spec table all need reconciling before launch.
- **Third-party imagery** — the Promix packshots were copied from `promixnutrition.com`, and the Ritual shots came from the owner. Usage rights are unconfirmed.
- **Custom domain** — not configured.

**Recent history** (`git log`, newest first)
| Commit | Date | What changed |
|--------|------|--------------|
| `24d83c8` | 08-07 | Home tightened (manifesto + no-screen chapter cut), 3 goal cards with glass footer, Ritual banner, Promix cream palette, mobile media caps, Tienda header removed |
| `7ae70db` | 08-01 | Product loops play inside the carousels; the two Promix join the home selection |
| `5595624` | 08-01 | Promix products, "Los más buscados" carousel, Tienda aisles become floating carousels |
| `a53d7e5` | 07-31 | Three Cymbiotika supplements, goals cut to four, Venu 4 / Vívoactive 6 chapters removed |
| `561cc15` | 07-31 | Full-bleed hero, transparent glass nav, 6 distinct goal images |
| `1e0a8c0` | 07-31 | Mobile pass; the two banners merged into one scrolling top bar |
| `42ac258` | 07-30 | `/tienda` page + goal assistant; neutral palette; comparison table removed |
| `e61525a` | 07-30 | Single product → 5-product catalogue, editorial rewrite |

**Latest pass (2026-08-07)**: the manifesto chapter and the "Cero distracciones" chapter left the homepage (the watch now has a single chapter, Garmin Connect); goals cut to three (`dormir`, `rendimiento` → "Performance", `salud`) and restyled as full-bleed photo cards; the Synbiotic chapter became the full-bleed **Ritual banner** (`#8fc0d8`, "Made for her."); Prenatal Multivitamin deleted from the catalogue; the cream of the Promix loop (`#faf1e8`) became the site's warm tint; media capped below 720px; the Tienda header block removed.

## 3. Project structure

```
lowlabs-cirqa-context/
├── CLAUDE.md                  # Product specs, brand, competition. Read first.
├── PROJECT_CONTEXT.md         # This file
├── vercel.json                # outputDirectory: "deploy", cleanUrls: true
├── .gitignore                 # .DS_Store, *.zip, zi5VaVFL, node_modules/
├── .claude/
│   ├── launch.json            # Dev server: node build/serve.js on port 4175
│   ├── serve.py               # Legacy Python server — NOT used (see section 11)
│   └── skills/                # Claude Code skills (design/brand/UI, not project code)
│
├── build/
│   ├── gen-products.js        # ★ Generates deploy/productos/*.html from catalog.js
│   └── serve.js               # Static preview server that emulates Vercel cleanUrls
│
├── deploy/                    # ★ CANONICAL — the deployed site
│   ├── index.html             # Homepage (465 lines)
│   ├── tienda.html            # Shop page; aisles rendered client-side (164 lines)
│   ├── productos/             # GENERATED — do not hand-edit
│   │   ├── cirqa.html
│   │   ├── venu-4.html
│   │   ├── venu-3s.html
│   │   ├── vivoactive-6.html
│   │   ├── creatina.html
│   │   ├── womens-multivitamin.html
│   │   ├── synbiotic.html
│   │   ├── promix-creatina.html
│   │   └── promix-debloat.html
│   ├── catalog.js             # ★ Single source of truth: products + goals (381 lines)
│   ├── app.js                 # All behaviour, 12 isolated modules (766 lines)
│   ├── styles.css             # Full design system (1566 lines)
│   └── media/                 # 57 MB, 55 files — local images and videos, committed
│
├── site/                      # ⚠️ ABANDONED — single-file version, ~5 revisions behind
├── shopify-theme/             # ⚠️ ABANDONED — Liquid theme, matches the old single-product page
│
├── assets/                    # 122 MB source uploads (PDFs, photos, raw videos)
└── assets-hd/                 # 59 MB processed assets + CDN URL maps
```

`site/` and `shopify-theme/` have **not** been touched since the 5-product rewrite. They still describe a single-product page with a comparison table and the old teal palette. Treat them as historical unless someone explicitly asks to revive them; regenerate from `deploy/` rather than patching.

## 4. Technology stack and the generation step

- **No framework, no npm, no `package.json`.** Vanilla HTML/CSS/ES5-compatible JS.
- **One build step, run manually**: `node build/gen-products.js` reads `deploy/catalog.js` in a `vm` sandbox (exposing a fake `window`) and writes the nine product pages. This exists because `vercel.json` declares `buildCommand: null` — the generated files must be committed.

```bash
node build/gen-products.js
```

**Run it after any change to `catalog.js`, or to the nav/footer/band templates inside `gen-products.js`.** Forgetting leaves the nine product pages stale, and nothing warns you.

- **Google Fonts**: Outfit (display) + DM Sans (body) — web-safe stand-ins for the brand fonts Codec Pro and Canva Sans.
- **Images**: mixed. CIRQA photography is served from the Shopify CDN; everything added since 2026-07-30 (watches, supplement, goal visuals, hero, videos) lives in `deploy/media/` and is committed.

## 5. Page inventory

| Route | File | Notes |
|-------|------|-------|
| `/` | `deploy/index.html` | Homepage. Carries `class="has-hero"` on `<body>` — this drives the top spacing (section 6). |
| `/tienda` | `deploy/tienda.html` | Shop. `<div id="shop-sections">` is filled by the `shop` module, one carousel aisle per category (floating cards, same template as "Los más buscados"). |
| `/productos/{handle}` | generated | 9 pages. `<body data-product="{handle}">` is how `app.js` knows which catalogue entry to bind. |

`cleanUrls: true` in `vercel.json` is what makes `/tienda` and `/productos/cirqa` resolve without `.html`. `build/serve.js` reproduces that locally.

### Homepage section order
top bar (scrolling) → floating nav → full-bleed hero → **goal assistant** (`#objetivo`, three full-bleed photo cards with a liquid-glass footer) → **Los más buscados** carousel (`#mas-buscados`, detoured packshots, watches and supplements mixed) → Wearables video band (`#wearables`) → the single CIRQA chapter (Garmin Connect, vertical loop) → Suplementos video band (`#suplementos`) → supplements carousel (`#sup-grid`, five floating cards — the Cymbiotika loops, then the two Promix packshots) → one chapter per supplement — "Wellness, in one shot." (Cymbiotika bubbles loop), women's, the full-bleed blue **Ritual banner** ("Made for her."), then the "Clean nutrition. Real performance." Promix brand section on the stick loop → FAQ (`#faq`) → closing banner → footer → buy dock.

Deliberately **removed** and not to be reinstated without asking: the comparison table, the "Menos ruido / Mejor bienestar" statement, the "Se pone una vez" band, the "Salud 24/7" chapter, the **manifesto chapter** ("Buscamos los productos que valen la pena…", with its `120+ / 9 / 0` stats), the **"Cero distracciones. Solo registro."** chapter, and the Venu 3S, Venu 4 and Vívoactive 6 chapters (the three watches appear only in `/tienda`, the footer and their own pages).

The Tienda has no header block any more: the page opens straight on the first aisle, whose extra `padding-top` clears the floating nav.

## 6. Design system

### Palette — neutral, no green
The teal palette was removed on 2026-07-30. The `--teal-*` variable **names** were kept so the whole file did not need rewriting, but their values are greys. Do not reintroduce green.

| Variable | Value | Usage |
|----------|-------|-------|
| `--ink` | `#17191b` | Primary text |
| `--ink-soft` | `#3c4145` | Secondary text |
| `--teal-700` | `#5a6165` | Muted text (a grey, despite the name) |
| `--teal-600` | `#767c80` | Lighter muted |
| `--teal-brand` | `#a2a8ac` | Eyebrow / label grey |
| `--sand` | `#dec8a7` | Brand warm accent — the only remaining colour |
| `--surface` | `#ffffff` | Card background |
| `--surface-teal` | `#f3f4f5` | Media placeholders, `.compare` background |
| `--surface-sand` | `#faf1e8` | **The cream of the Promix loop background.** Carries both `.chapter.sand` and `.chapter.tinted`, plus the goal section's gradient, so the video blends into its section instead of sitting on a grey plate. |
| `--cta` | `#17191b` | Near-black |
| `--canvas` | `#eaebec` | Page background behind the shell |

### Liquid glass — the current implementation
Three custom properties plus one pseudo-element carry the whole look:

- `--lg-fill` / `--lg-fill-hi` — white translucent gradient. **The floor opacity (`.64`) is load-bearing**: it is what keeps ink text legible over any backdrop. Lowering it breaks contrast on photos.
- `--lg-depth` — dark hairline for silhouette, soft drop shadow, inner white glow.
- **The rim** — a 1px ring whose intensity varies top-to-bottom (bright white at the top, ink hairline at the bottom). A `border` cannot do this, so it is a gradient clipped with `mask-composite: exclude`. Shared by `.btn::after`, `.nav-pill::after`, `.dock-shell::after`, `footer::after`.

Applied to: all buttons, the floating nav, the buy dock, and the footer.

### SVG refraction filter — read before touching
Each page embeds `<filter id="lg-refract">` (turbulence → displacement → blur) and `.btn::before` can use it as a `backdrop-filter`.

**It is scoped to Firefox on purpose.** Chromium parses `backdrop-filter: url(...)` and then composites nothing — leaving it unscoped silently destroys the plain blur for most visitors. The guard is:

```css
@supports (-moz-appearance:none) and (backdrop-filter:url("#lg-refract")){ … }
```

Everything else falls back to `blur(6px) saturate(150%)`. Verified: computed value stays `blur(6px) saturate(1.5)` in Chromium.

### Legacy glass helpers (still present, narrower use)
`.glass-light` / `.glass-dark` / `.blurred` remain for the top bar, product badges, and selection cards. Historical rules that still hold:
1. **Never put `var()` inside `-webkit-backdrop-filter`** — Safari ≤17 does not resolve custom properties there, so the glass vanishes on exactly the browsers needing the prefix.
2. **Tint alpha alone carries contrast, never blur.** Blur can disappear (unsupported, reduced-transparency, backdrop root).
3. **Nothing with `opacity < 1`, `filter`, `mask`, `clip-path`, `mix-blend-mode`, or `will-change` may be an ancestor of a blurred surface** — each creates a backdrop root and kills the descendant's blur. This is why `.rail` never carries `.rv`, and why `.shell` clips its corners with `position/z-index/isolation` rather than a mask.

### The three card families
| Family | Where | Shape |
|--------|-------|-------|
| `.prod` | `/productos/*` "Otros productos", nothing else now | Framed card: media box, category, name, tagline, price, button |
| `.fcard` inside `.cards.fcards` | both home carousels and every Tienda aisle | **Floating**: cut-out packshot or product loop, `mix-blend-mode: multiply`, drop shadow, short name, price. No frame, no background |
| `.goal` | the assistant | Full-bleed photo, 3/4 portrait, `.goal-body` in `glass-dark blurred` at the bottom with the label and a `.goal-cta` pseudo-button (a `span` — the card is already a radio `button`) |

A supplement that declares a `video` plays it inside `.fcard`; a radial mask dissolves the studio background so the loop floats like the cut-outs. Wearables always use their `packshot`.

`.ritual` is a one-off full-bleed banner (`#8fc0d8`): cut-out hand flush with the bottom edge on the left, centred copy on the right, stacked below 900px. Its image carries an explicit `aspect-ratio` — in a flex container a lazy-loaded image with two `auto` dimensions collapses to zero until it decodes.

### Measured layout variables
Three values are measured in JS because they change with fonts, breakpoints, and content:
- `--dock-h` — buy dock height; `body { padding-bottom }` reserves it so the footer always clears.
- `--nav-h` — nav pill height; it doubles below 1024px where the pill goes two-row.
- `--topbar-h` — scrolling top bar (static `34px`), offsets the nav, the shell, and every scroll anchor.

`body.has-hero` (set statically in `index.html`, not by JS) decides whether the shell starts under the nav or lets the hero run beneath it. It is static precisely so the first paint is correct.

### Hero
Full-bleed, `100svh − topbar − gutter`, `object-fit: cover`. The wordmark and tagline are **baked into the image**, which constrains cropping:
- Source is `1366×768` — do not upscale it, an earlier 2400px version was just blurrier.
- Measured text positions: wordmark at x 535–834, baseline at x 849–1230.
- `hero-runners-mobile.jpg` is cropped to x 461–845 (ratio 1:2, baseline excluded) and served via `<picture>` under 760px; `.hero-tagline` supplies the missing baseline in HTML there and is hidden above 760px.
- `object-position: 72%` on mobile makes any overflow crop from the left so the wordmark's end is never cut.

### Responsive breakpoints
| Width | What changes |
|-------|--------------|
| `640px` | Top bar text shrinks to stay on one line |
| `719/720px` | Media caps kick in (chapter 4/3.4, portrait ≤250px, `.fcard` ≤190px, goal 3/3.6); grids go 2-per-row; `Ver más` clamping activates |
| `759/760px` | Hero switches image variant; goals drop from 3 columns to 2 |
| `899/900px` | Chapters, section heads and the floating grids go multi-column; carousel arrows appear; the Ritual banner un-stacks |
| `980px` | Product page splits into gallery + buy rail |
| `1023/1024px` | Nav collapses to two rows; the first Tienda aisle takes its tall `padding-top` to clear the floating nav |

## 7. Catalogue and Shopify

`deploy/catalog.js` exports `window.LOWLABS` with `products`, `goals`, `categories`, and the helpers `byHandle`, `byGoal`, `inCategory`, `money`, `url`. It is the only place prices, images, specs, and variant IDs live — the homepage, shop, product pages, and generator all read from it.

### Products and provisional prices
| Handle | Product | Price (MXN) | Compare at | Shopify |
|--------|---------|-------------|-----------|---------|
| `cirqa` | Garmin CIRQA™ Smart Band | 3,999 | 4,199 | ✅ wired |
| `venu-4` | Garmin Venu® 4 | 10,999 | 11,499 | ❌ |
| `venu-3s` | Garmin Venu® 3S | 8,899 | 9,399 | ❌ |
| `vivoactive-6` | Garmin Vívoactive® 6 | 5,999 | 6,299 | ❌ |
| `creatina` | Cymbiotika Liposomal Advanced Creatine | 1,349 | 1,499 | ❌ |
| `womens-multivitamin` | Cymbiotika Women's Multivitamin +18 | 400 | — | ❌ |
| `synbiotic` | Cymbiotika Synbiotic ⚠️ *visual is a Ritual bottle* | 400 | — | ❌ |
| `promix-creatina` | Promix Micronized Creatine | 1,199 | — | ❌ |
| `promix-debloat` | Promix Debloat Prebiotic + Probiotic | 599 | — | ❌ |

The "compare at" values are the real MSRPs (Garmin MX / Cymbiotika USD converted). The lowlabs prices are placeholders picked below MSRP — **confirm before launch.** The three $400 supplements come straight from the Canva mock-up: price, tagline, highlights and spec table are all placeholders, and they drive the "Desde $400 MXN" dock on the home and the shop.

**Media fields on a product**

| Field | Effect |
|-------|--------|
| `image` / `hero` | The still. Used by the PDP stage, the `.prod` card and the recommendation block when no loop exists. |
| `video` + `poster` + `videoRatio` (`"portrait"` \| `"wide"`) | The loop replaces the packshot on the PDP stage, in the editorial chapter, and — for `category: "Suplementos"` only — inside the floating carousels. `creatina`, `womens-multivitamin` and `promix-debloat` declare one. |
| `packshot` | The cut-out used wherever products float without a frame. `cirqa` → `cirqa-packshot.png`; `womens-multivitamin` → `sup-womens-cut.png`; the Promix pair uses its transparent PNGs. The `sup-*-cut.png` files were generated from video stills by a border flood-fill in Pillow. |

Wearables never play a loop in a carousel — that rule is in `flyMedia()` in `app.js`, keyed on the category.

The two Promix prices are converted from the US store ($59 and $29) at a rounded rate — provisional like the rest. Their packshots were copied from `promixnutrition.com` into `deploy/media/`.

### Store
| Setting | Value |
|---------|-------|
| Store URL | `https://jx8irc-px.myshopify.com` |
| Product handle | `garmin-cirqa-smart-band` |
| Store ID | `1026/1721/9449` |
| CDN base | `https://cdn.shopify.com/s/files/1/1026/1721/9449/files/` |

### CIRQA variant IDs
| Color | S–M | L–XL |
|-------|-----|------|
| Negra | 64093481107833 | 64093481140601 |
| Gris Francés | 64093481173369 | 64093481206137 |
| Malva | 64093481238905 | 64093481271673 |
| Azul Capitán | 64093481304441 | 64093481337209 |

### Checkout behaviour
`goToCheckout()` in `app.js` branches on whether the product has a `shopify` block:
- **With one** → redirect to `{STORE}/products/{handle}?variant={ID}&locale=es&country=MX`, colour and size pre-selected.
- **Without one** → `mailto:lowlabsmx@gmail.com` with the product name as subject. Deliberate: it must never send a customer to a Shopify URL that does not exist.

### To wire the remaining eight products
1. Create the product in Shopify admin, note the variant IDs.
2. Add to the entry in `deploy/catalog.js`:
   ```js
   shopify: { handle: "garmin-venu-4", variants: { … } }
   ```
   (Products with no colour/size options can use a flat handle-only block — `goToCheckout` falls back to the product page when no variant matches.)
3. Run `node build/gen-products.js`.

No other file needs touching — the button label, the note under it, and the JSON-LD all derive from the catalogue.

## 8. The goal assistant

Three goals in `catalog.js`, each with `id`, `label`, `icon`, `image`, `lede`, `pick` (recommended handle), `also` (complements), and `why` (the sentence shown as justification).

| Goal | Image | Recommends | Complements |
|------|-------|-----------|-------------|
| `dormir` — Dormir mejor | `goal-dormir.jpg` | cirqa | creatina |
| `rendimiento` — Performance | `goal-rendimiento.jpg` | venu-4 | promix-creatina |
| `salud` — Cuidar mi salud diaria | `goal-salud.jpg` | cirqa | womens-multivitamin, synbiotic, creatina |

Three entries, as in the Canva reference: the grid lays them out 3 × 1 above 760px and 2 columns below. The `icon` field is still in the data but no longer rendered — the cards show a photo, a label and a "Ver selección" pill, nothing else. `goal-energia.jpg`, `goal-recuperacion.jpg` and `goal-longevidad.jpg` are the leftovers of the cut goals.

Nothing is stored or sent — it is a pure client-side lookup. The result block stays out of the DOM until a goal is chosen, then receives focus on click (but not on arrow-key navigation, so keyboard users can keep browsing the group).

**Known imbalance**: `dormir` and `rendimiento` still lean on a single complement each. Rebalance `also` when the real supplement copy lands.

## 9. `app.js` — 12 modules

Every module runs inside `module(name, fn)`, a try/catch wrapper. This is not decorative: `.rv` elements start at `opacity: 0`, so before the wrapper existed one uncaught error could leave **the entire page invisible**. The reveal module also has a 4-second failsafe that reveals everything if the observer never fires.

| Module | Role |
|--------|------|
| `catalog` | Renders the framed grids from `productCard()` (`data-exclude` / `data-handles`) **and** the floating tracks from `flyCard()` (`.fcards[data-handles]`) |
| `shop` | Builds `/tienda` aisles — one carousel per category, arrows in the head, anchors slugged from the category name |
| `goals` | The assistant: radiogroup, roving tabindex, recommendation rendering |
| `reveal` | `.rv` scroll reveal + failsafes |
| `hero-video` | Autoplay/pause logic — **currently inert on all pages**, the hero is a still image now. Kept for when a hero video returns. |
| `section-loops` | `data-autoloop` videos: play in view, pause out of view and on tab hide |
| `past-hero` | Toggles `body.past-hero` |
| `dock-height` | Measures `--dock-h` and `--nav-h` |
| `selection` | Product page colour/size radiogroups |
| `checkout` | Shopify redirect or mailto fallback |
| `read-more` | Below 720px, clamps long paragraphs to 3 lines with a `Ver más` toggle. Only appears when the text actually overflows; without JS the text stays whole rather than truncated. |
| `carousel` | Arrows of **every** floating track — each `.card-arrows` walks up to its own `<section>` and drives the `.cards` it finds there, so the home carousels and each Tienda aisle scroll independently. The step is measured from the real gap between the first two items, not hardcoded. |

## 10. Media

`deploy/media/` (57 MB, 55 files, committed):

| File | Use |
|------|-----|
| `hero-runners.jpg` / `hero-runners-mobile.jpg` | Hero, two crops (section 6) |
| `hero-cirqa.mp4` + poster | CIRQA product page band |
| `loop-wearables.mp4` | Homepage Wearables band, watch product pages |
| `loop-capsulas.mp4` + poster | Homepage Suplementos band |
| `loop-brand.mp4` | Creatine product page band |
| `loop-vertical.mp4` | Portrait loop inside the Garmin Connect chapter |
| `cymbiotika-shot.mp4` + poster | "Wellness, in one shot." chapter |
| `promix-loop.mp4` + poster | "Clean nutrition. Real performance." chapter **and** the Debloat card in every carousel |
| `sup-creatina.mp4`, `sup-womens.mp4` (+ `sup-womens.jpg` poster) | Supplement loops in the carousels and their PDP stages |
| `sup-womens-cut.png`, `cirqa-packshot.png` | Cut-outs for the floating cards |
| `promix-creatine.png`, `promix-debloat.png` | Promix packshots, copied from `promixnutrition.com` |
| `ritual-hand.png` | Cut-out for the Ritual banner (from `assets/69e4597b-….webp`) |
| `ritual-essential.png` | Bottle packshot — the `synbiotic` card and PDP |
| `goal-dormir.jpg`, `goal-rendimiento.jpg`, `goal-salud.jpg` | The three assistant cards, all ≥940px |
| `venu-4.png`, `venu-3s.png`, `vivoactive-6.png`, `creatina.png` | Packshots, displayed with `mix-blend-mode: multiply` so their white background dissolves |

**Orphans as of 2026-08-07** — kept in the repo, referenced by nothing: `app-actividades.jpg`, `app-body-battery.jpg`, `app-phone-rock.jpg`, `capsules-falling.jpg`, `capsules-texture.jpg`, `cirqa-rock.jpg`, `cirqa-sensor-negra.jpg`, `cirqa-tan-gradient.jpg`, `cirqa-tan-orange.jpg`, `cirqa-tan-wide.jpg`, `wrist-negra.jpg`, `goal-energia.jpg`, `goal-longevidad.jpg`, `goal-recuperacion.jpg`, `loop-suplementos.mp4` + poster, and the whole `sup-prenatal.*` / `sup-synbiotic.*` set (Prenatal deleted, Synbiotic switched to the Ritual visual). Delete them only if you are sure no future section wants them back.

CIRQA colour swatches and lifestyle photography still come from the Shopify CDN; `assets-hd/cdn-urls.json` remains the source of truth for those URLs.

> ### ⚠️ `assets/` and `assets-hd/` are in a PUBLIC GitHub repo
>
> `origin` is `github.com/megevanderwan2004-maker/lowbasemx`, which is public. 126 files under `assets/` and `assets-hd/` are tracked — including `assets/83713503-*.pdf`, the official Garmin product sheet that `CLAUDE.md` describes as containing **confidential reseller pricing**, and `assets-hd/garmin-video.mp4`, Garmin-copyrighted footage.
>
> This predates the rewrites. `vercel.json` pins `outputDirectory: "deploy"` so these files are at least never served from the website — **do not remove that setting.**
>
> Remediation needs an owner decision, because both routes are disruptive: make the repo private, or `git rm --cached` + `.gitignore` + history rewrite (which invalidates every existing clone). Untracking alone does not help — the files stay reachable in past commits.
>
> The newest source files (ChatGPT renders, raw videos, official packshots) are deliberately left **untracked**; only their optimised copies in `deploy/media/` are committed.

## 11. How to run locally

```bash
node build/serve.js 4175
```

Serves `deploy/` at `http://localhost:4175` and emulates Vercel's `cleanUrls`, so `/tienda` and `/productos/cirqa` resolve exactly as in production. `.claude/launch.json` points at this script.

`.claude/serve.py` is the older Python equivalent and **does not work here**: macOS blocks the CommandLineTools `python3` from reading this Documents folder (`Operation not permitted`). Use the Node server.

Most images are local now, but CIRQA photography still loads from the Shopify CDN, so full rendering needs an internet connection.

## 12. Deployment

`vercel.json`: `outputDirectory: "deploy"`, `cleanUrls: true`, `buildCommand: null`, plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` headers and a no-cache rule on `styles.css` / `app.js`.

**Nothing is deployed yet.** Two routes:

```bash
vercel login
```
```bash
vercel --prod
```

`vercel login` opens a browser and cannot be run headlessly. Alternatively, import `lowbasemx` from the Vercel dashboard — it reads `vercel.json` as-is and redeploys on every push to `main`, which is the more practical option given the iteration pace.

## 13. Open questions

1. **Prices for the eight non-CIRQA products** — provisional, need owner confirmation.
2. **Shopify for those eight** — not created. Section 7 has the procedure.
3. **`synbiotic` identity** — Cymbiotika name, Ritual visual. Decide which product it actually is, then fix name, brand, price, specs and the banner's link.
4. **Image rights** — Promix packshots pulled from their site; Ritual shots supplied by the owner. Unconfirmed.
5. **Supplement copy** — taglines, highlights and spec tables are all placeholders written in the brand tone.
6. **Custom domain** — none.
7. **Vercel** — no project exists.
8. **`site/` and `shopify-theme/`** — abandoned. Delete, or regenerate from `deploy/`?
9. **No analytics, no cookie banner, no dedicated shipping/returns page.** The footer's "Garantía y devoluciones" points at `/#faq`.
10. **`assets-hd/resource_urls.json`** holds expired Shopify staged-upload URLs; historical record only.

## 14. Files to understand before making changes

1. **`CLAUDE.md`** — product specs, brand, competition. Read first.
2. **`deploy/catalog.js`** — everything about products and goals. Most content changes start and end here.
3. **`deploy/index.html`** — homepage structure and section order.
4. **`deploy/app.js`** — the 12 modules.
5. **`deploy/styles.css`** — the design system; the liquid-glass and backdrop-filter comments are load-bearing.
6. **`build/gen-products.js`** — the page templates for `/productos/*` (nav, footer, band, spec table).

## 15. Instructions for a future Claude session

### Before changing anything
1. Read `CLAUDE.md`, then this file.
2. Assume `deploy/` unless told otherwise. `site/` and `shopify-theme/` are stale.
3. Preview with `node build/serve.js 4175`.

### Rules that will bite you if ignored
- **Run `node build/gen-products.js`** after editing `catalog.js` or the templates inside the generator. Nothing warns you if you forget.
- **Never hand-edit `deploy/productos/*.html`** — regenerated, your changes vanish.
- **Do not change Shopify variant IDs** without confirming against the live store.
- **Do not change prices** without explicit confirmation.
- **Do not reintroduce green.** The `--teal-*` names are historical; their values are grey.
- **Do not unscope the `#lg-refract` backdrop filter** from the Firefox guard — doing so removes the glass blur in Chromium and Safari.
- **Do not lower the `--lg-fill` floor opacity** below `.64` — it is what keeps ink text readable on photos.
- **Do not upscale `hero-runners.jpg`** — the source is 1366×768 and enlarging only blurs it.
- **Do not remove `outputDirectory: "deploy"`** from `vercel.json` — it is what keeps `assets/` off the public site.
- **Keep all customer-facing copy in Spanish** (es-MX).
- **Preserve accessibility**: skip link, ARIA radiogroups with roving tabindex, `sr-only` price context, ≥44px tap targets, `prefers-reduced-motion` fallbacks.

### Adding a product
1. Append an entry to `PRODUCTS` in `deploy/catalog.js` (`handle`, `name`, `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`, `specs`; optional `badge`, `compareAt`, `colors`, `sizes`, `shopify`, and the media fields in section 7 — `packshot`, `video`, `poster`, `videoRatio`, `story`).
2. Put its image in `deploy/media/`. For a carousel it needs a **cut-out** (`packshot`) or it will float with a visible rectangle behind it.
3. Run `node build/gen-products.js`.
4. Add it to a carousel by hand: `data-handles` on `#cards` (Los más buscados) and `#sup-grid` (supplements selection) in `index.html`. The Tienda aisles pick it up automatically from its `category`.
5. If it should get an editorial chapter on the homepage, write it by hand — chapters are hand-written, only the cards and aisles are generated.
6. Update the counts written in `index.html` and `tienda.html`: the dock's "N productos" and, if it changes, the "Desde $X MXN" floor.

### Adding images
- Local product/editorial images → `deploy/media/`, committed.
- Shopify CDN images → add the URL to `assets-hd/cdn-urls.json` and keep a local copy in `assets-hd/cdn/`.
