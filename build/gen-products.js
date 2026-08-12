#!/usr/bin/env node
/* =========================================================================
   Générateur des pages produit.

   Les pages sont statiques (vercel.json n'a pas d'étape de build) : ce
   script les écrit à partir de deploy/catalog.js, source unique de vérité.
   Après toute modification du catalogue :  node build/gen-products.js
   ========================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const DEPLOY = path.join(ROOT, "deploy");
const OUT = path.join(DEPLOY, "productos");

/* catalog.js est un script navigateur : on l'exécute dans un bac à sable
   qui expose un faux `window`, plutôt que d'en dupliquer les données. */
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(DEPLOY, "catalog.js"), "utf8"), sandbox);
const { products, money } = sandbox.window.LOWLABS;

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CHECK = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5a6165" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';

const nav = () => `
<!-- ===== Bandeau défilant : reprend les garanties et les standards des
     deux bandeaux retirés, en une seule barre fixe au-dessus de la nav.
     La seconde liste est un doublon masqué : c'est elle qui rend la
     boucle continue, la translation de -50% la ramenant pile en place. -->

<nav class="nav" aria-label="Principal">
  <div class="nav-pill">
    <div class="nav-start">
      <div class="nav-links">
        <a href="/tienda">Tienda</a>
        <a href="/#wearables">Wearables</a>
        <a href="/#suplementos">Suplementos</a>
      </div>
    </div>
    <a class="logo" href="/">lowlabs</a>
    <div class="nav-end">
      <a class="btn btn-ink btn-sm" href="#comprar">Comprar</a>
      <button class="cart-icon" type="button" data-cart-open data-cart-count aria-label="Abrir el carrito"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/></svg></button>
    </div>
  </div>
</nav>`;

const footer = () => `
<footer>
  <div class="container">
    <div class="foot-grid">
      <div>
        <a class="foot-logo" href="/">lowlabs<span lang="en">curated wellness and technology</span></a>
        <p style="margin-top:14px;max-width:38ch">Seleccionamos la mejor tecnología de bienestar y la traemos a México con una experiencia de compra simple y honesta.</p>
      </div>
      <div>
        <h3 class="foot-title">Tienda</h3>
        <p><a href="/tienda">Ver todo</a></p>
${products.map((p) => `        <p><a href="/productos/${p.handle}">${esc(p.name)}</a></p>`).join("\n")}
      </div>
      <div>
        <h3 class="foot-title">Ayuda</h3>
        <p><a href="mailto:lowlabsmx@gmail.com">lowlabsmx@gmail.com</a></p>
        <p><a href="mailto:lowlabsmx@gmail.com">Garantía y devoluciones</a></p>
      </div>
    </div>
    <div class="legal">
      <p>¹ Esto no es un dispositivo médico y no está destinado a diagnosticar ni monitorear ninguna condición médica; consulta Garmin.com/ataccuracy. Pulse Ox no está disponible en todos los países.</p>
      <p style="margin-top:8px">* Estas afirmaciones no han sido evaluadas por la FDA. Este producto no pretende diagnosticar, tratar, curar ni prevenir ninguna enfermedad.</p>
      <p style="margin-top:8px">Garmin®, CIRQA™, Body Battery™, Garmin Connect™, Venu® y Vívoactive® son marcas comerciales de Garmin Ltd. o sus subsidiarias. Cymbiotika® es marca de Cymbiotika LLC. lowlabs es un distribuidor independiente y no está afiliado a Garmin Ltd. ni a Cymbiotika LLC.</p>
      <p style="margin-top:8px">© 2026 lowlabs. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>`;

