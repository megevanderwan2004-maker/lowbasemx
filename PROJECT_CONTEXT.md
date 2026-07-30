# PROJECT_CONTEXT.md

> Last updated: 2026-07-29
> Purpose: Give a future Claude Code session (or human contributor) everything needed to continue this project without prior conversation context.

---

## 1. Project overview

**Lowlabs** is a Mexican reseller of Garmin products, working directly with Garmin at reseller pricing. The first product is the **Garmin CIRQA Smart Band**, a screenless fitness band launched July 21, 2026.

This repository contains a **single-product landing page** targeting the Mexican market (content in Spanish, prices in MXN). The page is designed to drive purchases through a Shopify checkout flow.

The brand positioning is "curated wellness and technology" — premium wellness editorial, not sporty gadget.

The main competitor is **DelMaz** (delmaz.mx), the official Garmin distributor in Mexico for 18 years. Lowlabs differentiates on price ($3,999 vs $4,199 MSRP), a simpler single-product purchase experience, and brand aesthetics.

## 2. Current state

The landing page is **fully built and functional**. A Shopify store exists at `jx8irc-px.myshopify.com` with the product created and all 8 variants (4 colors x 2 sizes) configured. All images have been uploaded to the Shopify CDN and are served from there.

Three output variants of the page exist in the repo (see section 5). **`deploy/` is canonical** — it was fully rewritten (2026-07-30) to an editorial premium layout with a "liquid glass" UI system. `site/` and `shopify-theme/` are now substantially behind and should be regenerated from `deploy/` if they are ever needed.

`deploy/` is deployed to Vercel as a static site. `vercel.json` at the repo root pins `outputDirectory: "deploy"` — this is deliberate and load-bearing: it keeps `assets/` and `assets-hd/` off the public website (see the warning in section 8).

**Not yet resolved** (from `CLAUDE.md`, section "Ce qui manque encore"):
- Final Lowlabs sale price — currently shown as $3,999 MXN, but this may not be confirmed
- Sales model — currently uses a redirect to Shopify product page (not a full embedded checkout)
- Custom domain — not configured; the Shopify store uses the default `jx8irc-px.myshopify.com` subdomain
- Product video — the hero uses the official Garmin promotional film from the Shopify CDN. Its only rendition is **848x480**, which is the binding constraint on the hero treatment (see section 6). A higher-resolution custom video is still wanted.

## 3. Project structure

```
lowlabs-cirqa-context/
├── CLAUDE.md                  # Project instructions for Claude Code (product specs, brand, competition)
├── PROJECT_CONTEXT.md         # This file
├── .gitignore                 # Excludes .DS_Store, *.zip, zi5VaVFL, node_modules/
├── .claude/
│   ├── launch.json            # Dev server config (python3 http.server on port 4173, serves site/)
│   └── skills/                # Claude Code skills (design, brand, UI — not project-specific code)
│
├── deploy/                    # ★ LATEST VERSION — static landing page (3 separate files)
│   ├── index.html             # Full HTML with structured data, all sections
│   ├── styles.css             # All CSS (310 lines, custom properties, responsive)
│   └── app.js                 # All JS (199 lines, checkout, color picker, carousel, video)
│
├── site/                      # Self-contained version — single HTML file with everything inlined
│   └── index.html             # ~63 KB, all CSS and JS embedded; older hero design (full-bleed photo)
│
├── shopify-theme/             # Shopify Liquid theme version
│   ├── layout/cirqa.liquid    # Custom layout (bypasses default theme header/footer)
│   ├── templates/page.cirqa.liquid  # Full page template with Liquid data bindings
│   ├── assets/cirqa.css       # Theme CSS (same design system, adapted for Liquid)
│   ├── assets/cirqa.js        # Theme JS (reads variant data from window.CIRQA set by Liquid)
│   ├── _body.html             # Static HTML reference of the page body
│   └── _body_liquid.html      # Liquid-converted version of the body (reference/diff file)
│
├── assets/                    # Original uploads from the conversation (UUID filenames, ~30 MB)
│   ├── 83713503-*.pdf         # Official Garmin product sheet (5 pages, Spanish, confidential reseller info)
│   ├── 9dc5812d-*.pdf         # Second PDF (larger, ~24 MB — likely the full brand/product deck)
│   └── *.jpeg, *.png          # ~21 product and lifestyle photos
│
├── assets-hd/                 # Processed/organized HD assets (~59 MB)
│   ├── cdn/                   # Named copies of images uploaded to Shopify CDN (human-readable names)
│   ├── shopify/               # Product images formatted for Shopify admin upload
│   ├── frames/                # Video frames extracted from garmin-video.mp4 (for scroll animation or poster)
│   ├── garmin-video.mp4       # Garmin promotional video file
│   ├── lineup-alpha.png       # Product lineup with transparent background
│   ├── cdn-urls.json          # Maps image names → final Shopify CDN URLs (the source of truth for URLs)
│   ├── resource_urls.json     # Maps image names → Shopify staged upload URLs (temporary, used during upload)
│   └── brand-*, garmin-*      # Raw extracted images from Garmin/brand PDFs (various resolutions)
│
├── lowlabs-cirqa-context.zip  # Archive of original project files (~30 MB, excluded from git)
└── zi5VaVFL                   # Duplicate of the zip (~30 MB, excluded from git)
```

