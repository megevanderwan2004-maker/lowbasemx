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
│   ├── stamp-assets.js     empreinte ?v=<sha1> sur les fichiers servis
│   ├── card-shots.py       normalise les visuels de carte (card.png)
│   ├── cutout.swift        détoure un packshot sur fond transparent
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
│   ├── hero/                   hero-desktop.jpg, la photo (au-dessus de 760px,
│   │                           depuis le 03/09/2026), hero-mobile.mp4 + son
│   │                           affiche (plein écran sous 760px). hero-runners.jpg
│   │                           et hero-desktop.mp4 : anciens visuels desktop,
│   │                           le premier conservé mais plus référencé, le
│   │                           second supprimé le 03/09/2026 avec son affiche
│   ├── objetivos/              les 3 boucles de l'assistant + leurs affiches
│   ├── bandas/                 boucles des bandeaux pleine largeur + affiches
│   │                           (dont les deux en-têtes `loop-*-hero` des rayons,
│   │                           servies au TÉLÉPHONE seulement depuis le
│   │                           03/09/2026) ; banda-wearables.jpg, le bandeau
│   │                           #wearables de la home ; cat-suplementos.jpg et
│   │                           cat-wearables.jpg, les en-têtes des deux rayons
│   │                           sur ORDINATEUR. loop-wearables.mp4 et
│   │                           loop-capsulas.mp4 restent utilisées : la première
│   │                           par les passerelles de clôture, la seconde par le
│   │                           bandeau #suplementos de la home
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
- **Un visuel de marque en `_160x` est une vignette, pas une source.** Les
  boutiques Shopify servent leurs images sous plusieurs tailles, et un clic
  droit sur une page produit attrape souvent la vignette de 160px — six fois
  trop petite pour une galerie, qui affiche jusqu'à 900. L'original s'obtient
  du catalogue public de la boutique :

  ```bash
  curl -s "https://<boutique>/products/<handle>.json" | python3 -m json.tool
  ```

  `images[].src` y donne l'adresse pleine taille, et `width`/`height` la
  vérifient avant téléchargement. C'est ainsi que les trois vues de Relax ont
  été récupérées en 1200x1500 le 23/08/2026, à la place de vignettes 160x200.
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

### Après toute modification de `deploy/catalog.js`, `styles.css` ou `app.js`

```bash
npm run build
```

Deux étapes enchaînées :

1. `gen-products.js` régénère les 10 fiches produit ;
2. `stamp-assets.js` colle `?v=<empreinte>` sur les assets partagés
   (`styles.css`, `app.js`, `catalog.js`, `cart.js`, `lenis.min.js`) dans les
   14 pages.

Le tout est **commité** — `buildCommand` est nul côté Vercel. Oublier cette
commande laisse les fiches périmées *et* les anciennes empreintes en place,
sans aucun avertissement.

**Pourquoi l'empreinte.** Les pages appelaient `/styles.css` tout court. Les
en-têtes disent pourtant `max-age=0, must-revalidate` — mais Safari iOS ressert
volontiers sa copie sans repasser par le réseau, surtout dans un onglet resté
ouvert. Le 22/08/2026, trois déploiements corrects d'affilée sont restés
invisibles sur un iPhone pour cette seule raison : le site était juste, le
téléphone regardait autre chose. Une URL différente étant une autre entrée de
cache, il suffit que l'adresse change quand le contenu change. Le script est
idempotent : relancé, il remplace l'empreinte au lieu de l'empiler.

### Ajouter un produit

1. Ajouter l'entrée dans `PRODUCTS` (`deploy/catalog.js`) : `handle`, `name`,
   `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`,
   `specs`, `keywords` ; en option `badge`, `compareAt`, `colors`, `sizes`,
   `shopify`, `packshot`, `card`, `shotFit`, `video`, `poster`, `videoRatio`,
   `story`. `keywords` est ce sur quoi la recherche s'appuie — espagnol,
   anglais et les fautes de frappe probables ; `card` est ce que montrent
   tous les carrousels et toutes les grilles.
2. Déposer ses visuels dans `deploy/media/productos/<handle>/`, puis
   `python3 build/card-shots.py` pour son `card.png`.