function colorRail(p) {
  if (!p.colors) return "";
  return `
            <div class="opt">
              <!-- La valeur choisie est écrite en toutes lettres : sur une
                   rangée de pastilles, l'anneau seul ne suffit pas à dire
                   laquelle est prise. app.js la tient à jour. -->
              <p class="opt-head"><span>Color</span><b data-opt="color">${esc(p.colors[0].name)}</b></p>
            <div class="rail-track" role="radiogroup" aria-label="Color de la banda">
${p.colors
  .map(
    (c, i) => `              <button class="rail-item glass-light${i === 0 ? " active" : ""}" type="button" role="radio" aria-checked="${i === 0}" data-color="${esc(c.name)}">
                <span class="rail-thumb"><img loading="lazy" src="${esc(c.image)}&amp;width=160" alt="" width="80" height="80"></span>
                <span class="rail-txt"><b>${esc(c.name)}</b><span>${esc(c.note)}</span></span>
                <svg class="rail-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                <span class="rail-dot" style="background:${c.dot}" aria-hidden="true"></span>
              </button>`
  )
  .join("\n")}
            </div>
            </div>`;
}

function sizeRow(p) {
  if (!p.sizes) return "";
  return `
            <div class="opt">
              <p class="opt-head"><span>Talla</span><b data-opt="size">${esc(p.sizes[0].name)}</b></p>
            <div class="rail-sizes" role="radiogroup" aria-label="Talla">
${p.sizes
  .map(
    (s, i) => `              <button class="size-btn glass-light${i === 0 ? " active" : ""}" type="button" role="radio" aria-checked="${i === 0}" data-size="${esc(s.name)}"><b>${esc(s.name)}</b><small>${esc(s.note)}</small></button>`
  )
  .join("\n")}
            </div>
            </div>`;
}

/* Chaque produit a sa boucle : la CIRQA garde le plan noir du hero, les
   autres montres partagent la boucle tissu, les suppléments la boucle
   gélules. */
const BAND_VIDEO = {
  cirqa: "productos/cirqa/hero-cirqa",
  creatina: "landing/bandas/loop-brand",
  "promix-relax": "landing/bandas/loop-capsulas",
  "absorption-sleep": "landing/bandas/loop-capsulas",
};
const BAND_DEFAULT = "landing/bandas/loop-wearables";

/* Les médias vivent dans des sous-dossiers ; l'affiche est le fichier
   voisin de la boucle, préfixé `poster-`. */
function posterOf(stem) {
  const i = stem.lastIndexOf("/");
  return i < 0 ? `poster-${stem}` : `${stem.slice(0, i)}/poster-${stem.slice(i + 1)}`;
}

/* Visuel principal : une boucle si la fiche en déclare une, la photo
   sinon. L'affiche est toujours posée dessous — si la lecture est refusée
   (économie d'énergie, mouvement réduit), la fiche reste complète. */
function stageMedia(p) {
  if (!p.video) {
    return `              <img id="stage-img" src="${esc(p.image)}" alt="${esc(p.name)}" width="900" height="900" fetchpriority="high">`;
  }
  return `              <video autoplay muted loop playsinline webkit-playsinline preload="metadata"
                     disablepictureinpicture disableremoteplayback
                     poster="${esc(p.poster || p.image)}"
                     width="900" height="900" aria-label="${esc(p.name)}" tabindex="-1" data-autoloop>
                <source src="${esc(p.video)}" type="video/mp4">
              </video>`;
}

/* Chapitre éditorial — même gabarit que « Todos tus datos, en una sola app
   gratuita » sur la home : un média, un titre, un texte court. */
function story(p) {
  if (!p.story) return "";
  const wide = p.videoRatio === "wide";
  const ratio = wide ? " wide" : " portrait";
  const box = wide ? 'width="1280" height="720"' : 'width="720" height="1280"';
  const media = p.video
    ? `            <video autoplay muted loop playsinline webkit-playsinline preload="metadata"
                   disablepictureinpicture disableremoteplayback
                   poster="${esc(p.poster || p.image)}"
                   ${box} aria-hidden="true" tabindex="-1" data-autoloop>
              <source src="${esc(p.video)}" type="video/mp4">
            </video>`
    : `            <img loading="lazy" src="${esc(p.image)}" alt="" width="1000" height="1000">`;

  return `
    <!-- ===== Chapitre éditorial ===== -->
    <section class="chapter" aria-labelledby="story-t">
      <div class="container">
        <div class="chapter-grid">
          <div class="chapter-media${ratio} rv">
${media}
          </div>
          <div class="chapter-copy">
            <span class="eyebrow rv">${esc(p.story.eyebrow)}</span>
            <h2 id="story-t" class="rv">${esc(p.story.title)}</h2>
            <p class="rv">${esc(p.story.text)}</p>
            <a class="btn btn-ink rv" href="#comprar">Comprar — ${money(p.price)} MXN</a>
          </div>
        </div>
      </div>
    </section>
`;
}