## 4. Technology stack

- **No build step, no framework.** Pure vanilla HTML, CSS, and JavaScript (ES5-compatible, runs in all modern browsers).
- **Shopify** for e-commerce: product management, variant inventory, checkout, and CDN for images/video. The store ID is `1026/1721/9449`.
- **Shopify Liquid** used only in the `shopify-theme/` variant for dynamic pricing and variant data.
- **Google Fonts**: Outfit (display/headings) and DM Sans (body text), loaded via `fonts.googleapis.com`. These are web-safe substitutes for the brand fonts Codec Pro and Canva Sans.
- **No npm, no package.json, no node_modules.** The dev server is a simple Python HTTP server.

## 5. Three output variants and their differences

### `deploy/` — Canonical version
- Three separate files: `index.html`, `styles.css`, `app.js`
- Page sits as a rounded white `.shell` card on a light-gray canvas (`--canvas`)
- **Hero**: full-bleed autoplaying, muted, looping Garmin film with no click-to-play gate. A small corner pause button exists solely to satisfy WCAG 2.2.2
- **Floating glass nav** with the wordmark centered via a `1fr auto 1fr` grid, and a **permanently visible bottom buy dock** — both fixed, both direct children of `<body>`
- **Section order**: hero → claims ticker → 5-card chip carousel → editorial statement with inline circular thumbs → 2-up feature cards with glass data widgets → liquid-glass variant rail → comparison table → FAQ → closing banner → footer
- Hardcoded Shopify variant IDs in `app.js` — checkout redirects to the Shopify product page with pre-selected variant
- Checkout URL pattern: `https://jx8irc-px.myshopify.com/products/garmin-cirqa-smart-band?variant={ID}&locale=es&country=MX`

### `site/` — Self-contained single file
- Everything inlined in one 63 KB HTML file
- **Hero**: full-bleed lifestyle photo with dark overlay (different visual approach)
- Uses class names like `.btn-primary`, `.btn-liquid`, `.btn-ghost` (older naming convention)
- Same content sections but slightly different styling and copy
- No separate video section

### `shopify-theme/` — Liquid theme files
- Designed to be installed on the Shopify store as a custom page template
- `cirqa.liquid` layout bypasses the default theme, rendering a standalone page
- `page.cirqa.liquid` template pulls product data via `all_products['garmin-cirqa-smart-band']`
- Prices, variant IDs, and availability come from Shopify admin (not hardcoded)
- Comparison table features are encoded as a Liquid string (`"Detección automática de actividades;001|VO2 max;111|..."`)
- JS reads `window.CIRQA` object injected by Liquid at the bottom of the template
- Button classes match `site/` version (`.btn-liquid`, `.btn-primary`) — NOT the `deploy/` version

**Key divergence**: `deploy/` has evolved past both `site/` and `shopify-theme/` in design polish. If making changes, determine which variant is the target before editing.

## 6. Design system and branding