3. `npm run build`.
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
- **Ne pas remettre un fond de section derrière un carrousel.** Les tuiles
  produit sont à `--tile` (`#f1f2f3`) ; toute section teintée en dessous de
  `#f6f7f8` les fait disparaître. C'est ce qui est arrivé aux rayons de
  `/tienda`, dont le fond alterné a été retiré le 03/09/2026.
- Ne pas dissocier les cartes d'objectif de la boucle Garmin Connect : les deux
  lisent le **même jeton**, `--media-box` (`clamp(260px,25vw,380px)`, 9/16).
  C'est une demande explicite du propriétaire — retoucher l'une sans l'autre
  casse l'accord. Depuis le 24/08/2026 la largeur du plateau des objectifs
  (`.goals-stage`) se **calcule** à partir de ce jeton — `3 × --media-box +
  2 × --goals-gap`, soit exactement trois cartes — pour que la boîte soit la
  même carrousel fermé et panneau ouvert. Changer `--media-box` reste donc
  légitime, mais le plateau suivra.
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

Un format par écran, et depuis le 03/09/2026 les deux ne sont plus de la même
nature :

- **Desktop** — `hero-desktop.jpg` (1366×911), posée en **fond CSS** sur
  `.hero-shot-desktop` et non en balise `<img>` : sous 760px, un `<img>` en
  `display:none` est tout de même téléchargé, alors qu'un fond CSS sur un
  élément masqué ne l'est jamais — le téléphone ne paie donc rien pour elle.
  `object-position` est remontée à **50% 42%** : le sujet (deux têtes) est dans
  le premier quart du cadre, `cover` sur un cadre plus large que haut aurait
  sinon rogné le haut. C'était une boucle vidéo jusqu'au 03/09/2026
  (`hero-desktop.mp4`, retirée avec son affiche `poster-hero-desktop.jpg`,
  devenues orphelines) ; avant elle, `hero-runners.jpg`, une photo qui portait
  le wordmark et la baseline **incrustés** — ni la vidéo ni la photo actuelle
  ne les portent, ils sont repris en HTML dans `.hero-mark`, un bloc
  optiquement centré qui n'existe qu'au-dessus de 760px.
- **Mobile (< 760px)** — reste `hero-mobile.mp4`, en **plein écran** : `100dvh`
  avec `100svh` en repli pour suivre la barre d'adresse, bord à bord grâce à
  `margin-inline:-gutter`, la carte renonçant à sa marge haute, à son coin et à
  son clipping le temps de le laisser passer. La vidéo est en 9/16 : un écran
  plus étroit la rogne sur les côtés, le wordmark **y est toujours incrusté** et
  survit au recadrage. C'est pourquoi `.hero-mark` est masquée sous 760px : elle
  dédoublerait le wordmark.

**Le `<link rel="preload">` du `<head>` doit cibler `hero-desktop.jpg`, pas
`poster-hero-desktop.jpg`.** Le second est l'affiche de l'ancienne boucle : le
lien continuait à le viser après le passage à la photo, si bien que le vrai
visuel n'était découvert qu'à la lecture de la feuille de style — retardant le
LCP — pendant que 43 ko partaient sur un fichier que plus personne n'affiche.
Corrigé le 03/09/2026 ; à vérifier après tout futur changement du hero desktop.

**Ordre du hero depuis le 23/08/2026** : wordmark, puis les **deux actions**,
puis la baseline. Elles étaient sous elle ; ce sont pourtant elles qu'on vient
chercher, la baseline n'est qu'une signature. `.hero-mark` ne porte donc plus
que le wordmark, `.wordmark-sub` a quitté le hero, et `.hero-tagline` porte la
baseline **aux deux formats** — elle était masquée au-dessus de 760px et reprend
maintenant la graduation de `.wordmark-sub` dans cette requête média.

Les deux actions mènent à **`/suplementos`** et **`/wearables`**, les pages, et
non aux ancres `#suplementos` / `#wearables` de l'accueil. Les sections gardent
leurs identifiants pour qui arrive par un lien profond.

La boucle mobile n'a **ni `autoplay` ni `poster`** : les deux déclencheraient
son téléchargement même masquée. C'est `section-loops` qui lance sa lecture à
l'entrée dans le cadre, et son affiche est un fond CSS posé à côté d'elle —
jamais demandée sur desktop, qui ne voit pas cette vidéo.

### Les bandeaux et en-têtes en photo (03/09/2026)

