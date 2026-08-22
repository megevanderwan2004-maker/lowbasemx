# lowlabs — boutique wellness & tech (es-MX)

Site statique de **lowlabs**, revendeur mexicain de wearables Garmin et de suppléments
sélectionnés (Cymbiotika, Promix, The Absorption Company). Contenu en espagnol,
prix en MXN. Aucun framework, aucun bundler : du HTML, du CSS et du JavaScript
ES5-compatible, servis tels quels par Vercel. Une seule dépendance npm —
**lenis**, le défilement fluide — et elle n'est pas construite : son fichier
distribué est copié dans `deploy/`.

- **Dossier déployé** : `deploy/` (c'est le seul dossier servi en production)
- **Source de vérité produits** : `deploy/catalog.js`
- **Aperçu local** : `npm run serve` → http://localhost:4175
- **Après un `npm install`** : `npm run vendor:lenis` remet
  `deploy/lenis.min.js` à jour depuis `node_modules/`

---

## Structure du dépôt

```
.
├── deploy/                 ★ le site déployé
│   ├── index.html          home
│   ├── tienda.html         boutique (/tienda)
│   ├── wearables.html      rayon Wearables (/wearables)
│   ├── suplementos.html    rayon Suplementos (/suplementos)
│   ├── productos/          10 fiches produit — GÉNÉRÉES, ne pas éditer à la main
│   ├── catalog.js          produits + objectifs : prix, textes, specs, médias
│   ├── cart.js             panier + tiroir, hand-off vers le checkout Shopify
│   ├── app.js              tout le comportement, en modules isolés
│   ├── lenis.min.js        défilement fluide — copie de node_modules/lenis
│   ├── styles.css          design system complet
│   └── media/              images et vidéos du site (voir plus bas)
│
├── build/
│   ├── gen-products.js     génère deploy/productos/*.html depuis catalog.js
│   └── serve.js            serveur d'aperçu, reproduit les cleanUrls de Vercel
│
├── assets/                 sources brutes non servies (voir plus bas)
├── assets-hd/              versions HD + tables d'URL CDN
├── package.json            lenis + les trois scripts (build, serve, vendor)
├── CLAUDE.md               produit, marque, concurrence — à lire en premier
├── PROJECT_CONTEXT.md      état détaillé du projet et historique
└── vercel.json             outputDirectory: deploy, cleanUrls: true
```

`site/` et `shopify-theme/` sont **abandonnés** (version mono-produit, plusieurs
refontes de retard). Ne pas s'en servir sans demander.

---

## `deploy/media/` — médias du site

Un sous-dossier par produit, un par partie de la landing. Tous les chemins sont
absolus (`/media/...`) et référencés depuis `catalog.js`, `index.html` ou
`gen-products.js`.

```
deploy/media/
├── productos/                  un dossier par handle du catalogue
│   ├── cirqa/                  packshot détouré, boucle produit + affiche
│   ├── venu-4/  venu-3s/  vivoactive-6/
│   ├── creatina/               packshot, boucle sachet + affiche
│   ├── promix-creatina/        packshot 30 sticks
│   ├── promix-debloat/         packshot, boucle + affiche
│   ├── promix-relax/           packshot
│   └── absorption-sleep/       sleep-packshot.png (28 doses, détouré) +
│                               les visuels des trois formats
│
├── landing/
│   ├── hero/                   hero-desktop.mp4 + son affiche (au-dessus de
│   │                           760px), hero-mobile.mp4 + son affiche (plein
│   │                           écran sous 760px). hero-runners.jpg : l'ancien
│   │                           visuel desktop, conservé, plus référencé
│   ├── objetivos/              les 3 boucles de l'assistant + leurs affiches
│   ├── bandas/                 boucles des bandeaux pleine largeur + affiches
│   │                           (dont les deux en-têtes `loop-*-hero` des rayons)
│   └── capitulos/              boucles des chapitres éditoriaux + affiches
│
└── archivo/                    médias conservés mais plus référencés
    ├── cirqa/  objetivos/  suplementos/  ritual/
```

Conventions :

- **Affiche d'une vidéo** = fichier voisin, préfixé `poster-`
  (`landing/bandas/loop-brand.mp4` → `landing/bandas/poster-loop-brand.jpg`).
  `gen-products.js` s'appuie sur cette règle pour construire les bandeaux.
- **`packshot`** = visuel détouré (PNG alpha) : c'est lui qui flotte dans les
  carrousels ET sur les cartes de la tienda — les deux passent par `flyMedia`,
  qui lit `packshot` avant `image`. Sans packshot, un produit y apparaît avec un
  rectangle blanc.
  Un PNG à canal alpha ne suffit pas : il faut qu'il soit **réellement** détouré.
  `absorption-sleep.png` avait son alpha mais 76 % de sa surface était un
  rectangle blanc opaque, et le `drop-shadow` de la carte, qui suit l'alpha,
  dessinait donc l'ombre d'une boîte. `build/cutout.swift` fabrique ces
  détourages : diffusion depuis les bords, bande de transition pour
  l'anticrénelage, décontamination des pixels partiels. Deux clés, parce
  qu'aucune ne suffit seule — l'écart colorimétrique au fond (`dist`), et la
  luminance signée (`clair`) pour les rendus clairs dont l'ombre portée est plus
  loin du fond que le produit lui-même. Un dernier couple d'arguments laisse la
  diffusion traverser le gris neutre d'une ombre sans toucher à un produit
  coloré. Les réglages retenus sont notés en tête des fiches concernées.
- **Un portrait 9/16 dans un bandeau** (`.band`, trois fois plus large que haut)
  n'est visible qu'à un cinquième, et centré ce cinquième tombe sous le sujet.
  Les deux en-têtes de rayon corrigent le cadrage avec
  `.cat-head .band>video{object-position:center 30%}` — à retenir avant d'y
  poser une nouvelle source verticale.
- **`archivo/`** ne se supprime pas à la légère : ce sont les visuels des
  sections retirées (bannière Ritual, anciens objectifs, suppléments Cymbiotika
  remplacés), gardés au cas où une section reviendrait.
- La photographie CIRQA reste servie depuis le **CDN Shopify** — les URL sont
  dans `assets-hd/cdn-urls.json`.

## `assets/` — sources brutes, un dossier par produit

Jamais servi en production (`vercel.json` ne publie que `deploy/`). Un
sous-dossier **au nom du produit**, comme dans `deploy/media/productos/` :

```
assets/
├── cirqa/                  Garmin CIRQA™ Smart Band
│   ├── producto/           packshots studio et rendus produit
│   ├── lifestyle/          photos d'usage (sommeil, sport, quotidien)
│   ├── app/                captures Garmin Connect™
│   ├── video/              rush de la boucle hero
│   └── documentos/         fiches produit officielles Garmin (PDF)
├── venu-4/  venu-3s/  vivoactive-6/     packshots officiels Garmin
├── creatina/               Cymbiotika Advanced Creatine — packshot + rush
├── promix-creatina/        Promix Non-GMO Creatine — packshot 30 sticks
├── promix-debloat/         Promix Debloat — packshot + les deux boucles
├── promix-relax/           Promix Relax: Magnesium Complex — packshot
├── absorption-sleep/       The Absorption Company Sleep — packshot 7 sticks
│
├── landing/                visuels transverses : hero, logo, boucles des
│                           bandeaux, rendus de gélules
├── archivo/ritual/         produit retiré du catalogue, sources gardées
└── fotosyvideos2/          dépôt d'origine, laissé tel quel
```

Le nom du dossier est **le `handle` du catalogue** : `assets/promix-relax/` et
`deploy/media/productos/promix-relax/` parlent du même produit — l'un les
sources, l'autre les copies optimisées qui partent en production.

Les fichiers gardent le nom d'origine de la marque quand il est parlant ; les
rushes ont été renommés d'après la boucle qu'ils produisent
(`landing/loop-wearables.mp4` → `deploy/media/landing/bandas/loop-wearables.mp4`).

Les sources les plus récentes restent **non suivies** par git : le dépôt est
public et `assets/cirqa/documentos/` contient des documents revendeur
confidentiels — voir l'avertissement de `PROJECT_CONTEXT.md` §10 avant d'y
toucher.

Le lot de 41 visuels de marque reçu le 21/08/2026 a été **classé par produit**
(`cirqa/producto/`, `banda-cirqa/`, `venu-4/{producto,lifestyle,app}/`,
`creatina/`, `promix-*/`, `absorption-sleep/`) plutôt que laissé dans le
dossier fourre-tout où il est arrivé.

⚠️ **Vérifier le format sur l'emballage avant de publier un visuel de marque.**
Trois pièges rencontrés : `absorption-sleep/sleep-caja-14-sticks.png` montre un
étui de **14** sticks et `sleep-bolsa-28-dosis.png` un sachet de **28 doses**,
alors que la fiche vendait 7 sticks (d'où l'option Formato) ; à l'inverse le
sachet Promix porte bien « 30 × 5 g Stick Packs », c'est notre SKU.

---

## Travailler sur le site

### Lancer l'aperçu

```bash
npm run serve
```

### Après toute modification de `deploy/catalog.js`

```bash
npm run build
```

Les 10 fiches produit sont générées puis **commitées** (`buildCommand` est nul
côté Vercel). Oublier cette commande laisse les fiches périmées sans aucun
avertissement.

### Ajouter un produit

1. Ajouter l'entrée dans `PRODUCTS` (`deploy/catalog.js`) : `handle`, `name`,
   `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`,
   `specs` ; en option `badge`, `compareAt`, `colors`, `sizes`, `shopify`,
   `packshot`, `video`, `poster`, `videoRatio`, `story`.
2. Déposer ses visuels dans `deploy/media/productos/<handle>/`.
3. `node build/gen-products.js`.
4. L'ajouter à la main aux carrousels de la home (`data-handles` sur `#cards`,
   `#wear-grid` et `#sup-grid` dans `index.html`). Les rayons de `/tienda` et
   les pages `/wearables` et `/suplementos` le prennent tout seuls depuis sa
   `category` — rien à toucher de ce côté.
