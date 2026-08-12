# PROJECT_CONTEXT.md

> Last updated: 2026-08-12 (full-screen mobile hero, near-invisible nav, tighter vertical rhythm)
> Purpose: Give a future Claude Code session (or human contributor) everything needed to continue this project without prior conversation context.

---

## 1. Project overview

**Lowlabs** is a Mexican reseller working directly with Garmin at reseller pricing, plus a curated supplement line. Brand positioning is "curated wellness and technology" — premium wellness editorial, not sporty gadget. All customer-facing content is in Spanish (es-MX), prices in MXN.

The site started as a **single-product landing page** for the Garmin CIRQA Smart Band (launched 2026-07-21), became a five- then nine-product storefront, and on 2026-08-10 **swapped its supplement half**: the two Cymbiotika newcomers (Women's Multivitamin, Synbiotic) left, Promix Relax and The Absorption Company Sleep arrived. The catalogue still holds **nine products across four brands** — Garmin (4 wearables), Cymbiotika (1), Promix (3) and The Absorption Company (1).

The main competitor is **DelMaz** (delmaz.mx), the official Garmin distributor in Mexico for 18 years. Lowlabs differentiates on price, a much shorter catalogue, and brand aesthetics.

## 2. Current state

`deploy/` is **canonical and the only actively maintained variant.** It is a static site of 11 HTML pages plus a shared CSS/JS/catalogue triplet. No build step at request time; product pages are generated ahead of time by a Node script (section 4).

**What works today**
- 11 pages: home, `/tienda`, and 9 product pages, all internally linked and verified.
- Home opens on the "Los más buscados" carousel, then alternates video band → compact carousel → editorial chapter, with the goal assistant hinging between the wearables and supplements runs.
- Three home carousels, all on the same compact card (`#mas-buscados`, `#wear-grid`, `#sup-grid`).
- Carousel cards carry a **price button** in the same glass language as "Comprar", and discreet **dots** signal that a track scrolls. A track that already fits drops its arrows and its whole `.head-aside` row, so nothing empty is left under the title.
- Editorial chapters (Garmin Connect, Cymbiotika, Absorption, Promix): reduced visual on one side, copy on the other, full viewport height on desktop, **side by side on mobile too**.
- **Cart on every page**: drawer with image, name, chosen options, quantity, remove, subtotal; a cart icon in the nav carries the count. Lines are Shopify variant references; checkout is a Shopify cart permalink.
- **Nav**: links, centred wordmark, cart icon. Nothing else — "Comprar" was removed on 2026-08-12.
- **Bundle on every PDP**: viewed product + its two first `pairs`, −10% shown, colour swatches on the watch, added as individual variants with the `BUNDLE10` code attached.
- All nine products check out on Shopify — colour/size drive the exact variant.
- Liquid-glass design system: white translucent surfaces, ink text, a masked gradient rim shared by buttons, both bars, and the footer.

**What is NOT connected**
- **Vercel: nothing is deployed from this machine.** `vercel.json` is correct and ready; someone has to run `vercel login` (browser flow) then `vercel --prod`, or import the GitHub repo from the Vercel dashboard. A preview build has been seen at `lowbasemx-1er1.vercel.app`.
- **Cart**: `deploy/cart.js` holds a list of Shopify variant references and hands off to a Shopify cart permalink (`/cart/ID:QTY,…`) at checkout — the store rebuilds the cart, applies its prices and opens its own checkout. No Storefront API token exists (creating one is blocked for AI tools), so line data is read from `catalog.js`, which mirrors the store.
- **Bundle**: every PDP shows the viewed product + the first two `pairs` entries, −10% shown, added as individual variants. The `BUNDLE10` code (10%, minimum 3 items, all customers) exists in Shopify since 2026-08-12 and is passed on the cart link.
- **Prices are CONFIRMED** by the owner (2026-08-12): the supplement prices converted from the US stores are the final ones.
- **Third-party imagery** — Promix and Absorption packshots come from the brands' own Shopify CDNs. Usage rights unconfirmed.
- **Custom domain** — not configured.

**Recent history** (`git log`, newest first)
| Commit | Date | What changed |
|--------|------|--------------|
| `a7eaf5a` | 08-12 | Vertical rhythm tightened site-wide |
| `c36e31b` | 08-12 | Full-screen mobile hero, near-invisible nav, "Comprar" removed |
| `a2371ba` | 08-12 | Docs + checkout logo prepared |
| `add2af7` | 08-12 | Cart icon + "Comprar", BUNDLE10 created |
| `f40297e` | 08-12 | Bundle colour swatches, cart variant pickers, 3 tiles fit on mobile |
| `3a1d82c` | 08-12 | Cart drawer + bundle replace "Completa tu rutina" |
| `74cf8d7` | 08-11 | Mobile colour selector reworked |
| `af3a356` | 08-11 | Product pages redesigned, gallery + brief + pairs |
| `2f7c023` | 08-11 | Top bar removed, nav stripped, Shopify wired for all nine |
| `4709947` | 08-10 | `assets/` reorganised by product handle |
| `e09c1a3` | 08-10 | `deploy/media/` split into `productos/`, `landing/`, `archivo/`; README rewritten |
| `ad9b73d` | 08-10 | Supplement catalogue swapped (see below) |
| `2eb0807` | 08-08 | Home carousels bounded to 1080px and centred on desktop |
| `a74a69b` | 08-08 | Home rebuilt: carousels first, price buttons, editorial chapters, FAQ removed |
| `44e40d7` | 08-08 | PROJECT_CONTEXT update after the Ritual pass |
| `24d83c8` | 08-07 | Home tightened, 3 goal cards, Ritual banner, warm palette |
| `7ae70db` | 08-01 | Product loops play inside the carousels |

**Latest pass (2026-08-10)** — three chained changes:
1. **Supplements swapped.** Women's Multivitamin and Synbiotic deleted everywhere (cards, pages, footers, goals). The **Ritual banner went with them** — its visual and CTA pointed at the Synbiotic page — replaced by an Absorption Company chapter in the editorial template. Promix Micronized Creatine became **Promix Non-GMO Creatine** on the 30-stick variant; Cymbiotika creatine switched to a 12-sachet format.
2. **`deploy/media/` reorganised** into `productos/<handle>/`, `landing/{hero,objetivos,bandas,capitulos}/` and `archivo/`. Every reference was rewritten; `gen-products.js` now derives a band poster from the loop's full path.
3. **`assets/` reorganised** by product handle, mirroring `deploy/media/productos/`.

## 3. Project structure

```
lowlabs-cirqa-context/
├── README.md                  ★ Structure, media conventions, commands, rules
├── CLAUDE.md                  Product specs, brand, competition. Read first.
├── PROJECT_CONTEXT.md         This file
├── vercel.json                outputDirectory: "deploy", cleanUrls: true
├── .gitignore                 .DS_Store, *.zip, zi5VaVFL, node_modules/
├── .claude/
│   ├── launch.json            Dev server: node build/serve.js on port 4175
│   ├── serve.py               Legacy Python server — NOT used (see section 11)
│   └── skills/                Claude Code skills (design/brand/UI, not project code)
│
├── build/
│   ├── gen-products.js        ★ Generates deploy/productos/*.html from catalog.js
│   └── serve.js               Static preview server that emulates Vercel cleanUrls
│
├── deploy/                    ★ CANONICAL — the deployed site
│   ├── index.html             Homepage (410 lines)
│   ├── tienda.html            Shop page; aisles rendered client-side
│   ├── productos/             GENERATED — do not hand-edit
│   │   ├── cirqa.html  venu-4.html  venu-3s.html  vivoactive-6.html
│   │   ├── creatina.html  promix-creatina.html  promix-debloat.html
│   │   └── promix-relax.html  absorption-sleep.html
│   ├── catalog.js             ★ Single source of truth: products + goals (380 lines)
│   ├── app.js                 All behaviour, 13 isolated modules (841 lines)
│   ├── styles.css             Full design system (1698 lines)
│   └── media/                 66 MB, 60 files — see section 10
│
├── site/                      ⚠️ ABANDONED — single-file version, many revisions behind
├── shopify-theme/             ⚠️ ABANDONED — Liquid theme, matches the old single-product page
│
├── assets/                    150 MB source uploads, one folder per product
└── assets-hd/                 59 MB processed assets + CDN URL maps
```

`site/` and `shopify-theme/` have **not** been touched since the 5-product rewrite. Treat them as historical; regenerate from `deploy/` rather than patching.

## 4. Technology stack and the generation step

- **No framework, no npm, no `package.json`.** Vanilla HTML/CSS/ES5-compatible JS.
- **One build step, run manually**: `node build/gen-products.js` reads `deploy/catalog.js` in a `vm` sandbox (exposing a fake `window`) and writes the nine product pages. This exists because `vercel.json` declares `buildCommand: null` — the generated files must be committed.

```bash
node build/gen-products.js
```

**Run it after any change to `catalog.js`, or to the nav/footer/band templates inside `gen-products.js`.** Forgetting leaves the nine product pages stale, and nothing warns you.

- **Google Fonts**: Outfit (display) + DM Sans (body) — web-safe stand-ins for the brand fonts Codec Pro and Canva Sans.
- **Images**: mostly local under `deploy/media/`; CIRQA photography still comes from the Shopify CDN.

## 5. Page inventory

| Route | File | Notes |
|-------|------|-------|
| `/` | `deploy/index.html` | Homepage. Carries `class="has-hero"` on `<body>` — this drives the top spacing (section 6). |
| `/tienda` | `deploy/tienda.html` | Shop. `<div id="shop-sections">` is filled by the `shop` module, one carousel aisle per category. |
| `/productos/{handle}` | generated | 9 pages. `<body data-product="{handle}">` is how `app.js` knows which catalogue entry to bind. |

`cleanUrls: true` in `vercel.json` is what makes `/tienda` and `/productos/cirqa` resolve without `.html`. `build/serve.js` reproduces that locally.

### Homepage section order
top bar (scrolling) → floating nav (Tienda / Wearables / Suplementos) → full-bleed hero, two centred CTAs **Suplementos** and **Wearables** → **Los más buscados** carousel (`#mas-buscados`, everything but the two extra watches) → Wearables video band (`#wearables`) → **wearables carousel** (`#wear-grid`, the four Garmin) → **Garmin Connect chapter** (editorial) → **goal assistant** (`#objetivo`) → Suplementos video band (`#suplementos`) → **supplements carousel** (`#sup-grid`) → "Wellness, in one shot." (Cymbiotika, editorial flip) → "Duerme profundo, despierta ligero." (Absorption, editorial) → "Clean nutrition. Real performance." (Promix, editorial flip on white) → closing banner → footer → buy dock.

The goal assistant is the **hinge between the two aisles** — it closes the wearables run and opens the supplements one. It used to close the page; moved 08-12.

Both video bands are **store entrances, not checkout shortcuts**: their CTA goes to `/tienda#wearables` and `/tienda#suplementos`. The product page is reached from the carousel card underneath, never from the band. Because the wearables band opens the whole aisle, its copy covers the **entire Garmin range** ("Todos tus datos de salud. Sin suscripción.", naming CIRQA, Venu® and Vívoactive®) rather than the CIRQA alone.

Deliberately **removed** and not to be reinstated without asking: the comparison table, the "Menos ruido / Mejor bienestar" statement, the "Se pone una vez" band, the "Salud 24/7" chapter, the manifesto chapter, the "Cero distracciones" chapter, the Venu 3S / Venu 4 / Vívoactive 6 chapters, the **FAQ** (removed 08-08; the footer's "Garantía y devoluciones" now points at `mailto:`), the **Women's Multivitamin chapter** and the **Ritual "Made for her." banner** (both removed 08-10 with their products).

The Tienda has no header block: the page opens straight on the first aisle, whose extra `padding-top` clears the floating nav.

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
| `--surface-teal` | `#f3f4f5` | Media placeholders |
| `--surface-sand` | `#faf1e8` | Cream of the Promix loop; carries `.chapter.sand` and `.chapter.tinted` |
| `--cta` | `#17191b` | Near-black |
| `--canvas` | `#eaebec` | Page background behind the shell |

### Liquid glass — the current implementation
Three custom properties plus one pseudo-element carry the whole look:

- `--lg-fill` / `--lg-fill-hi` — white translucent gradient. **The floor opacity (`.64`) is load-bearing**: it is what keeps ink text legible over any backdrop. **One deliberate exception**: `.nav-pill` sits at `.08 → .05` with a reduced shadow, rim and blur — the bar had to disappear over the hero video. Its contrast comes from a light `text-shadow` halo behind the ink of the wordmark, the links and the cart icon; remove the halo and the nav becomes unreadable on foliage.
- `--lg-depth` — dark hairline for silhouette, soft drop shadow, inner white glow.
- **The rim** — a 1px ring whose intensity varies top-to-bottom. A `border` cannot do this, so it is a gradient clipped with `mask-composite: exclude`. Shared by `.btn::after`, `.nav-pill::after`, `.dock-shell::after`, `footer::after`.

### SVG refraction filter — read before touching
Each page embeds `<filter id="lg-refract">`. **It is scoped to Firefox on purpose.** Chromium parses `backdrop-filter: url(...)` then composites nothing — leaving it unscoped silently destroys the plain blur for most visitors:

```css
@supports (-moz-appearance:none) and (backdrop-filter:url("#lg-refract")){ … }
```

### Legacy glass helpers
`.glass-light` / `.glass-dark` / `.blurred` remain for the top bar and the goal CTA pill. Rules that still hold:
1. **Never put `var()` inside `-webkit-backdrop-filter`** — Safari ≤17 does not resolve custom properties there.
2. **Tint alpha alone carries contrast, never blur.**
3. **Nothing with `opacity < 1`, `filter`, `mask`, `clip-path`, `mix-blend-mode` or `will-change` may be an ancestor of a blurred surface** — each creates a backdrop root.

### The card families
| Family | Where | Shape |
|--------|-------|-------|
| `.prod` | `/productos/*` "Otros productos" | Framed card: media box, category, name, tagline, price, button |
| `.fcard` inside `.cards.fcards` | both home carousels and every Tienda aisle | **Floating**: cut-out packshot or product loop, `mix-blend-mode: multiply`, drop shadow, short name, then **`.fcard-buy`** — the price as a `btn btn-ink btn-sm` pill. It is a `span` with `pointer-events:none` (the card is already the link) and `margin-top:auto`, so every button lines up whatever the name's line count |
| `.goal` | the assistant | Full-bleed photo. **`.goal-body` is fully transparent** — the card's own gradient scrim carries legibility; only the `.goal-cta` pill keeps a glass surface |

A supplement that declares a `video` plays it inside `.fcard`; a radial mask dissolves the studio background. Wearables always use their `packshot` — that rule is in `flyMedia()`, keyed on the category.

### Carousels
- `.card-dots` — one dot per page of scroll, filled by the `carousel-dots` module, purely indicative (no focus, no click). Empty when the track fits, so the container takes no space.
- Above 900px the two **home** carousels are bounded and centred: `width:min(1080px, 100% - clamp(80px,10vw,170px))`, `margin-inline:auto`. The Tienda aisles keep the full-bleed track whose `--cards-inset` aligns the first card with the aisle title — do not merge the two behaviours.

### Editorial chapters — `.chapter.editorial`
- ≥900px: `display:flex`, media capped at `230px`, copy facing it. **No reserved height** — the section is as tall as its content. It used to claim a full `100svh`, which was the single biggest source of empty space on the page (removed 2026-08-12).
- ≤899px: **still side by side** — narrow column for the visual (38%), wide one for the copy, and the column template flips with `.flip` so the alternation survives on mobile.
- `.chapter.on-white` (Promix): white section, no plate or radius behind the video, `object-fit:contain` + `mix-blend-mode:multiply`, and two crossed linear masks (`mask-composite:intersect`) that dissolve the loop's near-white studio edge (253,251,249) into the page.

### Vertical rhythm (tightened 2026-08-12)
| Rule | Value |
|------|-------|
| `section` | `padding: clamp(30px,4.4vw,56px) 0` |
| `.section-head` | `gap:12px`, `margin-bottom: clamp(16px,2.2vw,26px)` |
| `.chapter` | `padding: clamp(28px,3.6vw,52px) 0` |
| `.best` | `padding-bottom: clamp(22px,3vw,40px)` |
| `.pdp-brief` / `.pdp-pairs` / `.bundle` | `padding-top: clamp(18px,2.4vw,30px)` |

The home went from 8 437 to 7 481px on desktop and to 6 686px on mobile. Do not restore the old values without asking — the owner asked twice for sections to sit closer.

### Measured layout variables
- `--dock-h` — buy dock height; `body { padding-bottom }` reserves it.
- `--nav-h` — nav pill height; doubles below 1024px.
- `--topbar-h` — scrolling top bar (static `34px`), offsets the nav, the shell, and every scroll anchor.

`body.has-hero` (static in `index.html`) decides whether the shell starts under the nav or lets the hero run beneath it.

### Hero
Full-bleed, `object-fit: cover`. The wordmark and tagline are **baked into the image**:
- Source is `1366×768` — do not upscale it.
- **Below 760px the hero is a full-screen video**, not the image: `hero-mobile.mp4` (720×1280, wordmark baked in by the owner), `height:100dvh` with `100svh` as fallback so it follows the address bar on recent phones. It escapes the card's gutter with `margin-inline:-gutter`, and `body.has-hero .shell` drops its top margin, its top radius and its clipping to let it through — the rest of the card keeps its gutter and corners. The 9/16 video is wider than a phone screen, so `cover` trims the sides; the wordmark is centred and survives.
- `hero-runners-mobile.jpg` (384×768) is the previous mobile crop, now unused but kept.
- The desktop image is carried by a `<source>` inside `<picture>` with a 1×1 transparent `src` fallback: `display:none` does not stop an `<img>` from loading, and mobile was paying 172 kB for a visual it never shows. Symmetrically the video has neither `autoplay` nor `poster` — both trigger a download even when hidden — so `section-loops` starts it and the poster is a CSS background inside the media query.
- Above 760px the two CTAs are **centred** (`.hero-full-inner{align-items:center}`).

### Responsive breakpoints
| Width | What changes |
|-------|--------------|
| `640px` | Top bar text shrinks to stay on one line |
| `719/720px` | Media caps kick in; grids go 2-per-row; `Ver más` clamping activates |
| `759/760px` | Hero switches from the desktop image to the **full-screen video**; goal cards become a **full-width carousel** (one card per screen, sized like the closing banner, with dots); hero CTAs stop being centred |
| `899/900px` | Chapters and floating grids go multi-column; carousel arrows appear; editorial chapters take their full-height desktop form; home carousels get their bounded track |
| `980px` | Product page splits into gallery + buy rail |
| `1023/1024px` | Nav collapses to two rows; the first Tienda aisle takes its tall `padding-top` |

## 7. Catalogue and Shopify

`deploy/catalog.js` exports `window.LOWLABS` with `products`, `goals`, `categories`, and the helpers `byHandle`, `byGoal`, `inCategory`, `money`, `url`. It is the only place prices, images, specs and variant IDs live.

### Products and provisional prices
| Handle | Product | Price (MXN) | Compare at | Source price | Shopify |
|--------|---------|-------------|-----------|--------------|---------|
| `cirqa` | Garmin CIRQA™ Smart Band | 3,999 | 4,199 | MSRP MX | ✅ wired |
| `venu-4` | Garmin Venu® 4 | 10,999 | 11,499 | MSRP MX | ❌ |
| `venu-3s` | Garmin Venu® 3S | 8,899 | 9,399 | MSRP MX | ❌ |
| `vivoactive-6` | Garmin Vívoactive® 6 | 5,999 | 6,299 | MSRP MX | ❌ |
| `creatina` | Cymbiotika Liposomal Advanced Creatine ⚠️ *listed 12 sachets, priced as the 24-pack* | 1,349 | 1,499 | $65 US | ❌ |
| `promix-creatina` | Promix Non-GMO Creatine — 30 sticks × 5 g | 659 | — | $32 US | ❌ |
| `promix-relax` | Promix Relax: Magnesium Complex — 90 caps / 30 servings | 989 | — | $48 US | ❌ |
| `promix-debloat` | Promix Debloat Prebiotic + Probiotic | 599 | — | $29 US | ❌ |
| `absorption-sleep` | The Absorption Company Sleep — 7 sticks, Chamomile Lemonade | 499 | — | $24 US | ❌ |

Supplement prices are the brands' **one-time** (non-subscription) prices converted at the rounded rate used since the first Promix pair (≈ ×20.6). The dock's floor is **"Desde $499 MXN"** and its count **9 productos** — both are hand-written in `index.html` and `tienda.html`.

**Media fields on a product**

| Field | Effect |
|-------|--------|
| `image` / `hero` | The still. Used by the PDP stage, the `.prod` card and the recommendation block when no loop exists. |
| `video` + `poster` + `videoRatio` (`"portrait"` \| `"wide"`) | The loop replaces the packshot on the PDP stage, in the editorial chapter, and — for `category: "Suplementos"` only — inside the floating carousels. `creatina` and `promix-debloat` declare one. |
| `packshot` | The cut-out used wherever products float without a frame. Without it a product shows a visible rectangle in the carousels. |

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
The buy button adds the selected variant to the cart (`deploy/cart.js`) and opens the drawer. The drawer's checkout button builds a **Shopify cart permalink** — `{STORE}/cart/{variant}:{qty},…?locale=es&country=MX` plus `&discount=BUNDLE10` when the cart came from a bundle. Shopify rebuilds the cart, applies its own prices, stock and discounts, then opens its checkout.

`goToCheckout()` still falls back to a `mailto:` when a product has no `shopify` block — no longer reachable today, kept so a new product can never send a customer to a URL that does not exist.

**Discounts**: `BUNDLE10` (10%, minimum 3 items, all customers, no end date) created 2026-08-12, id `gid://shopify/DiscountCodeNode/2396671312249`.

**Checkout header**: the store is still named "My Store", which is what the checkout header displays. Renaming happens in Settings → Store details; a checkout logo (Settings → Checkout → Branding) replaces it visually. Neither is reachable from the Admin API tools available here.

### To wire the remaining eight products
1. Create the product in Shopify admin, note the variant IDs.
2. Add `shopify: { handle: "...", variants: { … } }` to the entry in `deploy/catalog.js`.
3. Run `node build/gen-products.js`.

No other file needs touching — the button label, the note under it, and the JSON-LD all derive from the catalogue.

## 8. The goal assistant

Three goals in `catalog.js`, each with `id`, `label`, `icon`, `image`, `lede`, `pick`, `also` and `why`.

| Goal | Image | Recommends | Complements |
|------|-------|-----------|-------------|
| `dormir` — Dormir mejor | `landing/objetivos/goal-dormir.jpg` | cirqa | absorption-sleep, promix-relax |
| `rendimiento` — Performance | `landing/objetivos/goal-rendimiento.jpg` | venu-4 | promix-creatina, creatina |
| `salud` — Cuidar mi salud diaria | `landing/objetivos/goal-salud.jpg` | cirqa | promix-debloat, promix-relax, creatina |

The `icon` field is still in the data but no longer rendered. Nothing is stored or sent — a pure client-side lookup. The result block stays out of the DOM until a goal is chosen, then receives focus on click (but not on arrow-key navigation).

Below 760px the three cards become a **horizontal carousel**: one full-width card per screen, `min-height:clamp(340px,52vh,520px)` — the closing banner's size — with scroll-snap and the same `.card-dots` indicator. The radiogroup and its roving tabindex are untouched; only the rendering changes.

## 9. `app.js` — 13 modules

Every module runs inside `module(name, fn)`, a try/catch wrapper. This is not decorative: `.rv` elements start at `opacity: 0`, so before the wrapper existed one uncaught error could leave **the entire page invisible**. The reveal module also has a 4-second failsafe.

| Module | Role |
|--------|------|
| `catalog` | Renders the framed grids from `productCard()` **and** the floating tracks from `flyCard()` (`.fcards[data-handles]`) |
| `shop` | Builds `/tienda` aisles — one carousel per category |
| `goals` | The assistant: radiogroup, roving tabindex, recommendation rendering |
| `reveal` | `.rv` scroll reveal + failsafes |
| `hero-video` | Autoplay/pause logic — **currently inert**, the hero is a still image |
| `section-loops` | `data-autoloop` videos: play in view, pause out of view and on tab hide |
| `past-hero` | Toggles `body.past-hero` |
| `dock-height` | Measures `--dock-h` and `--nav-h` |
| `selection` | Product page colour/size radiogroups |
| `checkout` | Shopify redirect or mailto fallback |
| `read-more` | Below 720px, clamps long paragraphs to 3 lines with a `Ver más` toggle |
| `carousel` | Arrows of every floating track; the step is measured from the real gap between the first two items |
| `carousel-dots` | Fills every `.card-dots` with one dot per page. The page count comes from the **real step between two cards** and the track's **content box** (padding excluded) — not from `scrollWidth/clientWidth`, which counts gutters and invents a page. Rebuilds on resize and on `load`; also drives the goals track |

## 10. Media

### `deploy/media/` (66 MB, 60 files, committed)

```
deploy/media/
├── productos/<handle>/     one folder per catalogue handle
│   ├── cirqa/              cirqa-packshot.png, hero-cirqa.mp4 + poster
│   ├── venu-4/  venu-3s/  vivoactive-6/     packshots (mix-blend-mode: multiply)
│   ├── creatina/           creatina.png, sup-creatina.mp4 + poster
│   ├── promix-creatina/    promix-creatine-sticks.png
│   ├── promix-debloat/     promix-debloat.png, debloat-loop.mp4 + poster
│   ├── promix-relax/       promix-relax.png
│   └── absorption-sleep/   absorption-sleep.png
├── landing/
│   ├── hero/               hero-runners.jpg + hero-runners-mobile.jpg
│   ├── objetivos/          goal-dormir / -rendimiento / -salud .jpg
│   ├── bandas/             loop-wearables, loop-capsulas, loop-brand (+ posters)
│   └── capitulos/          loop-vertical, cymbiotika-shot (+ posters)
└── archivo/                30 files kept but referenced by nothing
    ├── cirqa/              app screens, rock/tan/sensor shots, wrist-negra
    ├── objetivos/          goal-energia, -longevidad, -recuperacion
    ├── suplementos/        capsules-*, loop-suplementos, promix-loop, sup-prenatal/
    │                       -synbiotic/-womens sets, promix-creatine.png (180-serving bag)
    └── ritual/             ritual-hand.png, ritual-essential.png
```

**Conventions**
- A loop's poster is the **neighbouring file prefixed `poster-`**. `gen-products.js` rebuilds band posters from that rule (`posterOf()`), so `BAND_VIDEO` values carry the folder: `cirqa: "productos/cirqa/hero-cirqa"`.
- `archivo/` holds the visuals of removed sections. Do not delete without asking — they are the only copies of the Ritual banner and the dropped Cymbiotika supplements.
- CIRQA photography still comes from the **Shopify CDN**; `assets-hd/cdn-urls.json` is the source of truth for those URLs.

### `assets/` (150 MB, sources, never served)

One folder per product handle, mirroring `deploy/media/productos/`:

```
assets/
├── cirqa/{producto,lifestyle,app,video,documentos}   the whole Garmin CIRQA pack
├── venu-4/  venu-3s/  vivoactive-6/                  official Garmin packshots
├── creatina/  promix-creatina/  promix-debloat/  promix-relax/  absorption-sleep/
├── landing/            hero render, logo, capsule renders, loop rushes
├── archivo/ritual/     removed product, sources kept
└── fotosyvideos2/      original dump, untouched
```

Rushes were renamed after the loop they produce (`landing/loop-wearables.mp4` → `deploy/media/landing/bandas/loop-wearables.mp4`). Rushes that are byte-for-byte duplicates of a committed `deploy/media` file are deliberately **left untracked**, as are the newest raw sources.

> ### ⚠️ `assets/` and `assets-hd/` are in a PUBLIC GitHub repo
>
> `origin` is `github.com/megevanderwan2004-maker/lowbasemx`, which is public. Tracked files include `assets/cirqa/documentos/83713503-*.pdf`, the official Garmin product sheet that `CLAUDE.md` describes as containing **confidential reseller pricing**, and `assets-hd/garmin-video.mp4`, Garmin-copyrighted footage.
>
> This predates the rewrites. `vercel.json` pins `outputDirectory: "deploy"` so these files are never served from the website — **do not remove that setting.**
>
> Remediation needs an owner decision: make the repo private, or `git rm --cached` + `.gitignore` + history rewrite (which invalidates every existing clone). Untracking alone does not help — the files stay reachable in past commits.

## 11. How to run locally

```bash
node build/serve.js 4175
```

Serves `deploy/` at `http://localhost:4175` and emulates Vercel's `cleanUrls`. `.claude/launch.json` points at this script.

`.claude/serve.py` is the older Python equivalent and **does not work here**: macOS blocks the CommandLineTools `python3` from reading this Documents folder. Use the Node server.

Most images are local, but CIRQA photography still loads from the Shopify CDN, so full rendering needs an internet connection.

## 12. Deployment

`vercel.json`: `outputDirectory: "deploy"`, `cleanUrls: true`, `buildCommand: null`, plus `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` headers and a no-cache rule on `styles.css` / `app.js`.

```bash
vercel login
```
```bash
vercel --prod
```

`vercel login` opens a browser and cannot be run headlessly. Importing `lowbasemx` from the Vercel dashboard is the more practical option: it reads `vercel.json` as-is and redeploys on every push to `main`.

## 13. Open questions

1. **Inventory is not tracked** on the eight products created on 2026-08-12 — they can be ordered without limit (owner's choice).
2. **No Storefront API token** — the cart is a permalink hand-off. A token would allow a fully headless cart with live prices and stock.
3. ~~Shopify for the eight non-CIRQA products~~ — done on 2026-08-11, all nine are wired.
4. **Image rights** — Promix, Absorption and Cymbiotika packshots pulled from the brands' CDNs. Unconfirmed.
5. **Supplement copy** — taglines, highlights and spec tables are adapted from the source pages; the editorial voice is ours and unreviewed.
6. **Custom domain** — none.
7. **Vercel** — no project linked from this machine.
8. **`site/` and `shopify-theme/`** — abandoned. Delete, or regenerate from `deploy/`?
9. **No analytics, no cookie banner, no dedicated shipping/returns page.** The footer's "Garantía y devoluciones" points at `mailto:`.
10. **`assets-hd/resource_urls.json`** holds expired Shopify staged-upload URLs; historical record only.

## 14. Files to understand before making changes

1. **`README.md`** — structure, media conventions, commands.
2. **`CLAUDE.md`** — product specs, brand, competition.
3. **`deploy/catalog.js`** — everything about products and goals. Most content changes start and end here.
4. **`deploy/index.html`** — homepage structure and section order.
5. **`deploy/app.js`** — the 13 modules.
6. **`deploy/styles.css`** — the design system; the liquid-glass and backdrop-filter comments are load-bearing.
7. **`build/gen-products.js`** — the page templates for `/productos/*`.

## 15. Instructions for a future Claude session

### Before changing anything
1. Read `README.md` and `CLAUDE.md`, then this file.
2. Assume `deploy/` unless told otherwise. `site/` and `shopify-theme/` are stale.
3. Preview with `node build/serve.js 4175`.

### Rules that will bite you if ignored
- **Run `node build/gen-products.js`** after editing `catalog.js` or the generator templates. Nothing warns you if you forget.
- **Never hand-edit `deploy/productos/*.html`** — regenerated, your changes vanish.
- **Keep media paths in sync with their folder** — `productos/<handle>/`, `landing/<partie>/`, and a poster next to its loop. `gen-products.js` depends on the poster rule.
- **Do not change Shopify variant IDs** without confirming against the live store.
- **Do not change prices** without explicit confirmation.
- **Do not reintroduce green.** The `--teal-*` names are historical; their values are grey.
- **Do not unscope the `#lg-refract` backdrop filter** from the Firefox guard.
- **Do not lower the `--lg-fill` floor opacity** below `.64`.
- **Do not upscale `hero-runners.jpg`** — the source is 1366×768.
- **Do not remove `outputDirectory: "deploy"`** from `vercel.json`.
- **Keep all customer-facing copy in Spanish** (es-MX).
- **Preserve accessibility**: skip link, ARIA radiogroups with roving tabindex, `sr-only` price context, ≥44px tap targets, `prefers-reduced-motion` fallbacks.

### Adding a product
1. Append an entry to `PRODUCTS` in `deploy/catalog.js` (`handle`, `name`, `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`, `specs`; optional `badge`, `compareAt`, `colors`, `sizes`, `shopify`, `packshot`, `video`, `poster`, `videoRatio`, `story`).
2. Put its optimised visuals in `deploy/media/productos/<handle>/` and its sources in `assets/<handle>/`. For a carousel it needs a **cut-out** (`packshot`).
3. Run `node build/gen-products.js`.
4. Add it to a carousel by hand: `data-handles` on `#cards` and `#sup-grid` in `index.html`. The Tienda aisles pick it up automatically from its `category`.
5. Editorial chapters are hand-written — only cards and aisles are generated.
6. Update the dock in `index.html` and `tienda.html`: "N productos" and the "Desde $X MXN" floor.
