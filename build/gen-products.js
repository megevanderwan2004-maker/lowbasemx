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

/* La miette de catégorie a désormais sa propre page de rayon. Le slug est
   dérivé du nom, comme les ancres de la boutique, pour qu'ajouter une
   catégorie au catalogue n'oblige pas à toucher ce fichier. */
const catUrl = (cat) =>
  "/" + String(cat).toLowerCase()
    .replace(/[áàä]/g, "a").replace(/[éèë]/g, "e").replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o").replace(/[úùü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
        <a href="/wearables">Wearables</a>
        <a href="/suplementos">Suplementos</a>
        <a href="/nosotros">Nosotros</a>
      </div>
    </div>
    <a class="logo" href="/">lowlabs</a>
    <div class="nav-end">
      <button class="search-icon" type="button" data-search-open aria-label="Buscar productos" aria-expanded="false" aria-controls="search-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg></button>
      <button class="cart-icon" type="button" data-cart-open data-cart-count aria-label="Abrir el carrito"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 7h12l-1.2 11.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7"/></svg></button>
    </div>
  </div>
</nav>

<!-- ===== Recherche — panneau unique, présent sur toutes les pages.
     Il vit HORS de .shell et à côté de la nav, comme le tiroir du panier :
     pose dedans, il heriterait de l'overflow de la coquille et serait rogne.
     Le contenu est injecte par le module search d'app.js ; sans JS le
     bouton reste inerte et la nav garde ses trois liens. ===== -->
<div class="search-panel" id="search-panel" hidden>
  <div class="search-shell glass-light blurred">
    <form class="search-form" role="search" autocomplete="off">
      <svg class="search-form-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>
      <input class="search-input" id="search-input" type="search" name="q"
             placeholder="Busca un producto, una marca, un objetivo…"
             aria-label="Buscar productos" aria-autocomplete="list"
             aria-controls="search-results" aria-expanded="false">
      <button class="search-close" type="button" data-search-close aria-label="Cerrar la búsqueda">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
    </form>
    <div class="search-results" id="search-results" role="listbox" aria-label="Sugerencias"></div>
  </div>
</div>
`;

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
        <p><a href="/nosotros">Nosotros</a></p>
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

/* Les visuels du CDN Shopify acceptent un paramètre de largeur ; les
   fichiers locaux, non — le suffixe en ferait une URL introuvable.
   L'échappement se fait ici : le `&amp;` du suffixe ne doit pas repasser
   par `esc()`, qui en ferait un `&amp;amp;`. */
function thumbSrc(src) {
  return src.indexOf("?") > -1 ? `${esc(src)}&amp;width=160` : esc(src);
}

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
                <span class="rail-thumb"><img loading="lazy" src="${thumbSrc(c.image)}" alt="" width="80" height="80"></span>
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
  /* L'intitulé se déclare dans la fiche : « Talla » pour un bracelet,
     « Formato » pour une boîte de sticks. */
  const label = p.sizeLabel || "Talla";
  return `
            <div class="opt">
              <p class="opt-head"><span>${esc(label)}</span><b data-opt="size">${esc(p.sizes[0].name)}</b></p>
            <div class="rail-sizes" role="radiogroup" aria-label="${esc(label)}">
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


/* Les aperçus de lien et le balisage schema.org veulent une URL absolue. */
function absUrl(src) {
  return src.indexOf("http") === 0 ? src : "https://lowlabs.mx" + src;
}

/* Galerie : les couleurs quand il y en a, sinon la photo principale, puis
   les vues supplémentaires du catalogue. Chaque cadre porte sa couleur :
   c'est ce qui permet au sélecteur de faire défiler la piste. */