5. Mettre à jour le dock : nombre de produits et prix plancher.

### Règles qui font mal si on les ignore

- Ne **jamais** éditer `deploy/productos/*.html` à la main.
- Ne pas retirer `outputDirectory: "deploy"` de `vercel.json` : c'est ce qui
  garde `assets/` hors du site public.
- Ne pas réintroduire de vert : les variables `--teal-*` sont historiques, leurs
  valeurs sont des gris.
- Ne pas descendre le plancher d'opacité `--lg-fill` sous `.64` (lisibilité du
  texte sur photo), ni sortir le filtre `#lg-refract` de son garde Firefox.
  **Une exception assumée** : la pilule de nav est à `.08` de blanc pour
  disparaître sur la vidéo du hero. Son contraste tient au halo clair
  (`text-shadow`) derrière l'encre du logo, des liens et de l'icône panier —
  retirer le halo rend la nav illisible sur le feuillage.
- Ne pas rallonger le rythme vertical sans demander : `section` est à
  `clamp(22px,3.2vw,40px)`, les têtes de section à `clamp(12px,1.7vw,20px)`, les
  chapitres éditoriaux à `clamp(22px,2.9vw,40px)` sans réserver de hauteur
  d'écran. C'est un réglage demandé trois fois par le propriétaire.