**Sur la home, un seul bandeau est passé à la photo : `#wearables`.**
`#suplementos` a repris sa boucle des capsules (`loop-capsulas.mp4`) le soir
même — la photo qui l'occupait quelques heures est partie servir d'en-tête au
rayon `/suplementos`, où elle a plus de place.

**Sur les deux pages de rayon, l'en-tête est une photo sur ordinateur et
reste une boucle sur téléphone** : `cat-suplementos.jpg` (la femme au
supplément) et `cat-wearables.jpg` (la salle de spinning). Le mécanisme est
celui du hero, pour la même raison — la photo est un **fond CSS** sur
`.cat-head .band-photo`, jamais une balise `img`, parce qu'un `<img>` en
`display:none` est tout de même téléchargé ; et la boucle a perdu son
`autoplay` et son `poster`, qui déclenchaient son chargement sur ordinateur
alors qu'elle y est masquée. Vérifié : sur ordinateur la page ne demande que
les 190 ko de la photo, la boucle de 5 Mo reste à `readyState 0`.

`band-photo` et non `band-shot` : ce dernier existe déjà sur la home comme
**modificateur** du bandeau (`.band.band-shot`), pas comme enfant.

Ce qui suit ne concerne donc plus que le bandeau `#wearables` de la home :

`#wearables` sur `index.html` — pas la passerelle de clôture des rayons, qui
reste en vidéo. C'est un `.band.band-shot` avec une simple `<img
fetchpriority="low" loading="lazy">` à la place du `<video autoplay>` :
`banda-wearables.jpg`, la personne sur son tapis, cadrée à `center 34%` — un
cadrage centré lui coupait la tête, le bandeau étant bien plus large que haut.
`.band>img` réutilise la règle `object-fit:cover` déjà écrite pour
`.band>video` ; le voile en dégradé (`.band::after`) et le texte par-dessus
n'ont pas changé.

## Écran de chargement — `#boot`

**Nouveau le 03/09/2026.** Il règle un problème précis : les boucles du site
sont en `preload="none"` (voir plus haut), donc celle du hero ne commençait à
se charger qu'au moment où on la regardait — sur téléphone, une seconde ou
deux d'affiche fixe puis un démarrage sec. L'écran d'ouverture existe pour que,
pendant qu'il est là, la boucle visible soit réellement chargée puis **lancée
en coulisses** : au moment où il s'efface, la vidéo tourne déjà.