function band(p) {
  const src = BAND_VIDEO[p.handle] || BAND_DEFAULT;
  return `
    <div class="band rv">
      <video autoplay muted loop playsinline webkit-playsinline preload="metadata"
             disablepictureinpicture disableremoteplayback
             poster="/media/${posterOf(src)}.jpg"
             width="1280" height="720" aria-hidden="true" tabindex="-1" data-autoloop>
        <source src="/media/${src}.mp4" type="video/mp4">
      </video>
      <div class="band-inner">
        <span class="eyebrow">${esc(p.brand)}</span>
        <h2>${esc(p.tagline)}</h2>
        <p>Envío gratis a todo México, pago seguro y garantía oficial. Sin suscripciones ni cargos recurrentes.</p>
      </div>
    </div>`;
}


/* Galerie : les couleurs quand il y en a, sinon la photo principale, puis
   les vues supplémentaires du catalogue. Chaque cadre porte sa couleur :
   c'est ce qui permet au sélecteur de faire défiler la piste. */
function galleryShots(p) {
  const shots = [];
  if (p.colors) p.colors.forEach((c) => shots.push({ src: c.image, alt: `${p.name} — ${c.name}`, color: c.name }));
  else shots.push({ src: p.image, alt: p.name, color: "" });
  (p.gallery || []).forEach((g) => shots.push({ src: g, alt: p.name, color: "" }));
  return shots;
}

function galleryFrames(p) {
  return galleryShots(p)
    .map(
      (sh, i) => `              <figure class="gal-frame${i === 0 ? " on" : ""}"${sh.color ? ` data-color="${esc(sh.color)}"` : ""}>
                <img ${i === 0 ? 'id="stage-img" fetchpriority="high"' : 'loading="lazy"'} src="${esc(sh.src)}" alt="${esc(sh.alt)}" width="900" height="900">
              </figure>`
    )
    .join("\n");
}

function galleryThumbs(p) {
  const shots = galleryShots(p);
  if (shots.length < 2) return "";
  return `            <div class="gal-thumbs" role="tablist" aria-label="Vistas del producto">
${shots
  .map(
    (sh, i) => `              <button class="gal-thumb${i === 0 ? " on" : ""}" type="button" role="tab" aria-selected="${i === 0}" data-i="${i}"${sh.color ? ` data-color="${esc(sh.color)}"` : ""}>
                <img loading="lazy" src="${esc(sh.src)}" alt="${esc(sh.alt)}" width="120" height="120">
              </button>`
  )
  .join("\n")}
            </div>`;
}

function briefTitle(p) {
  return p.category === "Wearables" ? "¿Qué hace por ti?" : "¿Qué es y para qué sirve?";
}

function page(p) {
  const buyLabel = `Añadir al carrito — ${money(p.price)} MXN`;
  const hasShopify = !!(p.shopify && p.shopify.handle);
  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p.brand },
    description: p.tagline,
    image: p.image.indexOf("http") === 0 ? p.image : "https://lowlabs.mx" + p.image,
    offers: {
      "@type": "Offer",
      price: String(p.price),
      priceCurrency: "MXN",
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "lowlabs" },
    },
  };

  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.name)} — ${money(p.price)} MXN | lowlabs</title>