- Les cartes de carrousel ont été **regrossies le 21/08/2026**, à la demande du
  propriétaire : `.fcard` est à `min(44vw,210px)` au large et `min(42vw,168px)`
  sous 720px. La boîte média est en `aspect-ratio:1`, donc c'est cette base de
  flex — et elle seule — qui commande la hauteur de la carte : la changer
  déplace aussi les marges des sections voisines.
- Ne pas dissocier les cartes d'objectif de la boucle Garmin Connect : les deux
  lisent le **même jeton**, `--media-box` (`clamp(260px,25vw,380px)`, 9/16).
  C'est une demande explicite du propriétaire — retoucher l'une sans l'autre
  casse l'accord.
- **Le site est en pleine page depuis le 22/08/2026** : `--gutter` vaut zéro à
  toutes les largeurs, `.shell` et `footer` n'ont plus ni largeur maximale, ni
  coins arrondis, ni ombre. La « carte blanche posée sur une toile grise » a
  été retirée à la demande du propriétaire — elle laissait deux bandes grises
  sur tout écran de plus de 1680px. C'est le contenu qui se borne
  (`.container`, 1500px), jamais la page.
- **Le fond du document est celui de `<body>`, pas de `<html>`.** C'est lui qui
  peint les zones de sécurité de l'iPhone — la bande derrière la caméra et
  celle sous la barre d'accueil. Il prend donc la couleur de ce qui commence
  la page : `body.has-hero` et `body.has-dark-top` (les deux rayons) le
  passent à l'encre, les autres pages le laissent blanc. Poser une couleur
  sur `<html>` rendrait ce choix impossible : une règle sur `<html>` ne peut
  pas lire une classe de `<body>`.