### Color palette (CSS custom properties)
| Variable | Value | Usage |
|----------|-------|-------|
| `--ink` | `#1e2e2d` | Primary text |
| `--ink-soft` | `#2f4443` | Secondary text |
| `--teal-700` | `#46605f` | Accent, links |
| `--teal-600` | `#5f7a79` | Lighter accent |
| `--teal-brand` | `#89a3a2` | Brand teal (from Lowlabs palette) |
| `--sand` | `#dec8a7` | Brand warm accent (from Lowlabs palette) |
| `--surface` | `#ffffff` | Background |
| `--surface-teal` | `#eef3f3` | Section backgrounds |
| `--surface-sand` | `#faf5ec` | Warm section backgrounds |
| `--cta` | `#24312f` | CTA button background, footer, announcement bar |

### Typography
- **Display/headings**: `'Outfit', 'Codec Pro', sans-serif` — weight 500/600/700, tight letter-spacing (-0.02em), tight line-height (1.12)
- **Body**: `'DM Sans', 'Canva Sans', sans-serif` — weight 400/500/600
- Fluid type with `clamp()`: h1 ranges from 2.6rem to 4.8rem, h2 from 1.75rem to 2.5rem

### The liquid-glass system (deploy/) — read this before touching any glass surface

Four rules are load-bearing. Breaking any of them fails silently, which is why they are written down:

1. **Real blur is rationed to three surfaces**: `.nav-pill`, `.dock-shell`, `.rail` (marked with `.blurred`). Everything else — every button, chip, rail item, size button, widget, `summary` — uses **fake glass**: `.glass-light` / `.glass-dark`, a gradient plus inset edge highlights. It is visually indistinguishable at component scale and costs nothing, because a backdrop must be re-sampled and re-blurred every frame the content behind it moves.
2. **Never put `var()` inside `-webkit-backdrop-filter`.** Safari ≤17 does not resolve custom properties there, so the glass vanishes on exactly the browsers that still need the prefix. The `@supports` block uses literal values for this reason.
3. **The tint alpha alone must carry text contrast** — never the blur. Dark glass ≥ `.70` alpha, light glass ≥ `.72`. Both are verified by compositing against pure white *and* pure black. Blur is decoration and can disappear (unsupported, reduced-transparency, or a backdrop root).
4. **Nothing with `opacity < 1`, `filter`, `mask`, `clip-path`, `mix-blend-mode`, or `will-change` may be an ancestor of a blurred surface** — each establishes a backdrop root and kills the descendant's blur. This is why `.rail` carries no `.rv` reveal class: animating its opacity would kill its own blur for the whole animation. `.shell` uses `position/z-index/isolation` (not a mask hack) to clip its rounded corners for the same reason.

Additionally, `backdrop-filter` is switched **off** on the nav and dock while the hero video plays behind them (`body:not(.past-hero)`), and switched on once the hero scrolls away. Over a dark-graded video a flat scrim and a blur look identical, and this removes the single most expensive compositing operation on the page.

### Button variants (deploy/)
- `.btn-ink` — near-opaque dark, the one primary CTA
- `.btn-smoke` — dark glass, white text; safe on video and photos because its alpha guarantees AA on any backdrop
- `.btn-quiet` — light glass, ink text, secondary actions
- `.btn-round` (48px), `.btn-sm`, `.btn-lg`, `.btn-block`

### Hero video constraints
The only rendition available is **848x480**. It is displayed up to ~1400 CSS px, roughly a 1.5x upscale. Upscaling cannot add information, so the treatment compensates instead of sharpening: `transform:scale(1.03)` crops the encoder-soft edge, a mild grade (`contrast(1.06) saturate(1.06) brightness(.94)`), a shaped top/bottom scrim plus vignette, and an inline-SVG `feTurbulence` grain at `.13` opacity that dithers 8-bit banding. **Never** add `filter:blur()` or `image-rendering` tweaks — both make it visibly worse.