function galleryShots(p) {
  const shots = [];
  /* `shotFit:"contain"` : les vues produit sont des rendus sur fond blanc,
     le cadre doit les contenir en entier. Les photos de la clé `gallery`
     restent des photos — elles remplissent le cadre. */
  const fit = p.shotFit === "contain" ? " contain" : "";
  /* Une option pilote la galerie : la couleur quand il y en a, sinon le
     format s'il porte ses visuels (les trois étuis de Sleep). Les vues
     supplémentaires suivent la principale en portant la même valeur — le
     sélecteur amène sur la première, le geste latéral fait défiler les
     autres sans changer d'option. */
  const sized = !p.colors && p.sizes && p.sizes.some((s) => s.image);
  if (p.colors)
    p.colors.forEach((c) => {
      shots.push({ src: c.image, alt: `${p.name} — ${c.name}`, color: c.name, fit });
      (c.views || []).forEach((v) => shots.push({ src: v, alt: `${p.name} — ${c.name}`, color: c.name, fit }));
    });
  else if (sized)
    p.sizes.forEach((s) => {
      shots.push({ src: s.image || p.image, alt: `${p.name} — ${s.name}`, size: s.name, fit });
      (s.views || []).forEach((v) => shots.push({ src: v, alt: `${p.name} — ${s.name}`, size: s.name, fit }));
    });
  else shots.push({ src: p.image, alt: p.name, color: "", fit });
  (p.gallery || []).forEach((g) => shots.push({ src: g, alt: p.name, color: "", fit: "" }));
  return shots;
}

/* Le cadre porte la valeur qui l'a amené : c'est ce qui permet au
   sélecteur de faire défiler la piste jusqu'à lui. */
function shotKey(sh) {
  if (sh.color) return ` data-color="${esc(sh.color)}"`;
  if (sh.size) return ` data-size="${esc(sh.size)}"`;
  return "";
}