<meta name="description" content="${esc(p.tagline)} ${money(p.price)} MXN con envío gratis a todo México.">
<meta property="og:title" content="${esc(p.name)} | lowlabs">
<meta property="og:description" content="${esc(p.tagline)}">
<meta property="og:image" content="${esc(p.image)}">
<meta property="og:type" content="product">
<meta property="og:locale" content="es_MX">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23ffffff'/%3E%3Crect x='21' y='15' width='7' height='34' rx='3.5' fill='%2317191b'/%3E%3Crect x='36' y='15' width='7' height='34' rx='3.5' fill='%2317191b'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.shopify.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<link rel="preload" as="image" href="${esc(p.image)}" fetchpriority="high">
<script>
document.documentElement.className += " js";
try{ if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.className += " rm"; }catch(e){}
</script>
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<link rel="stylesheet" href="/styles.css">
</head>
<body data-product="${p.handle}">

<!-- Filtre de réfraction des boutons en verre liquide. Un bruit fractal
     déplace le fond puis est refloué : c'est ce qui donne l'ondulation.
     Seul Firefox honore \`backdrop-filter:url()\` — ailleurs les boutons
     retombent sur le flou simple, l'arête portant déjà l'effet. -->
<svg class="svg-defs" aria-hidden="true" focusable="false">
  <filter id="lg-refract" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence"/>
    <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise"/>
    <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="26" xChannelSelector="R" yChannelSelector="B" result="displaced"/>
    <feGaussianBlur in="displaced" stdDeviation="3" result="finalBlur"/>
    <feComposite in="finalBlur" in2="finalBlur" operator="over"/>
  </filter>
</svg>

<a class="skip" href="#contenido">Saltar al contenido</a>
${nav()}

<div class="shell">
  <main id="contenido">

    <!-- ===== Achat — visuel, sélection et CTA au-dessus de la ligne de
         flottaison, sur mobile comme sur desktop. ===== -->
    <section class="pdp" id="comprar" aria-labelledby="pdp-t">
      <div class="container">
        <nav class="crumbs rv" aria-label="Migas de pan">
          <a href="/">Inicio</a>
          <span aria-hidden="true">/</span>
          <a href="/tienda">${esc(p.category)}</a>
          <span aria-hidden="true">/</span>
          <span>${esc(p.short)}</span>
        </nav>

        <div class="pdp-grid">
          <!-- Galerie : une piste qui se fait glisser au doigt, des
               vignettes au clic, et la couleur choisie qui la pilote. -->
          <div class="gal" id="gal">
            <div class="gal-stage" id="gal-stage">
${galleryFrames(p)}
            </div>
            <div class="gal-dots" id="gal-dots" aria-hidden="true"></div>
${galleryThumbs(p)}
          </div>

          <!-- La nacelle ne porte pas .rv : animer l'opacité d'une surface
               à flou réel tue le flou pendant toute la transition. -->
          <div class="rail glass-light blurred pdp-buy">
            <div class="pdp-head">
              <span class="eyebrow">${esc(p.brand)}</span>
              ${p.badge ? `<span class="pdp-badge">${esc(p.badge)}</span>` : ""}
            </div>
            <h1 id="pdp-t">${esc(p.name)}</h1>
            <p class="pdp-lede">${esc(p.tagline)}</p>

            <div class="pdp-price price-num">
              <b id="pdp-price">${money(p.price)}</b>
              ${p.compareAt ? `<s aria-hidden="true">${money(p.compareAt)}</s>` : ""}
              <span>MXN · Envío gratis</span>
              ${p.compareAt ? `<span class="sr-only">Precio anterior: ${money(p.compareAt)} pesos. Precio actual: ${money(p.price)} pesos mexicanos.</span>` : ""}
            </div>
${colorRail(p)}${sizeRow(p)}
            <div class="pdp-cta">
              <button class="btn btn-ink btn-block btn-lg" id="checkout-btn" type="button">${esc(buyLabel)}</button>
              <p class="pdp-note">${hasShopify ? "Pago seguro con tarjeta vía Shopify Checkout" : "Disponible bajo pedido — te contactamos para confirmar tu compra"}</p>
            </div>

            <ul class="trust">
              <li>${CHECK}Envío gratis a todo México</li>
              <li>${CHECK}Producto original con garantía oficial</li>
              <li>${CHECK}Sin suscripción — sin cargos recurrentes</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Résumé court : ce que c'est, en une phrase et trois points ===== -->
    <section class="pdp-brief" aria-labelledby="brief-t">
      <div class="container">
        <div class="brief-card rv">
          <h2 id="brief-t">${esc(briefTitle(p))}</h2>
          <p>${esc(p.story ? p.story.text : p.tagline)}</p>
          <ul class="brief-points">
${p.highlights.slice(0, 3).map((h) => `            <li>${CHECK}${esc(h)}</li>`).join("\n")}
          </ul>
        </div>
      </div>
    </section>

    <!-- ===== Bundle : le produit vu + deux compléments, remise de 10%.
         Les articles viennent du champ pairs du catalogue ; app.js
         calcule les totaux et pousse la sélection dans le panier. ===== -->
    <section class="bundle" aria-labelledby="bundle-t" id="bundle" data-handles="${p.pairs ? p.pairs.slice(0, 2).join(",") : ""}">
      <div class="container">
        <div class="bundle-card rv">
          <div class="bundle-head">
            <h2 id="bundle-t">Ahorra 10%, arma tu bundle</h2>
            <p>Añade los complementos que van con ${esc(p.short)} y llévate 10% de descuento.</p>
          </div>
          <div class="bundle-row" id="bundle-row"></div>
          <div class="bundle-sum">
            <dl>
              <div class="bundle-line"><dt>Precio regular</dt><dd><s id="bundle-regular"></s></dd></div>
              <div class="bundle-line"><dt>Descuento bundle</dt><dd class="bundle-off" id="bundle-save"></dd></div>
            </dl>
            <p class="bundle-total"><b id="bundle-total"></b><span>MXN</span></p>
          </div>
          <button class="btn btn-ink btn-lg bundle-cta" type="button" id="bundle-add">Añadir bundle al carrito</button>
          <p class="bundle-fine">El 10% se aplica en el checkout de Shopify con el código ${esc("BUNDLE10")}. Envío gratis a todo México.</p>
        </div>
      </div>
    </section>

    <!-- ===== Bannière produit ===== -->
${band(p)}
${story(p)}
    <!-- ===== Fiche technique ===== -->
    <section aria-labelledby="specs-t">
      <div class="container">
        <div class="section-head rv">
          <div>
            <span class="eyebrow">Ficha técnica</span>
            <h2 id="specs-t">Todo lo que necesitas saber</h2>
          </div>
        </div>
        <ul class="pdp-list rv">
${p.highlights.map((h) => `          <li>${CHECK}${esc(h)}</li>`).join("\n")}
        </ul>
        <div class="spec-table rv">
          <dl>
${p.specs.map(([k, v]) => `            <dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("\n")}
          </dl>
        </div>
      </div>
    </section>

    <!-- ===== Le reste du catalogue ===== -->
    <section class="compare" aria-labelledby="otros-t">
      <div class="container">
        <div class="section-head rv">
          <div>
            <span class="eyebrow">La selección</span>
            <h2 id="otros-t">Otros productos lowlabs</h2>
          </div>
          <div class="head-aside">
            <p>Wearables Garmin y suplementos formulados por científicos, con la misma promesa: menos ruido, mejor bienestar.</p>
          </div>
        </div>
        <div class="cat-grid rv" id="cat-grid" data-exclude="${p.handle}"></div>
      </div>
    </section>

  </main>
</div>
${footer()}

<!-- ===== Dock d'achat ===== -->
<div class="dock" role="region" aria-label="Comprar ${esc(p.short)}">
  <div class="dock-shell" id="dock-shell">
    <div class="dock-info">
      <b class="price-num">${money(p.price)} MXN</b>
      <span id="dock-variant">${esc(p.short)} · Envío gratis</span>
    </div>
    <button class="btn btn-ink" id="dock-btn" type="button">Añadir al carrito</button>
  </div>
</div>

<script src="/catalog.js" defer></script>
<script src="/cart.js" defer></script>
<script src="/app.js" defer></script>
</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
products.forEach((p) => {
  fs.writeFileSync(path.join(OUT, p.handle + ".html"), page(p), "utf8");
  console.log("écrit  deploy/productos/" + p.handle + ".html");
});