### Responsive breakpoints
- `768px` — footer grid to 3-column
- `900px` — section heads and the 2-up duo go multi-column
- `980px` — the selector splits into stage + rail
- `1024px` — desktop nav links appear
- `1240px` — card carousel inset snaps to the container grid (via `--cards-inset`, applied to **both** `padding-left` and `scroll-padding-left` — without the latter, `scroll-snap-align:start` makes the browser scroll straight past the inset)

## 7. Shopify integration

| Setting | Value |
|---------|-------|
| Store URL | `https://jx8irc-px.myshopify.com` |
| Product handle | `garmin-cirqa-smart-band` |
| Store ID | `1026/1721/9449` |
| CDN base | `https://cdn.shopify.com/s/files/1/1026/1721/9449/files/` |

### Variant IDs (hardcoded in `deploy/app.js`)
| Color | S-M | L-XL |
|-------|-----|------|
| Negra | 64093481107833 | 64093481140601 |
| Gris Frances | 64093481173369 | 64093481206137 |
| Malva | 64093481238905 | 64093481271673 |
| Azul Capitan | 64093481304441 | 64093481337209 |

### Checkout flow
The "Comprar ahora" button does NOT use Shopify's AJAX cart API. Instead, it redirects the browser to:
```
{STORE}/products/{PRODUCT_HANDLE}?variant={VARIANT_ID}&locale=es&country=MX
```
The customer lands on the Shopify product page with their color and size pre-selected, then proceeds through Shopify's standard checkout.

### Contact
- Email: `lowlabsmx@gmail.com` (shown in FAQ and footer)

## 8. Asset organization

> ### ⚠️ The asset folders are committed to a PUBLIC GitHub repo
>
> `origin` is `github.com/megevanderwan2004-maker/lowbasemx`, which is **public**. `assets/` and `assets-hd/` are tracked, so everything in them is publicly downloadable — including `assets/83713503-*.pdf`, the official Garmin product sheet that `CLAUDE.md` describes as containing **confidential reseller pricing**, and `assets-hd/garmin-video.mp4`, Garmin-copyrighted footage.
>
> This predates the 2026-07-30 rewrite; it was not introduced by it. `vercel.json` pins `outputDirectory: "deploy"` so these files are at least not served from the production website — **do not remove that setting.**
>
> Remediating the GitHub exposure needs an explicit decision from the owner, because both options are disruptive: make the repo private, or `git rm --cached` the sensitive files, add them to `.gitignore`, and rewrite history (which invalidates every existing clone). Untracking without a history rewrite does **not** remove them — they stay reachable in past commits.

### `assets/` — Original uploads
Files have UUID filenames from the conversation upload. Key files:
- `83713503-323c-48e1-81af-bca8dfd3ce24.pdf` — Official Garmin CIRQA product sheet (5 pages, Spanish). Contains SKUs, UPCs, specs, and reseller pricing (confidential).
- `9dc5812d-76bb-4d35-881d-43f5744e6730.pdf` — Larger PDF (~24 MB), likely the full brand/product deck.
- ~21 JPEG/PNG photos: product shots, lifestyle images, Garmin Connect app screenshots.

### `assets-hd/` — Organized and named assets
- **`cdn/`** — Human-readable copies of every image uploaded to the Shopify CDN. Filenames match the CDN keys (e.g., `cirqa-negra.jpg`, `vida-running.jpg`, `app-body-battery.png`). These are the authoritative local copies.
- **`shopify/`** — Product images formatted for the Shopify product listing (6 images: lineup + 4 colors + detail).
- **`frames/`** — 15 PNG frames extracted from `garmin-video.mp4` at key moments (f0, f3, f6, ..., f79) plus the video thumbnail. Could be used for a scroll-driven animation.
- **`cdn-urls.json`** — Maps short names to final CDN URLs. This is the source of truth for all image URLs used in the HTML.
- **`resource_urls.json`** — Maps filenames to Shopify staged-upload URLs (temporary; used during the upload process, may expire).
- **`brand-*` and `garmin-*` PNGs** — Raw images extracted from the Garmin and brand PDFs at various resolutions. Naming convention: `{source}-p{page}-x{index}-{width}x{height}.png`.

## 9. Key interactive features

