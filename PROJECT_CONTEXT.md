# PROJECT_CONTEXT.md

> Last updated: 2026-08-18 (aisle pages, goal video cards, aisle hero loops)
> Purpose: Give a future Claude Code session (or human contributor) everything needed to continue this project without prior conversation context.

---

## 1. Project overview

**Lowlabs** is a Mexican reseller working directly with Garmin at reseller pricing, plus a curated supplement line. Brand positioning is "curated wellness and technology" — premium wellness editorial, not sporty gadget. All customer-facing content is in Spanish (es-MX), prices in MXN.

The site started as a **single-product landing page** for the Garmin CIRQA Smart Band (launched 2026-07-21), became a five- then nine-product storefront, and on 2026-08-10 **swapped its supplement half**: the two Cymbiotika newcomers (Women's Multivitamin, Synbiotic) left, Promix Relax and The Absorption Company Sleep arrived. The catalogue still holds **nine products across four brands** — Garmin (4 wearables), Cymbiotika (1), Promix (3) and The Absorption Company (1).

The main competitor is **DelMaz** (delmaz.mx), the official Garmin distributor in Mexico for 18 years. Lowlabs differentiates on price, a much shorter catalogue, and brand aesthetics.

## 2. Current state

`deploy/` is **canonical and the only actively maintained variant.** It is a static site of 13 HTML pages plus a shared CSS/JS/catalogue triplet. No build step at request time; product pages are generated ahead of time by a Node script (section 4).

**What works today**
- 13 pages: home, `/tienda`, the two aisle pages `/wearables` and `/suplementos`, and 9 product pages, all internally linked and verified.
- Home opens on the "Los más buscados" carousel, then alternates video band → compact carousel → editorial chapter, with the goal assistant hinging between the wearables and supplements runs.
- Three home carousels, all on the same compact card (`#mas-buscados`, `#wear-grid`, `#sup-grid`).
- **Goal assistant**: three cards carrying a muted 9/16 loop (`deploy/media/landing/objetivos/goal-*.mp4`, declared as `video`/`poster` on `GOALS` in `catalog.js`). The cards are deliberately the **same box as the Garmin Connect chapter loop** — both read the `--media-box` token, `clamp(260px,25vw,380px)` in 9/16 — and the track scrolls at every width, so on a phone one card reads whole and the next peeks. Section background is plain white, not the old sand gradient.
- Carousel cards carry a **price button** in the same glass language as "Comprar", and discreet **dots** signal that a track scrolls. A track that already fits drops its arrows and its whole `.head-aside` row, so nothing empty is left under the title.
- Editorial chapters (Garmin Connect, Cymbiotika): visual on one side, copy on the other, **side by side on mobile too**. Since 08-21 the two columns are sized rather than stretched (`--media-box` + `46ch`) and the pair is centred, so the copy no longer leaves a hole on one flank.
- **Full-bleed layout (08-21)**: `--gutter` falls to zero below 700px — the card *is* the phone screen, square corners included — `.container` runs to 1500px, the closing banner and the cinematic bands touch both edges, and the aisle-page header takes hero height (`clamp(440px,74vh,820px)`).
- **Smooth scrolling**: one Lenis instance (`deploy/lenis.min.js`, the only npm dependency), started by the `smooth-scroll` module. Touch stays native, horizontal tracks keep their own gesture, `prefers-reduced-motion` skips it entirely. See section 9.
- **Cart on every page**: drawer with image, name, chosen options, quantity, remove, subtotal; a cart icon in the nav carries the count. Lines are Shopify variant references; checkout is a Shopify cart permalink.
- **Nav**: links, centred wordmark, cart icon. Nothing else — "Comprar" was removed on 2026-08-12. The three links are real pages: `/tienda`, `/wearables`, `/suplementos`; the current one carries `aria-current="page"`.
- **Bundle on every PDP**: viewed product + its two first `pairs`, −10% shown, colour swatches on the watch, added as individual variants with the `BUNDLE10` code attached.
- All nine products check out on Shopify — colour/size drive the exact variant.
- Liquid-glass design system: white translucent surfaces, ink text, a masked gradient rim shared by buttons, both bars, and the footer.

**What is NOT connected**
- **Vercel: nothing is deployed from this machine.** `vercel.json` is correct and ready; someone has to run `vercel login` (browser flow) then `vercel --prod`, or import the GitHub repo from the Vercel dashboard. A preview build has been seen at `lowbasemx-1er1.vercel.app`.
- **Cart**: `deploy/cart.js` holds a list of Shopify variant references and hands off to a Shopify cart permalink (`/cart/ID:QTY,…`) at checkout — the store rebuilds the cart, applies its prices and opens its own checkout. No Storefront API token exists (creating one is blocked for AI tools), so line data is read from `catalog.js`, which mirrors the store.
- **Bundle**: every PDP shows the viewed product + the first two `pairs` entries, −10% shown, added as individual variants. The `BUNDLE10` code (10%, minimum 3 items, all customers) exists in Shopify since 2026-08-12 and is passed on the cart link.
- **Prices are CONFIRMED** by the owner (2026-08-12): the supplement prices converted from the US stores are the final ones.
- **Third-party imagery** — Promix and Absorption packshots come from the brands' own Shopify CDNs; the four CIRQA colour renders come from Garmin's own product CDN (`res.garmin.com`), now served locally. Usage rights unconfirmed.
- **Custom domain** — not configured.

**Recent history** (`git log`, newest first)
| Commit | Date | What changed |
|--------|------|--------------|
| `—` | 08-21 | **Full-bleed pass**: zero gutter on phones, 1500px container, bigger carousel/chapter/goal media, taller bands; **Lenis** smooth scroll; CIRQA colours switched to the official Garmin renders |
| `b0f2669` | 08-18 | `/wearables` and `/suplementos` get their own header loop (treadmill / capsules) |
| `b8582a6` | 08-18 | Goal assistant switched to muted 9/16 loops, sized on the Garmin Connect box, white background |
| `1ade5a5` | 08-18 | **`/wearables` and `/suplementos` aisle pages added**; nav links become real pages |
| `a1c268b` | 08-12 | Goal assistant moved between the two aisles; wearables band copy widened to the whole Garmin range |
| `d164fa6` | 08-12 | Carousel cards shrunk to 152/126px, surrounding spacing tightened, `/tienda#…` deep links fixed |
| `6a1b26d` | 08-12 | Missing video and photo sources committed |
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

**Latest pass (2026-08-18)** — four chained changes:
1. **Carousels shrunk** to `min(34vw,152px)` (desktop) / `min(33vw,126px)` (mobile) and every neighbouring margin tightened with them, so the reduction did not leave holes. A track that fits now drops its arrows and its whole `.head-aside` row.
2. **Two aisle pages** — `/wearables` and `/suplementos` — reached from the nav, driven entirely by `data-category`. Product-page breadcrumbs now point at them instead of `/tienda`.
3. **Goal assistant** moved between the two aisle runs, then re-skinned: muted 9/16 loops in the Garmin Connect box, on white.
4. **Aisle header loops** — each aisle page got its own footage rather than re-using the home bands. `loop-suplementos-hero.mp4` is the **full 12.6 s source**: it alternates between an out-of-focus liquid macro (0–2 s, ~6 s) and the golden capsules (3 s, 8 s → end). It was briefly cut to the capsule tail; the owner asked for the whole clip back on 08-18.

**Previous pass (2026-08-10)** — three chained changes:
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
│   ├── index.html             Homepage (430 lines)
│   ├── tienda.html            Shop page; aisles rendered client-side
│   ├── wearables.html         Wearables aisle page (/wearables)
│   ├── suplementos.html       Supplements aisle page (/suplementos)
│   ├── productos/             GENERATED — do not hand-edit
│   │   ├── cirqa.html  venu-4.html  venu-3s.html  vivoactive-6.html
│   │   ├── creatina.html  promix-creatina.html  promix-debloat.html
│   │   └── promix-relax.html  absorption-sleep.html
│   ├── catalog.js             ★ Single source of truth: products + goals (406 lines)
│   ├── app.js                 All behaviour, 16 isolated modules (1258 lines)
│   ├── styles.css             Full design system (2189 lines)
│   └── media/                 86 MB, 73 files — see section 10
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
| `/wearables`, `/suplementos` | `deploy/wearables.html`, `deploy/suplementos.html` | Aisle pages, reached from the top nav. Same chrome as `/tienda`; the grid is a `.cat-grid[data-category]` filled by the `catalog` module from `catalog.js`, so **no product is written in their HTML** — adding or removing one from the catalogue updates both pages, count included (`data-count-for`). Each page opens on **its own** `.band` loop (`bandas/loop-wearables-hero.mp4`, `bandas/loop-suplementos-hero.mp4`) and closes on a cross-link band re-using the home loops. Sort chips are the `cat-sort` module. |
| `/productos/{handle}` | generated | 9 pages. `<body data-product="{handle}">` is how `app.js` knows which catalogue entry to bind. |

`cleanUrls: true` in `vercel.json` is what makes `/tienda` and `/productos/cirqa` resolve without `.html`. `build/serve.js` reproduces that locally.

### Homepage section order
top bar (scrolling) → floating nav (Tienda / Wearables / Suplementos) → full-bleed hero, two centred CTAs **Suplementos** and **Wearables** → **Los más buscados** carousel (`#mas-buscados`, everything but the two extra watches) → Wearables video band (`#wearables`) → **wearables carousel** (`#wear-grid`, the four Garmin) → **Garmin Connect chapter** (editorial) → **goal assistant** (`#objetivo`) → Suplementos video band (`#suplementos`) → **supplements carousel** (`#sup-grid`) → "Wellness, in one shot." (Cymbiotika, editorial flip) → closing banner → footer → buy dock.

The goal assistant is the **hinge between the two aisles** — it closes the wearables run and opens the supplements one. It used to close the page; moved 08-12.

Both video bands are **store entrances, not checkout shortcuts**: their CTA goes to `/tienda#wearables` and `/tienda#suplementos`. The product page is reached from the carousel card underneath, never from the band. Because the wearables band opens the whole aisle, its copy covers the **entire Garmin range** ("Todos tus datos de salud. Sin suscripción.", naming CIRQA, Venu® and Vívoactive®) rather than the CIRQA alone.

Deliberately **removed** and not to be reinstated without asking: the comparison table, the "Menos ruido / Mejor bienestar" statement, the "Se pone una vez" band, the "Salud 24/7" chapter, the manifesto chapter, the "Cero distracciones" chapter, the Venu 3S / Venu 4 / Vívoactive 6 chapters, the **FAQ** (removed 08-08; the footer's "Garantía y devoluciones" now points at `mailto:`), the **Women's Multivitamin chapter** and the **Ritual "Made for her." banner** (both removed 08-10 with their products), and the **Absorption "Duerme profundo…"** and **Promix "Clean nutrition…"** chapters (removed 08-19; both products stay in the catalogue, the carousels and `/suplementos`).

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
| `--surface-sand` | `#faf1e8` | Cream of the Promix loop; carries `.chapter.tinted` (and `.chapter.sand`, unused since the Absorption chapter left) |
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
| `.goal` | the assistant | Full-bleed **muted loop** in a 9/16 box sized by `--media-box` — deliberately the same box as the Garmin Connect chapter media. **`.goal-body` is fully transparent** — the card's own gradient scrim carries legibility; only the `.goal-cta` pill keeps a glass surface |
| `.prod` inside `.cat-grid[data-category]` | `/wearables`, `/suplementos` | The same framed card, driven by category instead of a hand-written list |

A supplement that declares a `video` plays it inside `.fcard`; a radial mask dissolves the studio background. Wearables always use their `packshot` — that rule is in `flyMedia()`, keyed on the category.

### Carousels
- `.card-dots` — one dot per page of scroll, filled by the `carousel-dots` module, purely indicative (no focus, no click). Empty when the track fits, so the container takes no space.
- Above 900px the **three home** carousels are bounded and centred: `width:min(1500px, 100% - clamp(20px,3vw,64px))`, `margin-inline:auto`, plus `justify-content:safe center` so a short track (the four wearables) sits under its title instead of leaving a hole on the right. The Tienda aisles keep the full-bleed track whose `--cards-inset` aligns the first card with the aisle title — do not merge the two behaviours.
- **Arrows hide themselves** when a track already fits (`scrollWidth - clientWidth <= 2`), and so does the `.head-aside` that only held them. Both need an explicit `[hidden]{display:none}` rule: the author-level `display:flex` would otherwise beat the browser's own.

### Editorial chapters — `.chapter.editorial`
- ≥900px: `display:flex`; the grid is `var(--media-box) minmax(0,46ch)` (mirrored by `.flip`) and `justify-content:center` — **both columns are sized, neither is stretched**, so the leftover width splits evenly instead of piling up on the copy's flank. **No reserved height** — the section is as tall as its content. It used to claim a full `100svh`, which was the single biggest source of empty space on the page (removed 2026-08-12).
- ≤899px: **still side by side** — narrow column for the visual (44%), wide one for the copy, and the column template flips with `.flip` so the alternation survives on mobile.
- `.chapter.on-white` (was the Promix chapter): white section, no plate or radius behind the video, `object-fit:contain` + `mix-blend-mode:multiply`, and two crossed linear masks (`mask-composite:intersect`) that dissolve the loop's near-white studio edge (253,251,249) into the page. **No page uses it since 08-19** — the CSS is kept for the next on-white loop.

### Vertical rhythm (tightened again 2026-08-12, second pass)
| Rule | Value |
|------|-------|
| `section` | `padding: clamp(22px,3.2vw,40px) 0` |
| `.section-head` | `gap:10px`, `margin-bottom: clamp(12px,1.7vw,20px)`; `.center` gets `row-gap:14px` above 900px |
| `.chapter` / `.chapter.editorial` | `padding: clamp(22px,2.9vw,40px) 0` |
| `.best` | `padding: clamp(20px,2.4vw,30px)` top / `clamp(14px,1.8vw,22px)` bottom |
| `.goals-sec` | `padding: clamp(22px,3.2vw,40px) 0`, background plain white |
| `.shop-sec` | `padding: clamp(26px,3.4vw,46px) 0` |
| `.card-dots:not(:empty)` | `margin-top: clamp(10px,1.3vw,14px)` |

Ink-to-ink gaps between home sections now sit in a **74–79px band on desktop**, with no outliers. Section padding is unchanged since 08-12; the 08-21 pass only grew the media inside. The home measures **7 309px desktop (1440×900) / 6 337px mobile (390×844)** — two chapters fewer, much larger visuals. Do not restore the old values without asking — the owner has asked three times for sections to sit closer.

### Measured layout variables
- `--gutter` — grey canvas around the card: `clamp(0px,.9vw,14px)`, forced to `0` below 700px where `.shell` also drops its radius. The bands and the closing banner escape it with `margin-inline:calc(-1 * var(--gutter))`.
- `--media-box` — the shared 9/16 box, `clamp(260px,25vw,380px)`: editorial chapter media **and** goal cards. Keep them equal.
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
| `699/700px` | `--gutter` drops to zero and `.shell` loses its radius: the card touches both edges of the phone |
| `719/720px` | Media caps kick in; grids go 2-per-row; `Ver más` clamping activates |
| `759/760px` | Hero switches from the desktop image to the **full-screen video**; hero CTAs stop being centred |
| `899/900px` | Chapters and floating grids go multi-column; carousel arrows appear (when the track actually scrolls); editorial chapters take their desktop form; home carousels get their bounded, centred track |
| `980px` | Product page splits into gallery + buy rail |
| `1023/1024px` | Nav collapses to two rows; the first Tienda aisle and the aisle-page header take their tall `padding-top` to clear the floating pill |

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

### CIRQA colour → image → variant (2026-08-21)
The four colour visuals are **Garmin's own product renders** (`res.garmin.com/en/products/<pn>/v/cf-xl.jpg`, 1200 × 1200), trimmed to the band with a 5% margin and served from `deploy/media/productos/cirqa/`. They replaced the Shopify-CDN photos.

| Colour (store) | File | Garmin part number |
|----------------|------|--------------------|
| Negra | `cirqa-negra.jpg` | `010-04675-00` / `-10` (Noir) |
| Gris Francés | `cirqa-gris-frances.jpg` | `010-04675-01` / `-11` (Lin) |
| Malva | `cirqa-malva.jpg` | `010-04675-02` / `-12` (Rose) |
| Azul Capitán | `cirqa-azul-capitan.jpg` | `010-04675-03` / `-13` (Bleu Marine) |

`1200px` is the largest size the CDN serves (`-xl`; `-lg` is 600, no larger suffix exists). The same file feeds the gallery frame, the gallery thumb and the colour rail thumb — one download each, whatever the size on screen.

The chain is **swatch → `state.color` → the gallery frame carrying that `data-color` → `shopify.variants[colour][size]`**. Nothing is swapped on click: the frames coexist in the track and it scrolls; below 980px `revealGallery()` brings the visual back under the reader's eyes through Lenis. Colour × size was re-tested end to end on 08-21: all eight combinations resolve to the IDs above.

The CIRQA entry declares **`shotFit: "contain"`** — a per-product flag read by `gen-products.js`, which puts `.contain` on the frames and thumbs it generates. Framing used to be inferred from the file extension (`[src$=".png"]`), which no longer works now that product renders are JPEG on white.

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

Three goals in `catalog.js`, each with `id`, `label`, `icon`, `video`, `poster`, `lede`, `pick`, `also` and `why`.

| Goal | Loop | Recommends | Complements |
|------|------|-----------|-------------|
| `dormir` — Dormir mejor | `landing/objetivos/goal-dormir.mp4` (bed at sunrise, 6.4 s) | cirqa | absorption-sleep, promix-relax |
| `rendimiento` — Performance | `landing/objetivos/goal-rendimiento.mp4` (mountain runner, 12 s) | venu-4 | promix-creatina, creatina |
| `salud` — Cuidar mi salud diaria | `landing/objetivos/goal-salud.mp4` (stretching by the water, 12 s) | cirqa | promix-debloat, promix-relax, creatina |

`goalMedia()` in `app.js` renders a `<video>` when the goal declares one and falls back to `<img>` on `image` — the three old stills live on in `media/archivo/objetivos/`. The loops carry the same attributes as every other loop on the site (`autoplay muted loop playsinline data-autoloop`), so `section-loops` pauses them off-screen. They still contain an audio track — `muted` is what guarantees silence; no `ffmpeg` was available to strip it.

The `icon` field is still in the data but no longer rendered. Nothing is stored or sent — a pure client-side lookup. The result block stays out of the DOM until a goal is chosen, then receives focus on click (but not on arrow-key navigation).

**The cards are deliberately the same box as the Garmin Connect chapter loop** — `aspect-ratio:9/16`, `flex:0 0 min(62vw,230px)` — and the track scrolls at **every** width, not just on mobile. Above 900px the three fit and the track centres itself; on a phone one card reads whole and the next peeks by about a third, which is what says it slides. The radiogroup and its roving tabindex are untouched; only the rendering changes.

## 9. `app.js` — 17 modules

Every module runs inside `module(name, fn)`, a try/catch wrapper. This is not decorative: `.rv` elements start at `opacity: 0`, so before the wrapper existed one uncaught error could leave **the entire page invisible**. The reveal module also has a 4-second failsafe.

| Module | Role |
|--------|------|
| `smooth-scroll` | Creates the page's single Lenis instance and exposes `LOWSCROLL` (see section 11). Returns immediately under `prefers-reduced-motion` |
| `catalog` | Renders the framed grids from `productCard()` (`[data-exclude]`, `[data-handles]`, `[data-category]`) **and** the floating tracks from `flyCard()` (`.fcards[data-handles]`) |
| `cat-sort` | The aisle pages' sort chips. **Moves** the existing card nodes rather than re-rendering — a re-render would drop the observer that pauses product loops off-screen and restart every video |
| `shop` | Builds `/tienda` aisles — one carousel per category, then **re-lands the URL fragment**: the aisles are born in JS, so the browser's own jump to `#wearables` fired on an anchor that did not exist yet. It re-lands on every layout shake (fonts, images, arrows folding) until a real gesture — wheel, touch, key, pointer — says the reader has taken over |
| `goals` | The assistant: radiogroup, roving tabindex, recommendation rendering |
| `reveal` | `.rv` scroll reveal + failsafes |
| `hero-video` | Autoplay/pause logic — **currently inert**, the hero is a still image |
| `section-loops` | `data-autoloop` videos: play in view, pause out of view and on tab hide |
| `past-hero` | Toggles `body.past-hero` |
| `dock-height` | Measures `--dock-h` and `--nav-h` |
| `selection` | Product page colour/size radiogroups |
| `checkout` | Shopify redirect or mailto fallback |
| `read-more` | Below 720px, clamps long paragraphs to 3 lines with a `Ver más` toggle |
| `carousel` | Arrows of every floating track; the step is measured from the real gap between the first two items. Also **hides the arrows** — and the `.head-aside` that only held them — when the track already fits |
| `carousel-dots` | Fills every `.card-dots` with one dot per page. The page count comes from the **real step between two cards** and the track's **content box** (padding excluded) — not from `scrollWidth/clientWidth`, which counts gutters and invents a page. Rebuilds on resize and on `load`; also drives the goals track |

### Smooth scrolling — Lenis 1.3.26

`deploy/lenis.min.js` (19 kB) is a straight copy of `node_modules/lenis/dist/lenis.min.js`; `npm run vendor:lenis` refreshes it. There is **no bundler** — the file is loaded with a plain `<script defer>` before `catalog.js` on all 13 pages, and `styles.css` carries the library's few CSS rules so no extra request is made.

One instance, created in `smooth-scroll` with `autoRaf: true` — **Lenis's own loop is the only `requestAnimationFrame` loop on the page.** Lenis drives the document's real scroll position, so `position:sticky`, the `IntersectionObserver`s (`.rv` reveals, `section-loops` video play/pause) and the fixed nav/dock need no adaptation.

| Decision | Why |
|----------|-----|
| `syncTouch: false` (default) | Touch scrolling stays 100% native: system inertia, horizontal tracks, product gallery, no scroll locking. The brief asked for native mobile UX over desktop-style smoothing |
| `anchors: false` | Lenis does not read `scroll-margin-top`, which is what clears the floating nav. `smooth-scroll` intercepts same-page `a[href^="#"]` itself, subtracts the margin, and hands the result to Lenis. The skip link keeps its instant jump |
| `html.lenis{scroll-behavior:auto}` | The CSS `scroll-behavior:smooth` would re-animate every frame Lenis writes |
| Horizontal-wheel escape | Lenis calls `preventDefault()` on the wheel events it handles, which would kill trackpad side-swipes. A capture listener stops propagation — nothing else — for clearly horizontal gestures over `.cards`, `.goals`, `.gal-stage`, `.gal-thumbs`, `.rail-track`, so the browser scrolls the track natively. The same selector list carries `overscroll-behavior-x:contain` in CSS |
| `scrollToY()` | The single entry point for programmatic scrolls (gallery return after a colour change, `/tienda#aisle` landing, anchor links). A raw `window.scrollTo` would leave Lenis and the page disagreeing for a frame |
| `LOWSCROLL.stop()` / `.start()` | The cart drawer sets `overflow:hidden` on the body; without stopping Lenis it would keep advancing its internal position on a frozen page and release it in one jump on close |
| Reduced motion | The instance is never created — the page keeps native scrolling. Lenis also honours the setting on its own |

## 10. Media

### `deploy/media/` (86 MB, 73 files, committed)

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
│   ├── objetivos/          goal-dormir / -rendimiento / -salud .mp4 (+ posters)
│   ├── bandas/             loop-wearables, loop-capsulas, loop-brand,
│   │                       loop-wearables-hero, loop-suplementos-hero (+ posters)
│   └── capitulos/          loop-vertical, cymbiotika-shot (+ posters)
└── archivo/                30 files kept but referenced by nothing
    ├── cirqa/              app screens, rock/tan/sensor shots, wrist-negra
    ├── objetivos/          goal-energia, -longevidad, -recuperacion,
    │                       + the three stills the loops replaced (08-18)
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

Nearly everything is local since the CIRQA colour renders moved into `deploy/media/` (08-21). Two CDN references remain — the CIRQA lifestyle `hero` and the home hero's CSS poster — plus Google Fonts, so a fully faithful render still wants an internet connection.

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
5. **`deploy/wearables.html`** / **`deploy/suplementos.html`** — the aisle-page template; the two files are the same skeleton with different copy, media and category.
6. **`deploy/app.js`** — the 17 modules.
7. **`deploy/styles.css`** — the design system; the liquid-glass and backdrop-filter comments are load-bearing.
8. **`build/gen-products.js`** — the page templates for `/productos/*`, including the nav and the category breadcrumb.

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
- **Do not open a second Lenis instance, a second `requestAnimationFrame` loop, or add another scroll/animation library.** One instance, `autoRaf`, and the reveals stay on `IntersectionObserver`.
- **Do not call `window.scrollTo` directly** in `app.js` — use `scrollToY()`, or `LOWSCROLL` from another file.
- **Do not hand-edit `deploy/lenis.min.js`** — it is a copy; run `npm run vendor:lenis`.
- **Keep all customer-facing copy in Spanish** (es-MX).
- **Preserve accessibility**: skip link, ARIA radiogroups with roving tabindex, `sr-only` price context, ≥44px tap targets, `prefers-reduced-motion` fallbacks.

### Adding a product
1. Append an entry to `PRODUCTS` in `deploy/catalog.js` (`handle`, `name`, `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`, `specs`; optional `badge`, `compareAt`, `colors`, `sizes`, `shopify`, `packshot`, `video`, `poster`, `videoRatio`, `story`).
2. Put its optimised visuals in `deploy/media/productos/<handle>/` and its sources in `assets/<handle>/`. For a carousel it needs a **cut-out** (`packshot`).
3. Run `node build/gen-products.js`.
4. Add it to a carousel by hand: `data-handles` on `#cards`, `#wear-grid` and `#sup-grid` in `index.html`. The Tienda aisles **and both aisle pages** pick it up automatically from its `category` — nothing to touch there.
5. Editorial chapters are hand-written — only cards and aisles are generated.
6. Update the dock in `index.html` and `tienda.html`: "N productos" and the "Desde $X MXN" floor. (The aisle pages' dock shows shipping and warranty, not a count, so it needs nothing.)