**Il se déclenche à CHAQUE chargement** — rechargement compris, et à chaque
passage d'une page à l'autre. Il n'y a plus de mémoire de session : chaque
page a ses propres visuels et sa propre boucle à préparer, il n'y a rien
qu'une page précédente aurait déjà chargé pour elle. Un script en ligne et
synchrone dans le `<head>` (donc AVANT la première peinture — posé dans
`app.js`, qui est `defer`, la page aurait eu le temps de se peindre puis
d'être recouverte) pose `html.className += " booting"`, et se munit d'un
filet de 5 secondes : si `app.js` ne démarrait pas, l'écran ne doit jamais retenir le
site. Il est dupliqué sur les cinq gabarits de page (`index.html`,
`tienda.html`, `wearables.html`, `suplementos.html`, `gen-products.js`) — pas
un seul point d'entrée, puisqu'il doit s'exécuter avant tout script externe.

Le module `boot` d'`app.js` fait le reste :

- **Trois étapes pondérées**, pas un minuteur : polices prêtes
  (`document.fonts.ready` — les révéler avant ferait sauter les titres d'une
  police de repli vers la bonne), page + images de premier écran chargées
  (`load`), et **la boucle réellement affichée** rendue jouable
  (`canplay`/`loadeddata`, avec `preload="auto"` demandé explicitement
  puisqu'elle est en `"none"` par défaut). `firstLoop()` ne cible que la vidéo
  dont `offsetParent` n'est pas nul — le hero en déclare deux, une par format,
  l'autre est en `display:none`.
- **La barre avance quand même** si une étape traîne : un plancher lié au
  temps la fait progresser, plafonné à 88 % pour que les derniers pour-cent
  restent la preuve d'un vrai chargement terminé plutôt qu'une convention.
- **Elle ne retient jamais plus de 5 secondes**, quoi qu'il arrive — un réseau
  lent doit dégrader l'écran, pas bloquer l'accès au site.
- **La boucle est lancée AVANT que l'écran ne s'efface, et on attend qu'elle
  joue vraiment.** C'est le point de tout le dispositif — et c'est là que le
  premier jet se trompait. `play()` renvoie une promesse qui peut être
  **rejetée**, et elle l'était en silence : sur Safari iOS l'écran se levait
  sur une image fixe, définitivement. Rien ne réessayait, parce que
  `section-loops` observe l'intersection et que celle-ci n'avait pas changé —
  la boucle était déjà dans le cadre, simplement recouverte par l'écran
  blanc. Trois filets désormais : on attend l'événement `playing` (plafonné à
  900 ms) avant de lever ; on relance jusqu'à huit fois toutes les 450 ms
  après la levée, pour le cas d'un réseau lent ; et on relance une dernière
  fois **au premier geste**, seule issue en mode économie d'énergie iOS, où
  toute lecture automatique est refusée même muette.
- **Les images du premier écran passent en `eager`.** Second défaut rapporté
  depuis iOS : des visuels apparaissaient encore après la levée. Ce ne sont
  pas des images lentes, ce sont les cartes des carrousels, injectées en
  `loading="lazy"` — et sous l'écran d'ouverture, personne ne s'en approche
  pour déclencher leur chargement. Ce qui tient dans les **1,4 écran** du
  haut (14 images au plus) est donc forcé en `eager` et attendu ; au-delà, la
  paresse reste souhaitable, le reste du catalogue n'a pas à être payé à
  l'ouverture.

**Mouvement réduit : pas de théâtre.** Toute la mise en scène — barre amortie,
plancher de temps, lancement différé — n'existe que pour cacher le démarrage
d'une vidéo qui ne va de toute façon pas jouer pour ces visiteurs
(`section-loops` les fige sur l'affiche). La maintenir imposerait une attente
sans contrepartie à qui a demandé explicitement moins d'animation, pas plus
de patience. Le module révèle donc dès que la page et les polices sont prêtes,
sans barre ni délai plancher — voir `if (reduceMotion){ ... return; }` en tête
du module, avant que la barre n'existe.

`html.booting` bloque le défilement (`overflow:hidden`) et met Lenis en pause
(`LOWSCROLL.stop()` / `.start()`) — même précaution que le tiroir du panier et
le panneau de recherche : sans elle, la page aurait avancé derrière l'écran et
rendrait le décalage d'un bloc à la levée.

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

## Les cartes produit — une seule tuile pour tout le site

Refonte du 03/09/2026. Il y avait deux langages : les produits **flottaient**
sur le blanc dans les carrousels de la home, et posaient sur un dégradé gris
dans les cartes encadrées de la boutique. Il n'y en a plus qu'un.

- **Un jeton, `--tile` (`#f1f2f3`)**, porte le fond de TOUS les visuels
  produit — carte flottante, carte encadrée, vignette de recherche.
- **Le gris porte la carte ENTIÈRE, du visuel au prix** (03/09/2026, second
  passage). Le visuel n'a plus de fond propre : en poser un second
  dessinerait un rectangle dans le rectangle. La surface blanche et l'ombre
  de `.prod` partent avec — deux familles de cartes sur la même page ne
  peuvent pas avoir deux fonds.
- **Le texte est calé à gauche.** Centré, le prix et le bouton d'ajout se
  disputaient l'axe médian.
- **Un bouton rond d'ajout au panier** ferme la ligne de prix, dans les deux
  gabarits. C'est la seule surface colorée de la carte : c'est ce qui en
  fait une commande et non une décoration. La carte n'est donc plus un
  `<a>` unique — un `<button>` imbriqué dans un `<a>` serait invalide : le
  lien couvre la carte par un pseudo-élément étiré et le bouton repasse
  au-dessus par son `z-index`.
- **Le fond alterné des rayons de `/tienda` a été retiré.** Il valait
  `--surface-teal` (`#f3f4f5`), soit deux points d'écart avec la tuile : les
  tuiles y disparaissaient purement et simplement, et le même carrousel
  n'avait pas le même aspect selon sa place dans la page.
- **Plus aucune vidéo dans une carte.** Certaines boucles tournaient, les
  autres non : deux cartes immobiles et une qui bouge suffisent à casser une
  rangée. Les boucles restent sur les fiches produit, où elles ont la place.
- **L'ombre portée a disparu** avec le fond blanc : elle servait à décoller
  un packshot, sur une tuile elle ne fait plus qu'un halo sale au bord.
- **Le surtitre porte ce que le nom ne dit pas** : la catégorie sur la carte
  encadrée (qui affiche le nom complet, marque comprise), la marque sur la
  carte qui flotte (qui n'affiche que le nom court). Même emplacement, même
  typographie — c'est la cohérence visuelle qui compte, pas l'uniformité du
  contenu.

### `card` — le seul champ qui commande un visuel de carrousel

`cardShot()` lit `card`, puis `packshot`, puis `image`. Corriger ce qu'un
carrousel montre se fait donc dans `catalog.js`, et nulle part ailleurs.

Les dix `card.png` sont fabriqués par **`build/card-shots.py`**, lancé à la
main (il demande Pillow, que le build Node n'utilise pas) :

```bash
python3 build/card-shots.py
```

Il recadre chaque source sur son contenu réel et la repose au centre d'un
carré, avec la même réserve pour toutes — 88 % du cadre. Les packshots
venaient de six studios et occupaient de 55 % à 94 % de leur fichier, ce qui
se lisait comme un défaut d'échelle d'une tuile à l'autre. **Les sources ne
sont jamais touchées**, le script écrit un `card.png` à côté.

Cinq visuels ont aussi été corrigés à la source :

- **Venu 4** : la carte montrait `venu-4.png`, le rendu au bracelet **cuir
  beige**, alors que la fiche ouvre sur le coloris **Crema**, blanc. Le
  client ne retrouvait pas ce qu'il avait vu. La carte lit maintenant
  `venu-4-crema.jpg`.
- **Promix Debloat** : la carte montrait `debloat-trio.jpg`, trois sticks
  **tous orange**. C'est l'image 3 de la galerie (`debloat-sobres.jpg`) qui
  est la bonne — elle montre les trois parfums, mangue, pêche blanche et
  orange.

- **CIRQA** montrait la Malva en carrousel alors que sa fiche ouvre sur la
  Negra. Le client voyait un bracelet mauve, cliquait, tombait sur un noir.
- **Non-GMO Creatine** gardait l'ombre de studio en bas à gauche, que
  `mix-blend-mode:multiply` transformait en salissure sur le gris. Redétourée
  avec `build/cutout.swift` (`dist`, 14/26).
- **La bande de rechange** ne montre plus que le bleu. Ses sept coloris
  restent sur sa fiche, où ils se choisissent.

---

## La recherche — `#search-panel`

Ajoutée le 03/09/2026 ; il n'y en avait aucune. Le loupe de la nav ouvre une
nacelle de verre qui suggère pendant la frappe.

**Aucun service externe, aucun index.** Tout vient de `catalog.js`, qui
expose `LOWLABS.search()` et `LOWLABS.searchAisles()`. Chaque produit est
aplati une fois au chargement en une liste de mots — nom, nom court, marque,
catégorie, accroche et un champ `keywords` (espagnol **et** anglais : le
catalogue est en es-MX mais les noms de molécules circulent en anglais).

Quatre comportements à connaître avant d'y toucher :

- **Les accents et la casse sont neutralisés.** « sueño », « SUENO » et
  « sueno » sont la même requête — indispensable en espagnol.
- **Tous les mots de la requête doivent trouver preneur.** « creatina
  promix » ne remonte pas la créatine Cymbiotika juste parce que
  « creatina » correspond.
- **La tolérance aux fautes est étroite** : une seule substitution, et
  seulement sur les mots d'au moins quatre lettres. Au-delà, « venu »
  remonterait « menu ».
- **Le poids dit la qualité de la correspondance**, pas sa quantité : mot
  entier (10) > début de mot (7) > fragment (4) > faute rattrapée (3), plus
  un bonus au produit dont le nom commence par la requête.

Le panneau fige le corps, donc **il arrête Lenis** comme le tiroir du panier.
Sans ça, Lenis avance sa position sur une page immobile et la rend d'un bloc
à la fermeture.

---

## Les recommandations — `LOWLABS.recommend()`

Centralisées dans `catalog.js` le 03/09/2026. `pairs` (par produit) et `also`
(par objectif) restent la préférence éditoriale : ce qu'on **aimerait**
proposer. Mais plus rien ne sort sans passer par le filtre.

**Groupes exclusifs** — deux produits d'un même groupe répondent au même
besoin ; les montrer ensemble ne complète rien, ça demande au client
d'arbitrer à notre place. Ils ne peuvent ni se recommander l'un l'autre, ni
cohabiter dans une liste :

| Groupe | Pourquoi |
|---|---|
| Sleep ↔ Relax | Les deux formules du soir. **Règle dure demandée par le propriétaire** : consulter l'une ne doit jamais proposer l'autre. |
| Les deux créatines | Même molécule, deux marques : c'est un choix, pas un complément. |
| Venu 4 / Venu 3S / Vívoactive 6 | Proposer une seconde montre à qui en regarde une déjà, c'est la lui faire remettre en question. |

**Complémentarité** — aucune catégorie ne prend toute une liste de trois. En
dessous, le plafond ne s'applique pas : sur deux compléments, exiger deux
catégories différentes écarterait un second supplément pertinent pour aller
chercher un accessoire qui l'est moins.

Le bundle des fiches produit ne lit plus `data-handles` : il appelle
`recommend()`. Une page **générée avant** qu'une règle existe la respecte donc
quand même — c'est tout l'intérêt de ne plus figer les compléments dans le
HTML.

---

## L'assistant par objectif — `#objetivo`

Trois cartes, une boucle muette chacune, au gabarit de la boucle Garmin Connect
(`--media-box`, 9/16). C'est la **seconde entrée** de la home : qui n'a rien
reconnu dans « Los más buscados » part de ce qu'il veut ressentir, pas d'un
produit.

**Depuis le 24/08/2026, ouvrir une carte retire les deux autres et prend leur
place.** Avant, la recommandation se posait *sous* les trois cartes, qui
restaient là : on répondait à la question sans jamais refermer la question.

### La boîte ne change jamais

Tout tient à un plateau, `.goals-stage`, dont la largeur se calcule :

```css
max-width: min(calc(var(--media-box) * 3 + var(--goals-gap) * 2), 100%);
```

Soit exactement trois cartes plus deux gouttières. Fermé, la piste l'occupe
entièrement ; ouvert, la carte choisie garde son gabarit et le panneau prend le
rectangle libéré par les deux autres. Mesuré à 1440px : la carte 3 voyage de
918 à **162**, la place exacte de la carte 1, et le panneau occupe **540 →
1278**, du bord gauche de la carte 2 au bord droit de la carte 3.

C'est ce qui permet de **ne pas déplacer la page au clic** — et c'est aussi
pour ça que la première carte ne bouge pratiquement pas quand c'est elle qu'on
ouvre.

### La chorégraphie

Elle est **décrite en CSS** (`.is-leaving`, `.is-open`, `.is-in`, `.is-coming`,
`.is-folding`) et seulement **déclenchée** en JS. La seule chose que le script
calcule est le FLIP, qui a besoin de mesures réelles.

| | Aller | Retour |
|---|---|---|
| les deux autres | sortent vers l'extérieur, 240 ms, décalage 40 ms | reviennent de l'extérieur, 280 ms |
| la carte choisie | FLIP jusqu'à la place de la première, 400 ms | 260 ms |
| le panneau | essuyage + lignes en cascade, démarre **pendant** le trajet | s'efface d'un bloc, 160 ms |

Le recouvrement de l'aller — le panneau s'ouvre avant que la carte soit arrivée
— est ce qui empêche la séquence de se lire comme trois étapes. Le retour est
plus court que l'aller : un retour ne se contemple pas.

Sous 720px la carte ne voyage pas, elle **se replie** : 340 ms de la carte
portrait à un bandeau de 92px, la boucle recadrée par `object-fit:cover` donc
jamais déformée, et le panneau prend toute la largeur dessous. Deux propriétés
animées sur un seul élément dont l'unique enfant est en position absolue —
c'est assez peu pour tenir la fréquence d'images sur téléphone.

### Ce que le geste a changé dans le balisage

Les cartes **ne sont plus des boutons radio**. Cocher une option parmi trois et
en ouvrir une ne sont pas le même acte : elles portent maintenant
`aria-expanded` et `aria-controls`, et le tabindex tournant a disparu.

Conséquence directe : **les flèches ne font plus que déplacer le focus.** Elles
sélectionnaient, ce qui déclencherait aujourd'hui trois ouvertures pour
traverser la piste. Entrée ou Espace ouvre.

### Ajouter au panier depuis une carte

Un seul écouteur, posé sur le document : les cartes sont injectées par
plusieurs modules et re-rendues au tri des rayons, un écouteur par bouton
serait perdu à chaque nouveau rendu.

Depuis une carte, **personne n'a choisi de coloris ni de taille**. On prend
donc les premiers du catalogue — la convention du bundle — et c'est le
tiroir qui s'ouvre derrière en affichant la combinaison retenue, de sorte
que le client la VOIT et peut la corriger sur place. Un produit dont la
variante ne se résout pas n'est jamais ajouté en silence : on l'envoie sur
sa fiche.

Le disque vire au vert une seconde et demie après l'ajout : le tiroir
s'ouvre par-dessus, mais s'il est refermé aussitôt il doit rester une trace
de ce qui vient de se passer.

**Le visuel du panier suit désormais le coloris de la ligne.** Sans ça, une
CIRQA Negra s'affichait avec le packshot Malva — le sélecteur disait
« Negra » juste à côté d'un bracelet mauve.

---

### Quatre façons de revenir

Toutes passent par le même `closeGoal()` :

1. le lien « ← Volver a los objetivos », au-dessus du panneau ;
2. la touche Échap, où que soit le focus dans le plateau ;
3. un clic n'importe où hors du plateau ;
4. la carte ouverte elle-même — c'est un bouton d'ouverture, il bascule dans
   les deux sens.

Le focus repart sur la carte à la fermeture, y compris quand il était sur le
lien de retour au moment où celui-ci disparaît.

### L'URL porte le choix

`#objetivo=dormir`, posé en **`replaceState`** : le lien est partageable et une
campagne peut viser un objectif, sans que celui qui les essaie tous les trois
doive appuyer quatre fois sur « précédent » pour quitter le site.

À l'atterrissage direct, le module prend `history.scrollRestoration` en
`manual` le temps du calage puis la rend sur `load` — le navigateur repose la
page où elle était **après** le premier calage, et l'avalait.

### Le glissement de page est devenu conditionnel

`settle()` cale la **section** plutôt que le seul plateau, pour que la question
reste lisible au-dessus de sa réponse ; il se rabat sur le plateau seul quand
la section ne tient pas sous la nav, ce qui n'arrive guère qu'au téléphone. Et
surtout : **il ne fait rien quand le plateau est déjà entièrement à l'écran.**
Puisque la boîte ne change pas, il n'y a le plus souvent rien à rattraper au
large — bouger la page serait gratuit, et agaçant pour qui essaie les trois
objectifs l'un après l'autre.

Un arbitrage assumé : sur téléphone, le nom, la raison, le prix et le bouton
tiennent au-dessus de la ligne de flottaison, mais les compléments dépassent
d'environ 80px. C'est voulu — ce dépassement dit qu'il y a une suite. Tout
faire tenir demanderait de sacrifier la mise en page centrée du panneau mobile.

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

Trois règles suffisent, toutes dans `styles.css`, et elles couvrent **les trois
pages qui ouvrent sur un visuel** — l'accueil et les deux rayons :

```
body.has-hero .hero-full, body.has-dark-top .cat-head       position:sticky; top:0; z-index:0
body.has-hero #contenido, body.has-dark-top #contenido      position:relative; z-index:1; background:var(--surface)
…même paire de sélecteurs pour le relâchement en .past-hero  position:relative
```

**La moitié du montage est dans le HTML** : le visuel d'ouverture est placé
HORS de `<main>`, comme frère de celui-ci à l'intérieur de `.shell`. C'est vrai
du hero de l'accueil depuis toujours, et des bannières de rayon depuis le
22/08/2026 — elles étaient jusque-là la première `<section>` DANS `main`. Sans
ce déplacement, le contenu serait leur frère à l'intérieur de `main` et il
faudrait rendre opaque chaque section une par une pour qu'aucune ne laisse voir
la bannière épinglée derrière elle. Un `<header class="cat-head">` sorti de
`main` règle le tout d'un coup.

Aucune règle CSS ne dépendait de la place de `.cat-head` dans `main` — vérifié
avant le déplacement.

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
   recommandation des objectifs, en 1,1s et en quintique sortante. Depuis le
   24/08/2026 ce trajet est **conditionnel** : le plateau des objectifs garde
   la même boîte ouvert et fermé, il n'y a donc le plus souvent rien à
   rattraper au large et la page ne bouge pas.
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
