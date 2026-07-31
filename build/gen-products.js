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
<div class="topbar glass-light blurred" role="region" aria-label="Garantías y estándares">
  <div class="topbar-track">
    <ul>
      <li>Sin suscripción, para siempre</li>
      <li>Pago seguro vía Shopify</li>
      <li>Marcas seleccionadas</li>
      <li>Vegan &amp; Non-GMO</li>
      <li>100% Ingredients Made Traceable</li>
      <li>Clean Label Project Certified</li>
      <li>Formulated by Dietitians &amp; Scientists</li>
    </ul>
    <ul aria-hidden="true">
      <li>Sin suscripción, para siempre</li>
      <li>Pago seguro vía Shopify</li>
      <li>Marcas seleccionadas</li>
      <li>Vegan &amp; Non-GMO</li>
      <li>100% Ingredients Made Traceable</li>
      <li>Clean Label Project Certified</li>
      <li>Formulated by Dietitians &amp; Scientists</li>
    </ul>
  </div>
</div>

<nav class="nav" aria-label="Principal">
  <div class="nav-pill glass-light blurred">
    <div class="nav-start">
      <div class="nav-links">
        <a href="/tienda">Tienda</a>
        <a href="/#objetivo">Tu objetivo</a>
        <a href="/#wearables">Wearables</a>
        <a href="/#suplementos">Suplementos</a>
        <a href="/#faq">FAQ</a>
      </div>
    </div>
    <a class="logo" href="/">lowlabs</a>
    <div class="nav-end">
      <a class="btn btn-ink btn-sm" href="#comprar">Comprar</a>
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
        <p><a href="/#faq">Garantía y devoluciones</a></p>
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
            </div>`;
}

function sizeRow(p) {
  if (!p.sizes) return "";
  return `
            <div class="rail-sizes" role="radiogroup" aria-label="Talla">
${p.sizes
  .map(
    (s, i) => `              <button class="size-btn glass-light${i === 0 ? " active" : ""}" type="button" role="radio" aria-checked="${i === 0}" data-size="${esc(s.name)}"><b>${esc(s.name)}</b><small>${esc(s.note)}</small></button>`
  )
  .join("\n")}
            </div>`;
}

/* Chaque produit a sa boucle : la CIRQA garde le plan noir du hero, les
   autres montres partagent la boucle tissu, la créatine la boucle dorée. */
const BAND_VIDEO = {
  cirqa: "hero-cirqa",
  creatina: "loop-brand",
};

function band(p) {
  const src = BAND_VIDEO[p.handle] || "loop-wearables";
  return `
    <div class="band rv">
      <video autoplay muted loop playsinline webkit-playsinline preload="metadata"
             disablepictureinpicture disableremoteplayback
             poster="/media/poster-${src}.jpg"
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

function page(p) {
  const buyLabel = `Comprar ahora — ${money(p.price)} MXN`;
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

<a class="skip" href="#contenido">Saltar al contenido</a>
${nav()}

<div class="shell">
  <main id="contenido">

    <!-- ===== Achat ===== -->
    <section class="pdp" id="comprar" aria-labelledby="pdp-t">
      <div class="container">
        <nav class="crumbs rv" aria-label="Migas de pan">
          <a href="/">Inicio</a>
          <span aria-hidden="true">/</span>
          <a href="/#catalogo">${esc(p.category)}</a>
          <span aria-hidden="true">/</span>
          <span>${esc(p.short)}</span>
        </nav>

        <div class="pdp-grid">
          <div class="stage rv">
            <div class="pdp-media">
              <img id="stage-img" src="${esc(p.image)}" alt="${esc(p.name)}" width="900" height="900" fetchpriority="high">
            </div>
          </div>

          <!-- La nacelle ne porte pas .rv : animer l'opacité d'une surface
               à flou réel tue le flou pendant toute la transition. -->
          <div class="rail glass-light blurred pdp-buy">
            <span class="eyebrow">${esc(p.brand)}</span>
            <h1 id="pdp-t">${esc(p.name)}</h1>
            <p class="pdp-lede">${esc(p.tagline)}</p>

            <div class="pdp-price price-num">
              <b>${money(p.price)}</b>
              ${p.compareAt ? `<s aria-hidden="true">${money(p.compareAt)}</s>` : ""}
              <span>MXN · Envío gratis</span>
              ${p.compareAt ? `<span class="sr-only">Precio anterior: ${money(p.compareAt)} pesos. Precio actual: ${money(p.price)} pesos mexicanos.</span>` : ""}
            </div>

            <ul class="pdp-list">
${p.highlights.map((h) => `              <li>${CHECK}${esc(h)}</li>`).join("\n")}
            </ul>
${colorRail(p)}${sizeRow(p)}

            <div class="pdp-cta">
              <button class="btn btn-ink btn-block btn-lg" id="checkout-btn" type="button">${esc(buyLabel)}</button>
              <p class="pdp-note">${hasShopify ? "Pago seguro con tarjeta vía Shopify Checkout" : "Disponible bajo pedido — te contactamos para confirmar tu compra"}</p>
            </div>

            <ul class="trust">
              <li>${CHECK}Producto 100% original con garantía oficial en México</li>
              <li>${CHECK}Envío gratis a todo México</li>
              <li>${CHECK}Sin suscripción — sin cargos recurrentes</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Bannière produit ===== -->
${band(p)}

    <!-- ===== Fiche technique ===== -->
    <section aria-labelledby="specs-t">
      <div class="container">
        <div class="section-head rv">
          <div>
            <span class="eyebrow">Ficha técnica</span>
            <h2 id="specs-t">Todo lo que necesitas saber</h2>
          </div>
        </div>
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
  <div class="dock-shell glass-light blurred" id="dock-shell">
    <div class="dock-info">
      <b class="price-num">${money(p.price)} MXN</b>
      <span id="dock-variant">${esc(p.short)} · Envío gratis</span>
    </div>
    <button class="btn btn-ink" id="dock-btn" type="button">Comprar ahora</button>
  </div>
</div>

<script src="/catalog.js" defer></script>
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