- La réserve du dock est portée par le **pied de page**, pas par `<body>` :
  sur `<body>` elle laissait voir le fond du document sur 90px sous le pied.
- Toute copie client est en espagnol (es-MX).
- Accessibilité : skip link, radiogroups ARIA, cibles tactiles ≥ 44 px,
  `prefers-reduced-motion`.

---

## Le hero

Deux boucles vidéo, deux comportements :

- **Desktop** — `hero-desktop.mp4` (736×414, 6 s, 416 ko), en `object-fit:cover`
  sur toute la hauteur disponible. Depuis le 22/08/2026 : c'était
  `hero-runners.jpg` avant, une photo qui portait le wordmark et la baseline
  **incrustés**. La vidéo ne les porte pas — ils sont repris en HTML dans
  `.hero-mark`, un bloc optiquement centré qui n'existe qu'au-dessus de 760px.
  Le fichier source est en 736 px de large : il est **agrandi 2 à 3,4 fois**
  selon l'écran, ce que son étalonnage sombre et son flou de profondeur rendent
  acceptable, mais qui reste un plafond de qualité.
- **Mobile (< 760px)** — `hero-mobile.mp4` en **plein écran** : `100dvh` avec
  `100svh` en repli pour suivre la barre d'adresse, bord à bord grâce à
  `margin-inline:-gutter`, la carte renonçant à sa marge haute, à son coin et à
  son clipping le temps de le laisser passer. La vidéo est en 9/16 : un écran
  plus étroit la rogne sur les côtés, le wordmark **y est toujours incrusté** et
  survit au recadrage. C'est pourquoi `.hero-mark` est masquée sous 760px : elle
  dédoublerait le wordmark. La baseline, elle, sort du cadre et est reprise par
  `.hero-tagline`, qui ne vit que sous ce seuil.

Aucune des deux boucles n'a **d'`autoplay` ni de `poster`** : les deux
déclenchent le téléchargement même quand l'élément est masqué, et chaque format
paierait la vidéo de l'autre. C'est `section-loops` qui lance la lecture à
l'entrée dans le cadre — donc jamais pour la boucle en `display:none` — et
chaque affiche est un fond CSS déclaré à côté de sa boucle.

## Les pages de rayon — `/wearables` et `/suplementos`

Deux pages autonomes, atteintes depuis la nav, qui **ne déclarent aucun
produit** : la grille se contente de nommer une catégorie et `app.js` la
remplit depuis `catalog.js`.

```html
<div class="cat-grid rv" id="grid-wearables" data-category="Wearables"></div>
```

