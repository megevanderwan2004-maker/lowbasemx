# PROJECT_CONTEXT.md

> Last updated: 2026-08-18 (aisle pages, goal video cards, aisle hero loops)
> Purpose: Give a future Claude Code session (or human contributor) everything needed to continue this project without prior conversation context.

---

## 1. Project overview

**Lowlabs** is a Mexican reseller working directly with Garmin at reseller pricing, plus a curated supplement line. Brand positioning is "curated wellness and technology" — premium wellness editorial, not sporty gadget. All customer-facing content is in Spanish (es-MX), prices in MXN.

The site started as a **single-product landing page** for the Garmin CIRQA Smart Band (launched 2026-07-21), became a five- then nine-product storefront, and on 2026-08-10 **swapped its supplement half**: the two Cymbiotika newcomers (Women's Multivitamin, Synbiotic) left, Promix Relax and The Absorption Company Sleep arrived. On 2026-08-21 it gained its first **accessory** and its first **multi-option supplement**: the catalogue now holds **ten products across four brands** — Garmin (4 wearables + 1 replacement band), Cymbiotika (1), Promix (3) and The Absorption Company (1, in three formats). A third category, **Accesorios**, appeared with the band.

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
- **Full page (08-22)**: `.shell` and `footer` lost their 1680px cap, their radius and their shadow; the gutter is zero everywhere. The document background moved from `<html>` to `<body>` so a page class can set it — it is what paints the iPhone's safe areas, so it takes the colour of whatever opens the page (ink on the home and the two aisles, white elsewhere). The floating nav and the no-hero pages offset themselves by `env(safe-area-inset-top)`.
- **Full-bleed media (08-21)**: `--gutter` falls to zero below 700px — the card *is* the phone screen, square corners included — `.container` runs to 1500px, the closing banner and the cinematic bands touch both edges, and the aisle-page header takes hero height (`clamp(440px,74vh,820px)`).
- **Smooth scrolling**: one Lenis instance (`deploy/lenis.min.js`, the only npm dependency), started by the `smooth-scroll` module. Touch stays native, horizontal tracks keep their own gesture, `prefers-reduced-motion` skips it entirely. See section 9.
- **Cart on every page**: drawer with image, name, chosen options, quantity, remove, subtotal; a cart icon in the nav carries the count. Lines are Shopify variant references; checkout is a Shopify cart permalink.
- **Nav**: links, centred wordmark, cart icon. Nothing else — "Comprar" was removed on 2026-08-12. The three links are real pages: `/tienda`, `/wearables`, `/suplementos`; the current one carries `aria-current="page"`.
- **Bundle on every PDP**: viewed product + its two first `pairs`, −10% shown, colour swatches on the watch, added as individual variants with the `BUNDLE10` code attached.
- All ten products check out on Shopify. **Three shapes of variant table** now coexist — single variant, one option (Venu 4 by colour, Sleep by format), two options (CIRQA and the band, colour × size) — and `LOWLABS.variantOf()` in `catalog.js` is the only resolver. `LOWLABS.priceOf()` does the same for prices, since a Sleep format costs more than the product's base price.
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
| `5dd1b61` | 08-22 | **Full page**: card identity removed (no max-width, radius or shadow), gutter zero everywhere, body paints the iPhone safe areas in the page's own opening colour, nav offset by the notch |
| `dd108fb` | 08-21 | **Venu 4 in 3 colours, Sleep in 3 formats, replacement band added** (Shopify variants created); shared variant/price resolver; 3 official views per CIRQA and Venu 4 colour; brand galleries on the supplements; lifestyle triptych on `/wearables` |
| `9dc1daa` | 08-21 | **Full-bleed pass**: zero gutter on phones, 1500px container, bigger carousel/chapter/goal media, taller bands; **Lenis** smooth scroll; CIRQA colours switched to the official Garmin renders |
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
- **One build step, run manually**: `node build/gen-products.js` reads `deploy/catalog.js` in a `vm` sandbox (exposing a fake `window`) and writes the ten product pages. This exists because `vercel.json` declares `buildCommand: null` — the generated files must be committed.

```bash
node build/gen-products.js
```

**Run it after any change to `catalog.js`, or to the nav/footer/band templates inside `gen-products.js`.** Forgetting leaves the ten product pages stale, and nothing warns you.

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
top bar (scrolling) → floating nav (Tienda / Wearables / Suplementos) → full-bleed hero, two centred CTAs **Suplementos** and **Wearables** linking to the aisle *pages* → **Los más buscados** carousel (`#mas-buscados`, everything but the two extra watches) → **goal assistant** (`#objetivo`, moved up here on 2026-08-23) → Wearables video band (`#wearables`) → **wearables carousel** (`#wear-grid`, the four Garmin) → **Garmin Connect chapter** (editorial) → Suplementos video band (`#suplementos`) → **supplements carousel** (`#sup-grid`) → "Wellness, in one shot." (Cymbiotika, editorial flip) → closing banner → footer → buy dock.

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
| `.shots` | `/wearables` | Lifestyle triptych: three 4:5 photos, a snapping track below 760px and a three-column grid above. Added 2026-08-21 with the Garmin usage photography |
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
- `--gutter` — **`0` at every width since 2026-08-22.** It used to hold the grey canvas around the white card; the card is gone (no max-width, no radius, no shadow on `.shell` or `footer`), so the site touches all four edges. The token stays because the bands, the closing banner and the hero still compute against it — zeroing them one by one would buy nothing and make a rollback impossible.
- `--media-box` — the shared 9/16 box, `clamp(260px,25vw,380px)`: editorial chapter media **and** goal cards. Keep them equal.
- `--dock-h` — buy dock height; `body { padding-bottom }` reserves it.
- `--nav-h` — nav pill height; doubles below 1024px.
- `--topbar-h` — scrolling top bar (static `34px`), offsets the nav, the shell, and every scroll anchor.

`body.has-hero` (static in `index.html`) decides whether the shell starts under the nav or lets the hero run beneath it.

### Hero
Full-bleed, `object-fit: cover`. **Two video loops, one per format** — since 2026-08-22 the desktop side is a video too, not a photo:
- **Above 760px**: `hero-desktop.mp4` (`736×414`, 6.26 s, 24 fps, no audio track, 416 kB), `.hero-loop-desktop`, cropped `center`. It replaced `hero-runners.jpg`, which carried the wordmark and the tagline **baked in**. The video does not carry them, so they came back as HTML in `.hero-mark` — a `position:absolute; inset:0` flex column, optically centred, `pointer-events:none`, `display:flex` **only** above 760px. It reuses the `.hero-full .wordmark` / `.wordmark-sub` rules that had been dead CSS since the wordmark was baked in.
- The source is only 736 px wide, so it is **upscaled 2×–3.4×** depending on the screen. Its dark grading and shallow depth of field hide most of it, but that is the ceiling: a higher-resolution master is the only way to raise it.
- **Below 760px the hero is a full-screen video**: `hero-mobile.mp4` (720×1280, wordmark baked in by the owner), `height:100dvh` with `100svh` as fallback so it follows the address bar on recent phones. It escapes the card's gutter with `margin-inline:-gutter`, and `body.has-hero .shell` drops its top margin, its top radius and its clipping to let it through — the rest of the card keeps its gutter and corners. The 9/16 video is wider than a phone screen, so `cover` trims the sides; the wordmark is centred and survives.
- **`.hero-mark` is hidden below 760px on purpose**: the mobile loop still has its own wordmark baked in, and showing the HTML one would double it.
- **Hero order since 2026-08-23**: wordmark, then the two CTAs, then the tagline. The CTAs used to sit under it; they are what the visitor came for, the tagline is only a signature. `.hero-mark` now carries the wordmark alone, `.wordmark-sub` has left the hero, and `.hero-tagline` carries the tagline at **both** breakpoints, taking over `.wordmark-sub`'s scale above 760px. The bottom reserve grew from 18 to 30px: the tagline is what skirts the dock now, and 18 left only 6.
- `hero-runners.jpg` (1366×768) and `hero-runners-mobile.jpg` (384×768) are the previous desktop visual and its mobile crop — kept, referenced by nothing.
- **Neither loop has `autoplay` or `poster`** — both trigger a download even when the element is `display:none`, and each format would pay for the other's video. `section-loops` starts playback on intersection (a `display:none` element never intersects, so the hidden loop is never even fetched) and each poster is a CSS background declared next to its loop.
- Above 760px the two CTAs are **centred** (`.hero-full-inner{align-items:center}`) and stay anchored to the bottom of the hero; `.hero-mark` sits in the middle, above them.

### Responsive breakpoints
| Width | What changes |
|-------|--------------|
| `640px` | Top bar text shrinks to stay on one line |
| `719/720px` | Media caps kick in; grids go 2-per-row; `Ver más` clamping activates |
| `759/760px` | Hero switches from the desktop image to the **full-screen video**; hero CTAs stop being centred |
| `899/900px` | Chapters and floating grids go multi-column; carousel arrows appear (when the track actually scrolls); editorial chapters take their desktop form; home carousels get their bounded, centred track |
| `980px` | Product page splits into gallery + buy rail |
| `1023/1024px` | Nav collapses to two rows; the first Tienda aisle and the aisle-page header take their tall `padding-top` to clear the floating pill |

## 7. Catalogue and Shopify

`deploy/catalog.js` exports `window.LOWLABS` with `products`, `goals`, `categories`, and the helpers `byHandle`, `byGoal`, `inCategory`, `money`, `url`, **`variantOf`** and **`priceOf`**. It is the only place prices, images, specs and variant IDs live.

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
| `absorption-sleep` | The Absorption Company Sleep — 7 / 14 sticks or 28 doses | 499 / 899 / 1,599 | — | $24 US (7 sticks) | ❌ |
| `banda-cirqa` | Banda CIRQA™ de repuesto — 3 colours × 2 sizes | 1,099 | — | MSRP MX | ❌ |

Supplement prices are the brands' **one-time** (non-subscription) prices converted at the rounded rate used since the first Promix pair (≈ ×20.6). **The 899 and 1,599 of the two larger Sleep formats are lowlabs estimates** computed from the price per stick, approved by the owner on 2026-08-21 — they are not the brand's own prices, so check them against The Absorption Company before a launch. The dock's floor is **"Desde $499 MXN"** and its count **10 productos** — both are hand-written in `index.html` and `tienda.html`.

**Three shapes of variant table.** `shopify.variant` (single), `shopify.variants[value]` (one option), `shopify.variants[colour][size]` (two options). `variantOf()` resolves all three and falls back to the single variant rather than to nothing. An option may also carry `price` (Sleep's formats); `priceOf()` resolves it and `syncPrice()` in `app.js` repaints the price, the struck-through price, the dock and the button label. `sizeLabel` renames the second option ("Formato" on Sleep).

**The option drives the gallery.** Colour when the product has colours, otherwise the size — Sleep's three boxes look nothing alike, so picking a format has to change the photo. Frames carry `data-color` **or** `data-size` and `showFrame(attr, value)` scrolls the track to the first match; a gallery thumb sets whichever option it carries.

**Several views per option.** `colors[i].image` (or `sizes[i].image`) is the main one, `views[]` the others; every one of them carries the option value, so the picker lands on the first and a swipe walks the rest before reaching the next value. CIRQA and Venu 4 carry three views per colour (three-quarter, sensor, profile); Sleep's 28-dose format carries two.

**Media fields on a product**

| Field | Effect |
|-------|--------|
| `image` / `hero` | The still. Used by the PDP stage, the `.prod` card and the recommendation block when no loop exists. |
| `video` + `poster` + `videoRatio` (`"portrait"` \| `"wide"`) | The loop replaces the packshot on the PDP stage, in the editorial chapter, and — for `category: "Suplementos"` only — inside the floating carousels. `creatina` and `promix-debloat` declare one. |
| `packshot` | The cut-out used wherever products float without a frame — the home carousels **and every Tienda card**, both through `flyMedia()`, which reads `packshot` before `image`. Without it a product shows a visible rectangle in the carousels. An alpha channel is not enough: the PNG must be *genuinely* cut out. `absorption-sleep.png` had alpha but 76% of its surface was an opaque white rectangle, so the card's `drop-shadow` — which traces alpha — drew the shadow of a box. |

### Store
| Setting | Value |
|---------|-------|
| Store URL | `https://jx8irc-px.myshopify.com` |
| Product handle | `garmin-cirqa-smart-band` |
| Store ID | `1026/1721/9449` |
| CDN base | `https://cdn.shopify.com/s/files/1/1026/1721/9449/files/` |

### Variant IDs created on 2026-08-21
| Product | Option | Variant |
|---------|--------|---------|
| Venu 4 | Crema | 64212128956793 *(was the Default Title variant — id preserved)* |
| Venu 4 | Gris Taupe | 64326127550841 |
| Venu 4 | Negro | 64326127583609 |
| Sleep | 7 sticks | 64212136624505 *(was the Default Title variant — id preserved)* |
| Sleep | 14 sticks | 64326122668409 |
| Sleep | 28 dosis | 64326122701177 |
| Banda de repuesto | Gris Lima S–M / L–XL | 64326134333817 / 64326134366585 |
| Banda de repuesto | Oliva Oscuro S–M / L–XL | 64326134399353 / 64326134432121 |
| Banda de repuesto | Azul Francés S–M / L–XL | 64326134464889 / 64326134497657 |

Every variant now carries its own image in Shopify (`productVariantsBulkUpdate` with a `mediaId`), so the checkout shows the colour or format the customer picked. On the CIRQA the four official renders were **added alongside** the older store photos rather than replacing them — the duplicates are harmless but can be tidied from the admin.

Both option creations used `productOptionUpdate` with `variantStrategy: LEAVE_AS_IS`, which renames the existing `Title / Default Title` option in place: **the original variant IDs survived**, so no checkout link broke. The band product is `gid://shopify/Product/15731159859577`, handle `banda-cirqa-repuesto` (Shopify's auto-handle carried a ™ and was rewritten).

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

`shotFit` does a second, less obvious thing: `.gal-stage:has(.gal-frame.contain)` turns the frame white. Without the flag the frame keeps `--surface-teal`, and a transparent packshot sits on a grey plate — which reads as a background stuck to the product. That was Debloat until 2026-08-22: its PNG was already cut out, the grey came from the page. **Any product whose main visual is a cut-out must declare `shotFit: "contain"`.**

### Aisle headers reach the top of the screen
Until 2026-08-22 `/wearables` and `/suplementos` fell into `body:not(.has-hero) .shell` and reserved `env(safe-area-inset-top) + 110px` of nav below 1024px. Measured at 375×812: the video started at y=120 and stopped at 601px (74vh) — a dead ink band above it, and a video cropped at both ends, with the CTA sliding under the dock. whoop.com does the opposite: their hero starts at y=0 and the header sits *on* it.

`body.has-dark-top .shell{margin-top:0}` fixes both ends at once, and below 1024px `.cat-head .band-inner` takes `100dvh` (`100svh` fallback). Now measured 0 → 812, nav floating over it, CTA clearing the dock by 24px.

Two consequences, do not undo them:
- **The top of the veil is gone**, here and on the hero — see below. `.cat-head .band.deep::after` keeps only its bottom floor.
- **`.band-inner`'s bottom padding counts the dock** — at `100dvh` with bottom-aligned content the button was sliding under it.

### Asset fingerprints — why a correct deploy can stay invisible
Pages used to reference `/styles.css` and `/app.js` bare. The headers say `max-age=0, must-revalidate`, but iOS Safari happily reserves its own copy without hitting the network, especially in a tab left open. On 2026-08-22 three correct deployments in a row stayed invisible on an iPhone for that reason alone — the site was right, the phone was looking at something else.

`build/stamp-assets.js` (chained after `gen-products.js` in `npm run build`) stamps `?v=<sha1[0:8]>` on `styles.css`, `app.js`, `catalog.js`, `cart.js` and `lenis.min.js` across all 14 pages. A different URL is a different cache entry, so the address changes whenever the content does. The script is idempotent — re-running replaces the fingerprint rather than stacking it. Product pages are regenerated unstamped by `gen-products.js` and re-stamped every build; that is why the second half always reports the 10 product pages as touched.

**Run `npm run build` after touching `styles.css` or `app.js`, not only `catalog.js`** — otherwise the stamp goes stale and the old cache problem returns.

### The top of the video is no longer veiled
The nav has no surface of its own, so its ink was made readable by a **42% white veil** over the hero's first 30% (`.hero-full::before`). Over a dark, flat video it was invisible. Over a video with bright areas at the top — the wooden ceiling on the wearables loop — it flattened the first ~250px into a uniform band: the page no longer read as a video starting at the top of the screen, but as **an empty area sitting above one**.

Removed from both on 2026-08-22. Only the bottom floors remain, under the copy. The nav's contrast is carried by **the pill itself** while it floats over the opening visual: `body:not(.past-hero) .nav-pill` takes a white `.34 → .26` surface plus a rim. The contrast now plays out over the header's 350px instead of the image's first 250. The pill is a header and is allowed a surface — the reference, whoop.com, has a fully opaque one. On a page with no opening visual, `past-hero` is set on load and the pill keeps its original transparency; over white content it needs nothing. A .3s transition softens the switch. The `prefers-reduced-transparency` block restates the rule at equal specificity, otherwise the opening-visual rule would win and hand a translucent pill to someone who asked for the opposite.

**`past-hero` now covers the aisles.** The module only knew `#hero`, so both aisle pages got the class on load: the dock resampled the banner's background permanently — exactly what `body:not(.past-hero) .dock-shell` exists to avoid — and the pill had no way to know it was floating over video. It now takes `#hero` **or** `.cat-head`, and measures the top edge of whatever follows (`#contenido` or `.cat-list`); neither is sticky, so the measurement stays valid where the pinned hero no longer reports where it ends.

Desktop was already correct (top margin resolves to 0 above 1024px, `padding-top` clears the nav) and is untouched; the aisle banner stays at 74vh there, not full height.

### Sheet scroll — the hero does not scroll
Taken from **whoop.com** on 2026-08-22, on both breakpoints. The hero stays pinned to the top of the window and the content rises **over** it like an opaque sheet. Three rules:

```
body.has-hero .hero-full, body.has-dark-top .cat-head    position:sticky; top:0; z-index:0
body.has-hero #contenido, body.has-dark-top #contenido   position:relative; z-index:1; background:var(--surface)
…same selector pair for the .past-hero release           position:relative
```

It covers **all three pages that open on a visual** — the home and both aisles (since 2026-08-22). **Half the setup is in the HTML**: the opening visual sits OUTSIDE `<main>`, as its sibling inside `.shell`. That was always true of the home hero; the aisle banners used to be the first `<section>` *inside* `main`. Without moving them, the content would be their sibling inside `main` and every following section would need its own opaque background so none let the pinned banner show through. A `<header class="cat-head">` lifted out of `main` settles it in one move. No CSS rule depended on `.cat-head` being inside `main` — checked before moving it.

Whoop's markup is the same shape — a `sticky top:0 z-index:0` wrapper under opaque modules, released once passed. **What they do differently**: no scroll library at all (native scroll, `scroll-behavior:auto`, no Lenis/GSAP/Locomotive) and **no entry reveals** (every `module-content` sits at `opacity:1`). lowlabs keeps Lenis and `.rv`, so the gesture matches but the feel stays glossier than theirs.

`.shell` already carries `isolation:isolate`, so this `z-index` never escapes the card — the footer, which sits outside `.shell`, is unaffected. The third rule is not cosmetic: without it the hero stays composited and its video keeps playing behind the whole page. At the switchover it is fully covered, so the change is invisible.

### Thumbnail strip
`dragScroll()` (app.js) makes `.gal-thumbs` drag-scrollable. It already scrolled — `overflow-x:auto` — but at 48px tall on a phone the browser had to decide within the first few pixels whether a gesture belonged to the track or to the page's vertical scroll, and on a band that thin it almost always chose the page. The `draggable` class, set **by the script and never in the HTML**, applies `touch-action:pan-y`: vertical stays with the browser, horizontal comes to us. Without `PointerEvent` the class is not set and the track keeps native scrolling. A drag over 4px swallows the click that follows it, otherwise letting go would change thumbnail. `galFollow()` centres the active thumb whenever the main image changes — before it, reaching image 12 by side-swipe left the strip showing the first six.

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

**The cards are deliberately the same box as the Garmin Connect chapter loop** — `aspect-ratio:9/16`, `flex:0 0 clamp(230px,68vw,var(--media-box))` — and the track scrolls at **every** width, not just on mobile. Above 900px the three fit and the track centres itself; on a phone one card reads whole and the next peeks by about a third, which is what says it slides.

### The open state — rewritten 2026-08-24

Opening a goal no longer lays a recommendation **under** the three cards: it **removes the other two and takes their place**. Everything hangs off one wrapper, `.goals-stage`, whose box never changes width:

```
max-width: min(calc(var(--media-box) * 3 + var(--goals-gap) * 2), 100%)
```

That is exactly three cards plus two gutters, so the closed track and the open pair occupy the **same rectangle**. Two consequences worth keeping: the chosen card lands precisely where card 1 was (measured at 1440px: card 3 travels 918 → 162, the panel occupies 540 → 1278, which is card 2's left edge to card 3's right edge), and the page does not have to move when a goal is chosen.

| Piece | Closed | Open |
|-------|--------|------|
| `.goals` | `flex:1 1 auto`, scrolls, snaps | `flex:0 0 auto`, `overflow:visible`, no snap, no bottom padding |
| `.goal` × 2 | in the row | `.is-leaving` (240 ms, 40 ms stagger, outward), then `hidden` |
| `.goal` chosen | — | FLIP to card 1's slot (400 ms) — or folds to a 92 px banner below 720px |
| `.reco-wrap` | `display:none` | `display:flex`, fills the vacated rectangle |
| `.card-dots` | shown when the track overflows | hidden via `.goals-stage.is-open + .card-dots` |

**Semantics changed with the gesture.** The cards were `role="radio"` in a `radiogroup` with roving tabindex; the act is no longer "tick one of three" but "open one of three", so they are now plain buttons carrying `aria-expanded` / `aria-controls="reco"`. Arrow keys therefore only **move focus** — they used to select, which would now fire three panel openings just to cross the track. Enter/Space opens, Escape closes and returns focus to the card.

**Four ways back**, all landing in the same `closeGoal()`: the `← Volver a los objetivos` link above the panel, Escape, a click anywhere outside `.goals-stage`, and clicking the open card itself (it is a disclosure button, it toggles).

**The URL carries the choice** — `#objetivo=dormir` via `replaceState`, so a link is shareable and a campaign can land straight on one goal, without a visitor who tries all three needing four presses of Back to leave the site. On a direct landing the module takes `history.scrollRestoration` to `manual` for that load (the browser restores the previous scroll position **after** the first settle, which would otherwise swallow it) and hands it back on `load`.

**Motion tokens** live on `.goals-stage`: `--goals-gap: clamp(10px,1.6vw,18px)` and `--goals-ease: cubic-bezier(.22,1,.36,1)`. The return is deliberately shorter than the outbound trip — 160 + 260 ms against 280 + 400 ms.

## 9. `app.js` — 17 modules

Every module runs inside `module(name, fn)`, a try/catch wrapper. This is not decorative: `.rv` elements start at `opacity: 0`, so before the wrapper existed one uncaught error could leave **the entire page invisible**. The reveal module also has a 4-second failsafe.

| Module | Role |
|--------|------|
| `smooth-scroll` | Creates the page's single Lenis instance and exposes `LOWSCROLL` (see section 11). Returns immediately under `prefers-reduced-motion` |
| `catalog` | Renders the framed grids from `productCard()` (`[data-exclude]`, `[data-handles]`, `[data-category]`) **and** the floating tracks from `flyCard()` (`.fcards[data-handles]`) |
| `cat-sort` | The aisle pages' sort chips. **Moves** the existing card nodes rather than re-rendering — a re-render would drop the observer that pauses product loops off-screen and restart every video |
| `shop` | Builds `/tienda` aisles — one carousel per category, then **re-lands the URL fragment**: the aisles are born in JS, so the browser's own jump to `#wearables` fired on an anchor that did not exist yet. It re-lands on every layout shake (fonts, images, arrows folding) until a real gesture — wheel, touch, key, pointer — says the reader has taken over |
| `goals` | The assistant. Disclosure buttons (`aria-expanded`), open/close choreography, recommendation rendering, `#objetivo=<id>` in the URL. All the animation is **declared in CSS** (`.is-leaving`, `.is-open`, `.is-in`, `.is-coming`, `.is-folding`) and only **triggered** here; the sole thing JS computes is the FLIP, which needs real measurements — `travel()` above 720px (position changes, size does not), `fold()` below (size changes, position does not). Landing is `settle()`: it aligns the **section** so the question stays readable above its answer, falls back to the stage alone when the section will not fit, and **does nothing when the stage is already fully in view** — since the stage keeps the same box open and closed, there is usually nothing to catch up. 1.1 s, quintic ease-out, `focus({preventScroll:true})` first to kill the browser's instant jump. |
| `reveal` | `.rv` scroll reveal + failsafes |
| `hero-video` | Autoplay/pause logic — **currently inert**, the hero is a still image |
| `section-loops` | `data-autoloop` videos: play in view, pause out of view and on tab hide |
| `past-hero` | Toggles `body.past-hero`. **No longer an IntersectionObserver**: with the sheet scroll the hero is sticky and never leaves the viewport, so it can't be observed. The marker is now the top edge of `#contenido` (which begins exactly where the hero ends), read by position comparison — a root shrunk to a line does not notify reliably, and a sentinel small enough to be precise gets skipped by a fast fling. No new loop: Lenis already runs one and publishes its position; without Lenis (reduced motion) a passive `scroll` listener takes over. `sync()` reads no layout — the threshold is measured separately, on load and on resize. |
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
│   ├── cirqa/              cirqa-malva-packshot.png (carrousels + tienda),
│   │                       cirqa-packshot.png (Negra, retiré), 4 coloris ×3 vues,
│   │                       hero-cirqa.mp4 + poster
│   ├── venu-4/  venu-3s/  vivoactive-6/     packshots (mix-blend-mode: multiply)
│   ├── creatina/           creatina.png, sup-creatina.mp4 + poster
│   ├── promix-creatina/    promix-creatine-sticks.png
│   ├── promix-debloat/     promix-debloat.png, debloat-loop.mp4 + poster
│   ├── promix-relax/       promix-relax.png
│   └── absorption-sleep/   absorption-sleep.png
├── landing/
│   ├── hero/               hero-desktop.mp4 + poster-hero-desktop.jpg,
│   │                       hero-mobile.mp4 + poster-hero-mobile.jpg,
│   │                       hero-runners.jpg + hero-runners-mobile.jpg (retirés)
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
- **Do not upscale `hero-desktop.mp4`** — the source is 736×414 and already stretched 2×–3.4× by `cover`. Re-encoding it larger adds bytes, not detail; only a higher-resolution master helps.
- **Do not remove `outputDirectory: "deploy"`** from `vercel.json`.
- **Do not open a second Lenis instance, a second `requestAnimationFrame` loop, or add another scroll/animation library.** One instance, `autoRaf`, and the reveals stay on `IntersectionObserver`.
- **Do not call `window.scrollTo` directly** in `app.js` — use `scrollToY()`, or `LOWSCROLL` from another file.
- **Do not hand-edit `deploy/lenis.min.js`** — it is a copy; run `npm run vendor:lenis`.
- **Keep all customer-facing copy in Spanish** (es-MX).
- **Preserve accessibility**: skip link, ARIA radiogroups with roving tabindex (product colour/size — the goal cards are disclosure buttons, see §8), `sr-only` price context, ≥44px tap targets, `prefers-reduced-motion` fallbacks.

### Adding a product
1. Append an entry to `PRODUCTS` in `deploy/catalog.js` (`handle`, `name`, `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`, `specs`; optional `badge`, `compareAt`, `colors`, `sizes`, `shopify`, `packshot`, `video`, `poster`, `videoRatio`, `story`).
2. Put its optimised visuals in `deploy/media/productos/<handle>/` and its sources in `assets/<handle>/`. For a carousel it needs a **cut-out** (`packshot`).
3. Run `node build/gen-products.js`.
4. Add it to a carousel by hand: `data-handles` on `#cards`, `#wear-grid` and `#sup-grid` in `index.html`. The Tienda aisles **and both aisle pages** pick it up automatically from its `category` — nothing to touch there.
5. Editorial chapters are hand-written — only cards and aisles are generated.
6. Update the dock in `index.html` and `tienda.html`: "N productos" and the "Desde $X MXN" floor. (The aisle pages' dock shows shipping and warranty, not a count, so it needs nothing.)