`app.js` is organised as independent modules, each run through a `module(name, fn)` try/catch wrapper. This matters: `.rv` elements start at `opacity: 0`, so an uncaught error anywhere used to be able to leave the **entire page invisible**. The reveal module is therefore initialised first, and isolated failures now only disable their own feature.

1. **Hero video** — autoplay, muted, loop, `playsinline`, no click-to-play gate. `muted` is set as both the HTML attribute and the IDL property before `play()`, because the autoplay gate reads the property and the attribute alone only seeds `defaultMuted` after element creation. The poster is a sibling `<img>` in the same box as the video, so a rejected `play()` (iOS Low Power Mode, "never autoplay") cross-fades to a complete still with zero layout shift. Pauses off-screen and when the tab is hidden via `pause()` only — never `load()` or `currentTime = 0`, which would re-run resource selection and break the loop.

2. **Pause toggle** — a small glass round button in the hero corner. Required by WCAG 2.2.2 (any auto-starting motion over 5s must be pausable). It doubles as the manual play control when autoplay is blocked. An `intentionalPause` flag distinguishes deliberate pauses (button, off-screen, hidden tab) from browser-imposed ones so the icon never disagrees with the real state.

3. **Liquid-glass variant rail** — 4 colour cards + 2 size chips as a radiogroup with roving tabindex and arrow-key navigation. Selection drives the stage image (150ms opacity fade), the dock label, and the checkout variant ID. The active state is carried by a ring **and** a checkmark, never colour alone.

4. **Persistent buy dock** — fixed, always visible at every scroll position and breakpoint. Its height is measured into `--dock-h` on load, resize, orientationchange, and `document.fonts.ready`; `body { padding-bottom }` reserves that space so the footer always scrolls clear, and the hero's bottom padding clears it too. The reserve is constant so showing/hiding can never jump the scroll position.

5. **Chip card carousel** — horizontal scroll-snap row of 5 cards with glass arrows on desktop.

6. **Comparison table** — CIRQA vs Venu 4 vs Vivoactive 6. Horizontally scrollable, sticky first column, CIRQA column highlighted with `--surface-sand`.

7. **FAQ accordion** — 9 native `<details>`/`<summary>`; the summary is itself a glass surface. Animated `+` rotates 45° on open.

8. **Scroll reveal** — `.rv` elements fade/translate in on intersection with staggered delays. Two failsafes: no `IntersectionObserver` reveals everything immediately, and if the observer exists but has never fired after 4s, everything is revealed anyway.

9. **Accessibility** — skip link, ARIA radiogroups with roving tabindex, `sr-only` price context, focus rings that switch to white over media, all-glass tap targets ≥44px, and no text below 12px.

## 10. SEO and structured data

- **JSON-LD** `Product` schema with: name, brand, description, image, SKU (`010-04675-10`), GTIN-12 (`753759375331`), price ($3,999 MXN), availability (InStock), free shipping to Mexico, seller (lowlabs), price valid until 2026-12-31.
- **Open Graph** tags: title, description, product image, type=product, locale=es_MX.
- **Meta description** in Spanish mentioning key selling points.
- **Semantic HTML**: `<nav>`, `<header>`, `<main>`, `<section>` with `aria-labelledby`, `<footer>`, `<article>` for cards.
- **SVG favicon**: inline data URI showing "ll" in sand color on dark teal background.

## 11. How to run locally

The dev server is configured in `.claude/launch.json`:

```bash
python3 -m http.server 4173 --directory site
```

This serves the `site/` version at `http://localhost:4173`.

To preview the `deploy/` version instead:
```bash
python3 -m http.server 4173 --directory deploy
```

The `shopify-theme/` version cannot be previewed locally — it requires Shopify's Liquid rendering engine. It can be previewed via the Shopify admin theme editor or Shopify CLI.

Note: all images are loaded from the Shopify CDN, so an internet connection is required for full visual rendering.

## 12. Deployment

**Current deployment status is unknown.** No deployment configuration files (e.g., `vercel.json`, `netlify.toml`) exist in the project. The Vercel MCP connector is available in the Claude Code environment, suggesting Vercel may be the intended deployment target.

The `deploy/` directory contains the production-ready static files (3 files, no build step needed). Any static hosting service can serve it directly.