Ajouter ou retirer un produit du catalogue met donc les deux pages à jour sans
qu'on y touche — le compte affiché à côté du titre (`data-count-for`) suit lui
aussi. Tout le reste est repris du reste du site : la carte `.prod`, les
bandeaux `.band`, la grille de garanties, la nav, le pied de page et le dock.

Deux ajouts propres à ces pages :

- **La barre de tri** (`.sort-chips`, module `cat-sort`) — Destacados, Precio ↑,
  Precio ↓. Elle **déplace** les cartes au lieu de les re-rendre : un re-rendu
  casserait l'observateur qui met les boucles produit en pause hors écran et
  ferait repartir chaque vidéo à zéro à chaque tri. L'état est porté par
  `aria-pressed`, que le CSS lit directement.
- **La passerelle de clôture** — un bandeau qui renvoie vers l'autre rayon.

Chaque page a sa propre boucle d'en-tête (`bandas/loop-wearables-hero.mp4`,
`bandas/loop-suplementos-hero.mp4`). Les bandeaux de la home et les passerelles
gardent `loop-wearables` et `loop-capsulas` : ce sont des fichiers distincts,
ne pas les fusionner.

L'en-tête de rayon tient lieu de hero, et **touche le haut de l'écran** — la
nav flottant dessus, comme sur la home. Sous 1024px il prend `100dvh` (`100svh`
en repli) ; au-dessus il reste à `clamp(440px,74vh,820px)`, contre
`clamp(360px,58vh,620px)` pour un bandeau de milieu de page.

Ça n'a pas toujours été le cas sur téléphone. Jusqu'au 22/08/2026 les deux
rayons tombaient dans `body:not(.has-hero) .shell` et se réservaient
`env(safe-area-inset-top) + 110px` de nav : la vidéo commençait à 120px du haut,
s'arrêtait à 74vh, et laissait au-dessus d'elle une bande d'encre morte où la
pilule flottait toute seule. C'est l'inverse de ce que fait whoop.com, dont la
vidéo part de y=0 et sur laquelle l'en-tête vient se poser. `body.has-dark-top
.shell{margin-top:0}` corrige les deux bouts d'un coup — plus de bande en haut,
plus de vidéo rognée en bas.

Deux conséquences à ne pas défaire :

- **Le haut du voile est retiré**, ici comme sur le hero — voir la section
  suivante. `.cat-head .band.deep::after` ne garde que le plancher du bas.
- **La réserve basse de `.band-inner`** compte le dock : à `100dvh` avec un
  contenu calé en bas, le bouton passait sous lui.

## Le haut de la vidéo n'est plus voilé

La nav n'ayant pas de surface propre, son encre était rendue lisible par un
**voile blanc à 42 %** posé sur les 30 premiers pour-cent du hero
(`.hero-full::before`) puis, brièvement, des bannières de rayon. Sur une vidéo
sombre et plate ce voile ne se voyait pas. Sur une vidéo qui a des zones claires
en haut — le plafond de bois du rayon wearables — il aplatissait les 250
premiers pixels en une bande uniforme : on ne lisait plus une vidéo qui commence
en haut de l'écran, mais **une zone vide posée au-dessus d'elle**.

Retiré des deux le 22/08/2026. Ne restent que les planchers du bas, sous les
textes. Le contraste de la nav est repris par **la pilule elle-même**, tant
qu'elle flotte sur le visuel d'ouverture :

```
body:not(.past-hero) .nav-pill   surface blanche .34 → .26 + liseré
```

Le raisonnement : le contraste se joue désormais sur les 350px de l'en-tête au
lieu des 250 premiers de l'image. La pilule est un en-tête, elle a le droit
d'avoir une surface — la référence, whoop.com, en a une complètement opaque.
Sur une page sans visuel d'ouverture, `past-hero` est posée d'entrée et la
pilule garde sa transparence d'origine : sur du contenu blanc, elle n'a besoin
de rien. Le passage de l'une à l'autre est adouci par une transition de .3s.

**`past-hero` couvre maintenant les rayons.** Jusque-là le module ne connaissait
que `#hero`, donc les deux rayons recevaient la classe d'entrée : le dock y
rééchantillonnait le fond de la bannière en permanence — exactement ce que
`body:not(.past-hero) .dock-shell` cherche à éviter — et la pilule n'avait aucun
moyen de savoir qu'elle flottait sur une vidéo. Le module prend désormais
`#hero` **ou** `.cat-head`, et mesure le bord haut de ce qui les suit
(`#contenido` ou `.cat-list`) : ni l'un ni l'autre n'est collant, donc la mesure
reste stable là où le hero, épinglé, ne dit plus où il finit.