function galleryFrames(p) {
  return galleryShots(p)
    .map(
      (sh, i) => `              <figure class="gal-frame${i === 0 ? " on" : ""}${sh.fit}"${shotKey(sh)}>
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
    (sh, i) => `              <button class="gal-thumb${i === 0 ? " on" : ""}${sh.fit}" type="button" role="tab" aria-selected="${i === 0}" data-i="${i}"${shotKey(sh)}>
                <img loading="lazy" src="${esc(sh.src)}" alt="${esc(sh.alt)}" width="120" height="120">
              </button>`
  )
  .join("\n")}
            </div>`;
}

/* =========================================================================
   Fiches produit — repères d'achat et information dépliable

   Deux blocs, sur les DIX fiches :

   · `.pdp-facts` — la rangée de repères, sous l'accroche et avant le prix.
   · `.pdp-info`  — une barre de pastilles, et rien d'autre tant qu'on n'a
     rien choisi. Choisir une pastille déplie sa section ; en choisir une
     autre replie la précédente ; la croix referme.

   Le contenu vient de `deploy/catalog.js` et de lui seul — `tagline`,
   `story`, `highlights`, `specs`, `colors`, `sizes`, `pairs`. Rien n'y est
   inventé. La CIRQA est la seule fiche à avoir des sections écrites à la
   main (PDP_INFO) : elles s'appuient en plus sur l'annonce produit
   officielle Garmin du dépôt (assets/cirqa/documentos/83713503-….pdf), et
   rien de ce que ce PDF marque « confidentiel » — SKU, UPC, MSRP,
   emballage, carton maître — n'en ressort.
   ========================================================================= */

/* Une liste à coches : le même gabarit que les points d'achat de la
   nacelle, donc le même CSS et la même lecture. */
const infoList = (items) =>
  `<ul class="pdp-list">
${items.map((t) => `              <li>${CHECK}${t}</li>`).join("\n")}
            </ul>`;

/* Une énumération se lit en pastilles, pas en paragraphe : onze fonctions
   d'entraînement à la file feraient un pavé que personne ne parcourt. */
const infoTags = (items) =>
  `<ul class="info-tags">
${items.map((t) => `              <li>${t}</li>`).join("\n")}
            </ul>`;

/* `square` : les visuels de galerie sont cadrés carré partout ailleurs sur
   le site (la piste de la fiche les déclare en 900×900 et les rogne), on
   garde la même règle ici — la boîte est réservée avant le chargement,
   donc le volet ne saute pas quand l'image arrive. */
const infoFig = (src, alt, w, h, cls) =>
  `<figure class="info-fig${cls ? " " + cls : ""}">
              <img loading="lazy" src="${esc(src)}" alt="${esc(alt)}"${w ? ` width="${w}" height="${h}"` : ""}>
            </figure>`;

/* Un accessoire renvoyé vers sa propre fiche. Le prix et le visuel sortent
   du catalogue : un prix écrit en dur se périmerait en silence à la
   première retouche. Si la fiche disparaît du catalogue, le bloc disparaît
   avec elle plutôt que de pointer vers une page absente. */
function recoChip(handle) {
  const a = products.find((x) => x.handle === handle);
  if (!a) return "";
  return `<a class="reco-chip" href="/productos/${a.handle}">
                <img loading="lazy" src="${esc(a.card || a.packshot || a.image)}" alt="" width="60" height="60">
                <span><b>${esc(a.name)}</b><small>${money(a.price)} MXN</small></span>
              </a>`;
}

function accessoryChip(handle) {
  const chip = recoChip(handle);
  if (!chip) return "";
  return `<div class="info-block">
            <h4>Accesorios compatibles</h4>
            <div class="reco-also-list">
              ${chip}
            </div>
          </div>`;
}

/* Comparatif officiel Garmin : quelles fonctions d'entraînement et de
   sommeil chacun des trois porte. La colonne CIRQA est celle qu'on
   souligne — d'où `.col-hl`, dont le fond est neutre sur les fiches. */
const COMPARE_ROWS = [
  ["Detección automática de actividades", 0, 0, 1],
  ["VO2 max", 1, 1, 1],
  ["Relación de carga", 1, 0, 1],
  ["Carga de entreno", 1, 0, 1],
  ["Foco de carga de entreno", 1, 0, 1],
  ["Efecto del entreno", 1, 1, 1],
  ["Beneficio principal", 1, 1, 1],
  ["Beneficio del entreno", 1, 1, 1],
  ["Tiempo de recuperación (mejorado)", 1, 1, 1],
  ["Predisposición para entrenar", 1, 0, 1],
  ["Estado del entreno", 1, 0, 1],
  ["Puntuación del sueño", 1, 1, 1],
  ["Entrenador de sueño", 1, 1, 1],
];

/* La coche du site pour « oui », un tiret pour « non » : à cette taille un
   point et un tiret se ressemblaient trop pour qu'une colonne se balaie
   d'un coup d'œil. Le mot reste dit au lecteur d'écran — le glyphe, lui,
   est masqué. */
const cell = (on, hl) =>
  `<td class="${on ? "yes" : "no"}${hl ? " col-hl" : ""}">` +
  (on ? CHECK : `<span aria-hidden="true">—</span>`) +
  `<span class="sr-only">${on ? "Sí" : "No"}</span></td>`;

const compareTable = () => `<div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col"><span class="sr-only">Función</span></th>
                    <th scope="col">Venu® 4</th>
                    <th scope="col">Vívoactive® 6</th>
                    <th scope="col" class="col-hl">CIRQA™</th>
                  </tr>
                </thead>
                <tbody>
${COMPARE_ROWS.map(
  (r) => `                  <tr><th scope="row">${esc(r[0])}</th>${cell(r[1])}${cell(r[2])}${cell(r[3], true)}</tr>`
).join("\n")}
                </tbody>
              </table>
            </div>`;

/* -------------------------------------------------------------------------
   Sections composées depuis le catalogue

   Neuf fiches sur dix n'ont pas de texte écrit à la main : leurs sections
   sont montées à partir de ce que `catalog.js` déclare déjà. Aucune
   donnée nouvelle n'est introduite ici — on ne fait que réorganiser.
   ------------------------------------------------------------------------- */

/* Les repères se prennent dans la fiche technique : la valeur en gras,
   l'intitulé en dessous. `Marca` et `Envío` sont écartés — la marque est
   déjà en surtitre, l'envoi déjà sur la ligne de prix. Au-delà de 40
   caractères une valeur n'est plus un repère mais une phrase : elle reste
   dans la fiche technique. */
const FACT_SKIP = ["Marca", "Envío"];
function genericFacts(p) {
  return p.specs
    .filter(([k, v]) => FACT_SKIP.indexOf(k) === -1 && v.length <= 40)
    .slice(0, 4)
    .map(([k, v]) => [v, k]);
}

/* La valeur choisie est déjà nommée dans la nacelle ; ici on donne la
   liste complète, avec la note que le catalogue attache à chaque option. */
function optionList(items, dots) {
  return `<ul class="info-opts">
${items
  .map(
    (o) => `              <li>${dots && o.dot ? `<i style="background:${esc(o.dot)}" aria-hidden="true"></i>` : ""}<b>${esc(o.name)}</b>${o.note ? `<span>${esc(o.note)}</span>` : ""}</li>`
  )
  .join("\n")}
            </ul>`;
}

function optionsSection(p) {
  if (!p.colors && !p.sizes) return null;
  const sizeLabel = p.sizeLabel === "Formato" ? "Formatos" : "Tallas";
  const title = p.colors && p.sizes ? `Colores y ${sizeLabel.toLowerCase()}`
    : p.colors ? "Colores" : sizeLabel;
  /* Un seul intitulé quand il n'y a qu'une liste : le volet porte déjà
     « Colores » dans sa barre de titre, le répéter juste en dessous ne
     dit rien de plus. */
  const both = !!(p.colors && p.sizes);
  const blocks = [];
  if (p.colors) {
    blocks.push(`<div class="info-block">${both ? `
            <h4>Colores</h4>` : ""}
            ${optionList(p.colors, true)}
          </div>`);
  }
  if (p.sizes) {
    blocks.push(`<div class="info-block">${both ? `
            <h4>${esc(sizeLabel)}</h4>` : ""}
            ${optionList(p.sizes, false)}
          </div>`);
  }
  return {
    id: "opciones",
    title: title,
    sub: "Lo que puedes elegir",
    body: blocks.join("\n          "),
  };
}

function specsSection(p) {
  return {
    id: "specs",
    title: "Ficha técnica",
    sub: "Todos los detalles",
    body: `<div class="spec-table">
            <dl>
${p.specs.map(([k, v]) => `              <dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("\n")}
            </dl>
          </div>`,
  };
}

const faqItem = (q, a) => `            <details>
              <summary>${q}</summary>
              <div class="a">${a}</div>
            </details>`;

/* Une FAQ qui ne dit que ce que la page dit déjà ailleurs : les garanties
   de la nacelle, le mode de paiement, les options du catalogue. */
function faqSection(p) {
  const items = [];
  if (p.sizes) {
    const label = p.sizeLabel === "Formato" ? "formato" : "talla";
    items.push(
      faqItem(
        `¿Qué ${label} elijo?`,
        p.sizes.map((s) => `<b>${esc(s.name)}</b>${s.note ? " — " + esc(s.note) : ""}`).join(" · ") + "."
      )
    );
  }
  if (p.colors) {
    items.push(
      faqItem(
        "¿En qué colores viene?",
        "En " + p.colors.length + ": " + p.colors.map((c) => esc(c.name)).join(", ") +
          ". El color se elige arriba, antes de añadir al carrito."
      )
    );
  }
  items.push(
    faqItem(
      "¿Cómo son el envío y la garantía?",
      "Envío gratis a todo México y producto original con garantía oficial. " +
        (p.shopify && p.shopify.handle
          ? "El pago es seguro, con tarjeta, vía Shopify Checkout."
          : "Disponible bajo pedido — te contactamos para confirmar tu compra.")
    ),
    faqItem(
      "¿Hay suscripción o cargos recurrentes?",
      "No. Se paga una sola vez: sin suscripción y sin cargos recurrentes."
    ),
    faqItem(
      "¿Cómo hago un cambio o una devolución?",
      'Escríbenos a <a href="mailto:lowlabsmx@gmail.com">lowlabsmx@gmail.com</a> con tu número de pedido y te acompañamos.'
    )
  );
  return {
    id: "faq",
    title: "Preguntas frecuentes",
    sub: "Antes de comprar",
    body: `<div class="faq-list info-faq">
${items.join("\n")}
          </div>`,
  };
}

function genericSections(p) {
  const shot = (p.gallery || [])[0];
  const resumen = {
    id: "resumen",
    title: "Resumen",
    sub: p.category === "Wearables" ? "Qué hace por ti" : "Qué es y para qué sirve",
    body: `<div class="info-split">
            <div class="info-copy">
              <p class="info-lede">${esc(p.story ? p.story.text : p.tagline)}</p>
              ${infoList(p.highlights.map(esc))}
            </div>
            ${shot ? infoFig(shot, p.name, 900, 900, "square") : ""}
          </div>`,
  };
  return [resumen, optionsSection(p), specsSection(p), faqSection(p)].filter(Boolean);
}

const PDP_INFO = {
  cirqa: {
    /* Les repères qui doivent se lire sans défiler, sous la phrase
       d'accroche et avant le prix. Une seule rangée : sur téléphone elle
       se fait glisser plutôt que de repousser le bouton sous la ligne
       de flottaison. */
    facts: [
      ["Hasta 10 días", "de batería"],
      ["Sin pantalla", ""],
      ["18–20 g", "según talla"],
      ["+80", "actividades"],
    ],
    sections: [
      {
        id: "resumen",
        title: "Resumen",
        sub: "Qué es y para qué sirve",
        body: `<div class="info-split">
            <div class="info-copy">
              <p class="info-lede">Sin pantallas. Sin distracciones. Una banda discreta que registra tu salud las 24 horas y tus entrenamientos, y lo manda todo a Garmin Connect™. Sin suscripciones.</p>
              ${infoList([
                "Monitoreo de salud las 24 horas¹",
                "Seguimiento avanzado del sueño, puntuación y coaching personalizado",
                "Más de 80 actividades deportivas y detección automática",
                "Banda de tela, cómoda de llevar puesta todo el día",
              ])}
              <ul class="trust-grid info-stats">
                <li><b>Hasta 10 días</b><span>de batería entre cargas</span></li>
                <li><b>Sin pantalla</b><span>todo se lee en Garmin Connect™</span></li>
                <li><b>18–20 g</b><span>según la talla</span></li>
                <li><b>Sin suscripción</b><span>Garmin Connect™ es gratuita</span></li>
              </ul>
            </div>
            ${infoFig("/media/archivo/cirqa/wrist-negra.jpg", "CIRQA™ Smart Band en la muñeca", 1280, 1600)}
          </div>`,
      },
      {
        id: "salud",
        title: "Salud y ejercicio",
        sub: "24/7, entrenamiento y actividades",
        body: `<div class="info-split">
            <div class="info-copy">
              <div class="info-block">
                <h4>Monitoreo de salud 24/7</h4>
                <p>Una variedad de funciones para seguir cómo estás a lo largo del día, incluida la salud femenina con estimaciones de ovulaciones pasadas.</p>
                ${infoTags([
                  "Seguimiento del estrés",
                  "Pulsioxímetro¹",
                  "Body Battery™",
                  "Salud femenina",
                ])}
              </div>
              <div class="info-block">
                <h4>Apps de seguimiento deportivo</h4>
                ${infoList([
                  "Más de 80 actividades, desde el botón de la banda o desde Garmin Connect™",
                  "Detección automática de actividades, que puedes confirmar y editar después en la app",
                  "Ubicación en actividades al aire libre con el GPS conectado de tu smartphone",
                ])}
              </div>
              <div class="info-block">
                <h4>Funciones de entrenamiento</h4>
                <p>Para saber cuándo esforzarte al máximo y cuándo tomarte un día de recuperación.</p>
                ${infoTags([
                  "Predisposición para entrenar",
                  "Estado de la VFC",
                  "VO2 max",
                  "Estado del entreno",
                  "Carga de entreno",
                  "Relación de carga",
                  "Foco de carga de entreno",
                  "Efecto del entreno",
                  "Beneficio principal",
                  "Beneficio del entreno",
                  "Tiempo de recuperación",
                ])}
              </div>
            </div>
            ${infoFig("/media/archivo/cirqa/app-body-battery.jpg", "Body Battery™ en la app Garmin Connect™", 900, 1600, "tall")}
          </div>`,
      },
      {
        id: "sueno",
        title: "Sueño",
        sub: "Puntuación, fases y ritmo circadiano",
        body: `<p class="info-lede">Una puntuación de sueño y coaching personalizado sobre cuánto sueño necesitas y cómo puedes mejorarlo.</p>
          ${infoList([
            "Puntuación del sueño y entrenador de sueño",
            "Fases del sueño y siestas",
            "Estado de la VFC y temperatura de la piel¹",
            "Alineación del sueño: qué tan alineado estás con tu ritmo circadiano",
            "Consistencia de sueño, noche tras noche",
          ])}`,
      },
      {
        id: "sensores",
        title: "Funciones y sensores",
        sub: "Lo que mide y cómo se conecta",
        body: `<div class="info-split">
            <div class="info-copy">
              <div class="info-block">
                <h4>Lo que mide</h4>
                ${infoTags([
                  "Estrés",
                  "Pulsioxímetro¹",
                  "Body Battery™",
                  "Estado de la VFC",
                  "Temperatura de la piel¹",
                  "VO2 max",
                  "Salud femenina",
                ])}
              </div>
              <div class="info-block">
                <h4>Cómo se conecta</h4>
                ${infoTags(["GPS conectado", "Bluetooth®", "ANT+®", "Garmin Connect™"])}
                <p class="info-fine">El GPS conectado usa el de tu smartphone: registra tu ubicación en actividades al aire libre cuando la banda está enlazada.</p>
              </div>
              <div class="info-block">
                <h4>Cómo se controla</h4>
                <p>Un botón en la banda inicia una actividad. Todo lo demás se ve, se edita y se comparte desde Garmin Connect™, en el móvil o en la web.</p>
              </div>
            </div>
            ${infoFig("/media/archivo/cirqa/cirqa-sensor-negra.jpg", "Sensor óptico y contactos de carga de la CIRQA™ Smart Band", 1600, 1200)}
          </div>
          <div class="info-block">
            <h4>Frente a los relojes Garmin</h4>
            <p>CIRQA™ cubre las funciones de entreno y de sueño de un Venu® 4 o un Vívoactive® 6 — sin pantalla.</p>
            ${compareTable()}
            <p class="compare-note">Comparativa de las funciones de entreno y de sueño de los tres modelos, según la ficha técnica de Garmin. El Venu® 4 y el Vívoactive® 6 añaden pantalla táctil AMOLED y otras funciones que no aparecen en este cuadro.</p>
          </div>`,
      },
      {
        id: "specs",
        title: "Ficha técnica",
        sub: "Peso, medidas y conectividad",
        body: `<div class="spec-table">
            <dl>
              <dt>Pantalla</dt><dd>Sin pantalla — todo en Garmin Connect™</dd>
              <dt>Duración de batería</dt><dd>Hasta 10 días</dd>
              <dt>Peso</dt><dd>18 g (S–M) · 20 g (L–XL)</dd>
              <dt>Tamaño de la caja</dt><dd>27.5 × 46.9 × 8.7 mm</dd>
              <dt>Ajuste en muñeca</dt><dd>S–M: 120–200 mm · L–XL: 145–240 mm</dd>
              <dt>Conectividad</dt><dd>GPS conectado, Bluetooth®, ANT+®</dd>
              <dt>App</dt><dd>Garmin Connect™ (gratuita, sin suscripción)</dd>
              <dt>Colores</dt><dd>Negra · Gris Francés · Malva · Azul Capitán</dd>
            </dl>
          </div>`,
      },
      {
        id: "caja",
        title: "Qué incluye",
        sub: "Lo que hay en la caja",
        body: `${infoList([
          "CIRQA™ Smart Band, en el color y la talla que elijas",
          "Cable de carga y datos",
          "Documentación",
        ])}
          ${accessoryChip("banda-cirqa")}`,
      },
      {
        id: "faq",
        title: "Preguntas frecuentes",
        sub: "Antes de comprar",
        body: `<div class="faq-list info-faq">
            <details>
              <summary>¿Necesito una suscripción?</summary>
              <div class="a">No. Garmin Connect™ es gratuita, en el móvil y en la web, y no hay cargos recurrentes de ningún tipo.</div>
            </details>
            <details>
              <summary>¿De verdad no tiene pantalla?</summary>
              <div class="a">No la tiene, y ése es el punto: la banda registra, tú consultas cuando quieres. Todos los datos se leen en Garmin Connect™.</div>
            </details>
            <details>
              <summary>¿Cuánto dura la batería?</summary>
              <div class="a">Hasta 10 días entre cargas. Se carga con el cable de carga y datos que viene en la caja.</div>
            </details>
            <details>
              <summary>¿Qué talla elijo?</summary>
              <div class="a">S–M se ajusta a muñecas de 120 a 200 mm de circunferencia; L–XL, de 145 a 240 mm. Mide tu muñeca con una cinta métrica antes de elegir.</div>
            </details>
            <details>
              <summary>¿Tiene GPS?</summary>
              <div class="a">GPS conectado: registra tu ubicación en actividades al aire libre cuando está enlazada al GPS de tu smartphone.</div>
            </details>
            <details>
              <summary>¿Puedo cambiar la banda?</summary>
              <div class="a">Sí. Las bandas CIRQA™ de repuesto se venden por separado, en varios colores — <a href="/productos/banda-cirqa">verlas aquí</a>.</div>
            </details>
            <details>
              <summary>¿Es un dispositivo médico?</summary>
              <div class="a">No. No está destinado a diagnosticar ni monitorear ninguna condición médica; consulta Garmin.com/ataccuracy. El pulsioxímetro no está disponible en todos los países.</div>
            </details>
            <details>
              <summary>¿Cómo son el envío y la garantía?</summary>
              <div class="a">Envío gratis a todo México, producto original con garantía oficial y pago seguro con tarjeta vía Shopify Checkout.</div>
            </details>
          </div>`,
      },
    ],
  },
};

/* Les fiches écrites à la main l'emportent ; les autres composent depuis le
   catalogue. Les deux passent par le même gabarit et le même script. */
function infoFacts(p) {
  return (PDP_INFO[p.handle] && PDP_INFO[p.handle].facts) || genericFacts(p);
}
function infoSections(p) {
  return (PDP_INFO[p.handle] && PDP_INFO[p.handle].sections) || genericSections(p);
}

/* La rangée de repères, sous la phrase d'accroche : ce qu'on doit savoir
   avant même de faire défiler. En dessous de deux repères elle ne dit plus
   rien — la fiche technique les porte déjà — et on ne l'écrit pas. */
function factsRow(p) {
  const facts = infoFacts(p);
  if (facts.length < 2) return "";
  return `
            <ul class="pdp-facts">
${facts.map((f) => `              <li><b>${esc(f[0])}</b>${f[1] ? `<span>${esc(f[1])}</span>` : ""}</li>`).join("\n")}
            </ul>`;
}

/* Le bloc d'information : une barre de pastilles, et rien d'autre tant
   qu'on n'a rien choisi. Chaque section n'existe que comme volet — son
   titre vit DANS le volet, avec la croix qui le referme.

   Sans script, la classe `js` n'est pas posée et tous les volets sont
   ouverts : la page reste entièrement lisible, chaque volet portant son
   titre, et les pastilles redeviennent de simples ancres. */
function infoBlock(p) {
  const sections = infoSections(p);
  if (!sections.length) return "";

  const chips = sections
    .map((s) => `          <a class="info-chip" href="#info-${s.id}">${esc(s.title)}</a>`)
    .join("\n");

  const list = sections
    .map(
      (s, i) => `        <section class="info-sec" id="info-${s.id}" aria-labelledby="info-${s.id}-t">
          <div class="info-panel" id="info-${s.id}-p">
            <div class="info-inner">
              <div class="info-body">
                <div class="info-bar">
                  <span class="info-num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
                  <h3 class="info-t" id="info-${s.id}-t">${esc(s.title)}</h3>
                  <span class="info-sub">${esc(s.sub)}</span>
                  <button class="info-close" type="button" aria-label="Cerrar ${esc(s.title)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
                  </button>
                </div>
            ${s.body}
              </div>
            </div>
          </div>
        </section>`
    )
    .join("\n");

  return `
    <!-- ===== Information détaillée — une barre de pastilles commande des
         volets. Rien n'est déplié tant qu'on n'a rien choisi : la page
         reste courte et tout tient à un geste. ===== -->
    <section class="pdp-info" id="info" aria-labelledby="info-t">
      <div class="container">
        <div class="section-head rv">
          <div>
            <span class="eyebrow">${esc(p.short)}</span>
            <h2 id="info-t">Todo lo que necesitas saber</h2>
          </div>
        </div>
        <nav class="info-nav rv" aria-label="Secciones del producto">
${chips}
        </nav>
        <div class="info-list rv">
${list}
        </div>
      </div>
    </section>
`;
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
    image: absUrl(p.image),
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
<meta property="og:image" content="${esc(absUrl(p.image))}">
<meta property="og:type" content="product">
<meta property="og:locale" content="es_MX">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23ffffff'/%3E%3Crect x='21' y='15' width='7' height='34' rx='3.5' fill='%2317191b'/%3E%3Crect x='36' y='15' width='7' height='34' rx='3.5' fill='%2317191b'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdn.shopify.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet">
<!-- Le 1er cadre de la galerie, et non \`p.image\` : depuis que Sleep affiche
     le sachet de 28 doses comme visuel principal tout en ouvrant sa fiche sur
     l'étui de 7 sticks, les deux ne sont plus le même fichier — précharger
     \`p.image\` y téléchargerait 209 ko qui ne sont pas à l'écran. -->
<link rel="preload" as="image" href="${esc((galleryShots(p)[0] || {}).src || p.image)}" fetchpriority="high">
<script>
document.documentElement.className += " js";
try{ if (matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.className += " rm"; }catch(e){}
</script>
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 2)}
</script>
<link rel="stylesheet" href="/styles.css">
<!-- ===== Écran d'ouverture — décidé AVANT la première peinture.
     Le script est en ligne et synchrone à dessein : posé dans app.js, qui
     est en defer, la page aurait le temps de se peindre une fois avant
     d'être recouverte, et c'est précisément ce clignotement qu'on veut
     éviter. Il ne fait que deux choses : marquer la racine, et poser un
     filet de sécurité — si app.js ne démarrait pas, l'écran ne doit en
     aucun cas retenir le site. ===== -->
<script>
(function(d){
  var h = d.documentElement;
  /* Aucune mémoire de session : l'écran revient à CHAQUE chargement, donc
     aussi à chaque rechargement et à chaque passage d'une page à l'autre
     (Tienda, Wearables, Suplementos). C'est demandé — et c'est cohérent :
     chaque page a ses propres visuels et sa propre boucle à préparer, il
     n'y a rien qu'une page précédente aurait déjà chargé pour elle. */
  h.className += " booting";
  setTimeout(function(){
    h.className = h.className.replace(/\s*booting/g, "");
  }, 8000);
})(document);
</script>
</head>
<body data-product="${p.handle}">

<!-- ===== Écran d'ouverture. Il ne sert pas à faire patienter pour rien :
     pendant qu'il est là, la boucle du hero est réellement chargée puis
     LANCÉE en coulisses, de sorte qu'au moment où l'écran s'efface la
     vidéo tourne déjà. C'est tout l'objet du dispositif — sur téléphone la
     boucle est en preload="none" et démarrait donc au moment où on la
     regardait, avec le temps de latence que ça suppose. ===== -->
<div class="boot" id="boot" role="status" aria-label="Cargando lowlabs">
  <div class="boot-inner">
    <p class="boot-mark">lowlabs</p>
    <div class="boot-bar"><i class="boot-fill" id="boot-fill"></i></div>
  </div>
</div>


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
          <a href="${catUrl(p.category)}">${esc(p.category)}</a>
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
            <p class="pdp-lede">${esc(p.tagline)}</p>${factsRow(p)}

            <div class="pdp-price price-num">
              <b id="pdp-price">${money(p.price)}</b>
              <s id="pdp-compare" aria-hidden="true"${p.compareAt ? "" : " hidden"}>${p.compareAt ? money(p.compareAt) : ""}</s>
              <span>MXN · Envío gratis</span>
              ${p.compareAt ? `<span class="sr-only">Precio anterior: ${money(p.compareAt)} pesos. Precio actual: ${money(p.price)} pesos mexicanos.</span>` : ""}
            </div>
${colorRail(p)}${sizeRow(p)}
            <div class="pdp-cta">
              <button class="btn btn-ink btn-block btn-lg" id="checkout-btn" type="button" data-label="Añadir al carrito">${esc(buyLabel)}</button>
              <p class="pdp-note">${hasShopify ? "Pago seguro con tarjeta vía Shopify Checkout" : "Disponible bajo pedido — te contactamos para confirmar tu compra"}</p>
            </div>

            <ul class="trust">
              <li>${CHECK}Envío gratis a todo México</li>
              <li>${CHECK}Producto original con garantía oficial</li>
              <li>${CHECK}Sin suscripción — sin cargos recurrentes</li>
            </ul>
            <a class="pdp-more" href="#info-specs">Ver la ficha técnica completa</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== Bundle : le produit vu + deux compléments, remise de 10%.
         Les compléments ne sont plus écrits ici : app.js les demande à
         LOWLABS.recommend(), qui applique les règles d'exclusion du
         catalogue. Une page générée avant une règle la respecte donc
         quand même — c'est tout l'intérêt de ne plus les figer. ===== -->
    <section class="bundle" aria-labelledby="bundle-t" id="bundle">
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
${infoBlock(p)}
    <!-- ===== Bannière produit ===== -->
${band(p)}
${story(p)}
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
      <b class="price-num" id="dock-price">${money(p.price)} MXN</b>
      <span id="dock-variant">${esc(p.short)} · Envío gratis</span>
    </div>
    <button class="btn btn-ink" id="dock-btn" type="button">Añadir al carrito</button>
  </div>
</div>

<!-- Défilement fluide : une seule instance, démarrée par app.js. -->
<script src="/lenis.min.js" defer></script>
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