The Shopify theme files would be deployed separately via the Shopify admin or Shopify CLI (`shopify theme push`).

## 13. Open questions and unfinished work

From `CLAUDE.md` ("Ce qui manque encore"):
1. **Final sale price** — Currently $3,999 MXN everywhere in the code. The MSRP is $4,199. Confirm this is the intended price.
2. **Sales model** — Currently redirects to Shopify product page. No embedded checkout, no WhatsApp flow, no lead capture form.
3. **Custom domain** — Not configured. Store uses `jx8irc-px.myshopify.com`.
4. **Custom hero video** — Mentioned as desired but not provided. The Garmin promo video is embedded in a separate section.
5. **Shopify vs static** — Both exist. Unclear which is the primary deployment target.

Observations from the code:
- **`site/` and `deploy/` have diverged** — different hero designs, different button class names, different feature sets (video section only in deploy/). They need to be reconciled or one should be designated as canonical.
- **No analytics** — No Google Analytics, Meta Pixel, or similar tracking.
- **No cookie/privacy banner** — May be required for Mexican e-commerce.
- **No shipping/returns policy page** — FAQ mentions contacting email but links to `#faq`, not a dedicated policy page.
- **The Shopify theme variant uses older CSS class names** (`.btn-liquid`, `.btn-primary`) that don't match `deploy/`.
- **`resource_urls.json`** contains temporary Shopify staged-upload URLs that will expire. The file is useful only as a historical record of what was uploaded.

## 14. Files to understand before making changes

Priority order:

1. **`CLAUDE.md`** — Product specs, brand guidelines, competition analysis, and open questions. Read first.
2. **`deploy/index.html`** — The full page structure, all sections, structured data. The most current version.
3. **`deploy/app.js`** — All interactivity: checkout flow, variant IDs, color/size state management, carousel, video, scroll effects. Only 199 lines.
4. **`deploy/styles.css`** — Complete design system in 310 lines. Custom properties, button system, all component styles, responsive breakpoints.
5. **`assets-hd/cdn-urls.json`** — Source of truth for all CDN image URLs used in the HTML.
6. **`shopify-theme/templates/page.cirqa.liquid`** — If working on the Shopify version: the full Liquid template with dynamic data bindings.
7. **`shopify-theme/assets/cirqa.js`** — Shopify variant of the JS that reads from `window.CIRQA` instead of hardcoded IDs.

## 15. Instructions for a future Claude session

### Before making any changes
1. Read `CLAUDE.md` for product and brand context.
2. Read this file for technical context.
3. Ask which output variant to modify: `deploy/`, `site/`, or `shopify-theme/`.
4. If modifying `deploy/`, preview with `python3 -m http.server 4173 --directory deploy`.

### Safe modification guidelines
- **Do not change Shopify variant IDs** without confirming they match the live store.
- **Do not change prices** without explicit confirmation — $3,999 MXN may not be final.
- **Do not remove or rename CDN image URLs** — they are live on the Shopify CDN. The URL patterns (with `?v=` version params) must be preserved exactly.
- **Do not modify files in `assets/` or `assets-hd/`** — these are source assets, not generated files.
- **Keep the button class system consistent** within each variant. The `deploy/` version uses `.btn-ink`/`.btn-glass`/`.btn-quiet`; the other variants use `.btn-liquid`/`.btn-primary`/`.btn-ghost`.
- **Respect `prefers-reduced-motion`** — all animations already have reduced-motion fallbacks; new animations should too.
- **Keep all content in Spanish** (es-MX locale).
- **Preserve accessibility features** — ARIA attributes, skip links, screen-reader-only text, keyboard navigation.

### If adding new images
1. Upload to the Shopify CDN via the Shopify admin or API.
2. Add the final CDN URL to `assets-hd/cdn-urls.json`.
3. Save a local copy in `assets-hd/cdn/` with a descriptive filename.

### If updating the Shopify theme
The `shopify-theme/` variant reads product data from the Shopify admin. Price changes, variant additions, and inventory updates should be made in the Shopify admin, not in the template code. The template automatically reflects those changes via Liquid.