## Défilement « feuille » — le hero ne défile pas

Relevé sur **whoop.com** le 22/08/2026 et repris à l'identique, sur les deux
formats. Le hero reste épinglé en haut de la fenêtre et c'est le contenu qui
monte **par-dessus** lui, comme une feuille opaque qui le recouvre. On ne le
voit pas partir : on le voit disparaître sous la page.

Trois règles suffisent, toutes dans `styles.css` :

```
body.has-hero .hero-full     position:sticky; top:0; z-index:0
body.has-hero #contenido     position:relative; z-index:1; background:var(--surface)
body.has-hero.past-hero .hero-full   position:relative
```

Ce que Whoop fait exactement pareil : un conteneur `sticky top:0 z-index:0` sous
des modules à fond opaque, et le relâchement du hero une fois dépassé. Ce qu'ils
font autrement : **aucune bibliothèque de défilement** — leur page est en scroll
natif, et **aucune révélation** à l'entrée dans le cadre (tous leurs blocs sont
à `opacity:1`). lowlabs garde Lenis et ses `.rv` : le geste est donc le même, la
sensation reste plus glissante que la leur.

`.shell` porte déjà `isolation:isolate`, donc ce `z-index` ne sort pas de la
carte — le pied de page, qui est hors de `.shell`, n'est pas concerné.

La troisième règle n'est pas cosmétique : sans elle le hero resterait composé et
sa vidéo en lecture derrière tout le reste de la page. Au moment du basculement
il est entièrement recouvert, le changement ne se voit pas.

**`past-hero` ne peut plus s'appuyer sur un `IntersectionObserver`.** Épinglé, le
hero ne quitte jamais le cadre. Le repère est devenu le bord haut de `#contenido`,
qui commence exactement là où le hero finit, et il est lu **par comparaison de
position**, pas par observation : un cadre d'observation réduit à un trait ne
notifie pas de façon fiable, et un témoin assez petit pour être précis se fait
enjamber par un élan. Aucune boucle n'est ajoutée pour autant — c'est Lenis, qui
en tient déjà une, qui publie la position ; sans Lenis (mouvement réduit) on
écoute le défilement natif en passif. `sync()` ne lit rien de la mise en page :
le seuil est mesuré à part, au chargement et au redimensionnement.

## Défilement fluide (Lenis)

Une **seule** instance, créée par le module `smooth-scroll` de `app.js` après
`/lenis.min.js`. Rien d'autre n'ouvre de boucle d'animation.

- `autoRaf: true` — la boucle de rendu est celle de Lenis, la seule de la page.
- `syncTouch: false` (défaut) — **le tactile reste natif** : inertie du système,
  pistes horizontales, galerie produit, aucun verrouillage.
- Lenis pilote la position réelle du document : `position:sticky`, les
  `IntersectionObserver` (révélations `.rv`, lecture des vidéos) et les surfaces
  fixes (nav, dock) fonctionnent sans adaptation.
- `prefers-reduced-motion` : l'instance n'est pas créée du tout, la page garde
  son défilement natif.
- `html.lenis{scroll-behavior:auto}` retire le glissement natif du CSS — deux
  systèmes animés se battraient sur la même page.

Trois points d'attention si on y touche :

1. **Molette horizontale** — Lenis appelle `preventDefault` sur les `wheel`
   qu'il traite. `app.js` lui coupe l'événement (et rien d'autre) quand le geste
   est franchement horizontal *au-dessus d'une piste* : `.cards`, `.goals`,
   `.gal-stage`, `.gal-thumbs`, `.rail-track`. La même liste est dans
   `styles.css` pour `overscroll-behavior-x`.
2. **Défilements programmés** — tout passe par `scrollToY()` (retour de galerie
   après changement de couleur, atterrissage sur `/tienda#rayon`, liens
   d'ancrage). Un `window.scrollTo` direct laisserait Lenis et la page se
   contredire le temps d'une image. Un troisième argument optionnel — `duration`
   en secondes et `easing` — sert aux trajets qui doivent **se voir** : Lenis
   prend alors le pas sur son lerp d'instance. C'est ce qui amène la
   recommandation des objectifs, en 1,1s et en quintique sortante.
3. **Tiroir du panier** — il pose `overflow:hidden` sur le corps ; `cart.js`
   appelle donc `LOWSCROLL.stop()` à l'ouverture et `.start()` à la fermeture,
   sinon Lenis avancerait sa position sur une page immobile et la rendrait d'un
   bloc à la fermeture.

---

## Déploiement

`vercel.json` est prêt (`outputDirectory: deploy`, `cleanUrls: true`,
`buildCommand: null`, en-têtes de sécurité). Le dépôt pousse sur
`github.com/megevanderwan2004-maker/lowbasemx`.

```bash
vercel --prod
```

## Panier et Shopify

**Les dix produits sont branchés.** Chaque fiche de `catalog.js` porte un bloc
`shopify` avec son handle et l'une des **trois formes** de table de variantes :

| Forme | Exemple | Écriture |
|---|---|---|
| Variante unique | Venu 3S, Relax | `shopify.variant = "id"` |
| Une option | Venu 4 (couleur), Sleep (format) | `shopify.variants[valeur] = "id"` |
| Deux options | CIRQA, Banda de repuesto | `shopify.variants[couleur][taille] = "id"` |

`LOWLABS.variantOf(p, couleur, taille)` (dans `catalog.js`) est le **seul**
endroit qui connaisse ces formes : la fiche, le bundle et le panier passent
tous par lui. Ne pas relire `shopify.variants` à la main ailleurs.

Une option peut aussi porter **son propre prix** — `sizes[i].price`, comme les
trois formats de Sleep. `LOWLABS.priceOf(p, couleur, taille)` le résout, et
`syncPrice()` dans `app.js` met à jour le prix affiché, le prix barré, le dock
et l'intitulé du bouton. Sans ça le client lirait 499 et paierait 1 599.

Le panier (`deploy/cart.js`) ne stocke que des **références de variantes** : le
nom, la photo et le prix sont relus du catalogue au rendu. Au moment de payer,
la liste part dans un **lien de panier Shopify** (`/cart/ID:QTE,…`) — la
boutique reconstruit le panier, applique ses prix, son stock et ses remises,
puis ouvre son propre checkout. Aucune logique de paiement n'est dupliquée ici.

Le bundle de chaque fiche (produit consulté + les deux premiers `pairs`) ajoute
les articles individuellement et joint le code **`BUNDLE10`** au lien : 10 % dès
3 articles, créé côté Shopify. La remise est donc appliquée par Shopify, jamais
simulée à l'écran.

Pour brancher un nouveau produit : le créer dans Shopify, relever le handle et
les IDs de variantes, ajouter le bloc `shopify` dans `catalog.js`, régénérer.

### Coloris, formats et vues produit

C'est **l'option qui pilote la galerie** : la couleur quand la fiche en a, sinon
le format s'il porte ses visuels — les trois étuis de Sleep ne se ressemblent
pas, choisir un format doit changer la photo. Le cadre porte `data-color` ou
`data-size` et le sélecteur fait glisser la piste jusqu'à lui.

Un coloris (ou un format) peut porter **plusieurs vues** : `colors[i].image`
— ou `sizes[i].image` — est la principale, `views[]` les suivantes. Toutes portent la couleur dans la galerie, si
bien que le sélecteur amène sur la première vue du coloris et que le geste
latéral fait défiler les autres avant de passer au coloris suivant. La CIRQA et
la Venu 4 ont trois vues par coloris (face, capteur au dos, profil).

L'intitulé de la seconde option se déclare : `sizeLabel: "Formato"` sur Sleep,
« Talla » partout ailleurs. Il est repris par la fiche, le dock et le panier.

### CIRQA — couleur, visuel et variante

Les quatre visuels de coloris sont les **rendus produit officiels Garmin**
(`res.garmin.com`, vue trois-quarts, 1200 × 1200, recadrés au plus près du
bracelet), servis en local depuis `deploy/media/productos/cirqa/` :

| Couleur (boutique) | Fichier | Numéro de pièce Garmin |
| --- | --- | --- |
| Negra | `cirqa-negra.jpg` | `010-04675-00` / `-10` (Noir) |
| Gris Francés | `cirqa-gris-frances.jpg` | `010-04675-01` / `-11` (Lin) |
| Malva | `cirqa-malva.jpg` | `010-04675-02` / `-12` (Rose) |
| Azul Capitán | `cirqa-azul-capitan.jpg` | `010-04675-03` / `-13` (Bleu Marine) |

Ces quatre teintes sont confirmées par les **SKU de la boutique** : la variante
« Gris Francés / L–XL » porte `010-04675-01`, que Garmin nomme *Lin*. Les
bracelets Oliva Oscuro, Azul Francés et Gris Lima sont d'**autres** teintes,
vendues séparément (voir la fiche `banda-cirqa`) — ne pas les confondre.

Chaque coloris a trois vues : `cirqa-<color>.jpg` (trois-quarts),
`-sensor.jpg` (capteur et LED) et `-perfil.jpg` (boucle ouverte).

La chaîne est : **pastille → `state.color` → cadre de galerie portant
`data-color` → variante Shopify** (`shopify.variants[couleur][taille]`). Aucune
image n'est échangée au clic : les cadres coexistent dans la piste, c'est elle
qui glisse. Sous 980px la page revient d'elle-même sur le visuel.

La fiche CIRQA déclare `shotFit: "contain"` : ce sont des rendus sur fond blanc,
le générateur pose donc `.contain` sur leurs cadres et vignettes pour que le
bracelet reste entier, jamais rogné.

Ce drapeau fait une seconde chose, moins évidente : `.gal-stage:has(.gal-frame
.contain)` passe le cadre au blanc. Sans lui le cadre garde `--surface-teal`, et
un packshot transparent s'y pose sur une plaque grise — ce qui se lit comme un
fond collé au produit. C'était le cas de Debloat jusqu'au 22/08/2026 : son PNG
était déjà détouré, le gris venait de la fiche. Tout produit dont le visuel
principal est un détourage doit donc déclarer `shotFit: "contain"`.

**Le bandeau de vignettes se fait glisser** (`dragScroll` dans app.js). Il
défilait déjà — `overflow-x:auto` — mais il ne fait que 48px de haut sur
téléphone : le navigateur devait décider dès les premiers pixels si le geste
revenait à la piste ou au défilement vertical de la page, et sur une bande aussi
mince il tranchait presque toujours pour la page. La classe `draggable`, posée
par le script et jamais dans le HTML, applique `touch-action:pan-y` — le vertical
reste au navigateur, l'horizontal passe au script. Sans `PointerEvent` la classe
n'est pas posée et la piste garde son défilement natif. Un glissement de plus de
4px avale le clic qui le suit, sinon relâcher le doigt changerait de vignette.
Le bandeau **suit aussi la piste** : `galFollow` centre la vignette active quand
l'image principale change, sans quoi arriver à la douzième image laissait le
bandeau sur les six premières.

> **En-tête du checkout** — le nom affiché en haut du checkout est le *nom de la
> boutique* Shopify, aujourd'hui « My Store ». Il se change dans
> Réglages → Détails de la boutique ; un logo de checkout le remplace
> visuellement (Réglages → Checkout → Marque).
