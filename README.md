# lowlabs — boutique wellness & tech (es-MX)

Site statique de **lowlabs**, revendeur mexicain de wearables Garmin et de suppléments
sélectionnés (Cymbiotika, Promix, The Absorption Company). Contenu en espagnol,
prix en MXN. Aucun framework, aucune dépendance npm : du HTML, du CSS et du
JavaScript ES5-compatible, servis tels quels par Vercel.

- **Dossier déployé** : `deploy/` (c'est le seul dossier servi en production)
- **Source de vérité produits** : `deploy/catalog.js`
- **Aperçu local** : `node build/serve.js 4175` → http://localhost:4175

---

## Structure du dépôt

```
.
├── deploy/                 ★ le site déployé
│   ├── index.html          home
│   ├── tienda.html         boutique (/tienda)
│   ├── productos/          9 fiches produit — GÉNÉRÉES, ne pas éditer à la main
│   ├── catalog.js          produits + objectifs : prix, textes, specs, médias
│   ├── cart.js             panier + tiroir, hand-off vers le checkout Shopify
│   ├── app.js              tout le comportement, en modules isolés
│   ├── styles.css          design system complet
│   └── media/              images et vidéos du site (voir plus bas)
│
├── build/
│   ├── gen-products.js     génère deploy/productos/*.html depuis catalog.js
│   └── serve.js            serveur d'aperçu, reproduit les cleanUrls de Vercel
│
├── assets/                 sources brutes non servies (voir plus bas)
├── assets-hd/              versions HD + tables d'URL CDN
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
│   └── absorption-sleep/       packshot 7 sticks
│
├── landing/
│   ├── hero/                   hero-runners.jpg (desktop), hero-mobile.mp4
│   │                           + son affiche (plein écran sous 760px)
│   ├── objetivos/              les 3 visuels de l'assistant « Tu objetivo »
│   ├── bandas/                 boucles des bandeaux pleine largeur + affiches
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
  carrousels. Sans packshot, un produit y apparaît avec un rectangle blanc.
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

---

## Travailler sur le site

### Lancer l'aperçu

```bash
node build/serve.js 4175
```

### Après toute modification de `deploy/catalog.js`

```bash
node build/gen-products.js
```

Les 9 fiches produit sont générées puis **commitées** (`buildCommand` est nul
côté Vercel). Oublier cette commande laisse les fiches périmées sans aucun
avertissement.

### Ajouter un produit

1. Ajouter l'entrée dans `PRODUCTS` (`deploy/catalog.js`) : `handle`, `name`,
   `short`, `brand`, `tagline`, `price`, `category`, `image`, `highlights`,
   `specs` ; en option `badge`, `compareAt`, `colors`, `sizes`, `shopify`,
   `packshot`, `video`, `poster`, `videoRatio`, `story`.
2. Déposer ses visuels dans `deploy/media/productos/<handle>/`.
3. `node build/gen-products.js`.
4. L'ajouter à la main aux carrousels de la home (`data-handles` sur `#cards` et
   `#sup-grid` dans `index.html`). Les rayons de `/tienda` le prennent tout seuls
   depuis sa `category`.
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
  `clamp(30px,4.4vw,56px)`, les têtes de section à `clamp(16px,2.2vw,26px)`, et
  les chapitres éditoriaux ne réservent plus de hauteur d'écran. C'est un
  réglage demandé deux fois par le propriétaire.
- Toute copie client est en espagnol (es-MX).
- Accessibilité : skip link, radiogroups ARIA, cibles tactiles ≥ 44 px,
  `prefers-reduced-motion`.

---

## Le hero

Deux visuels, deux comportements :

- **Desktop** — `hero-runners.jpg`, wordmark et baseline incrustés, dans la
  carte à coins arrondis. L'image est portée par un `<source>` : sous 760px
  aucune source ne correspond et seul un GIF transparent d'un pixel est chargé,
  le mobile ne paie donc pas ses 172 ko.
- **Mobile (< 760px)** — `hero-mobile.mp4` en **plein écran** : `100dvh` avec
  `100svh` en repli pour suivre la barre d'adresse, bord à bord grâce à
  `margin-inline:-gutter`, la carte renonçant à sa marge haute, à son coin et à
  son clipping le temps de le laisser passer. La vidéo est en 9/16 : un écran
  plus étroit la rogne sur les côtés, le wordmark est centré et y survit.

La boucle n'a **ni `autoplay` ni `poster`** : les deux déclenchent le
téléchargement même quand l'élément est masqué, et le desktop paierait la
vidéo pour rien. C'est `section-loops` qui lance la lecture à l'entrée dans le
cadre, et l'affiche est un fond CSS déclaré dans la requête média.

## Déploiement

`vercel.json` est prêt (`outputDirectory: deploy`, `cleanUrls: true`,
`buildCommand: null`, en-têtes de sécurité). Le dépôt pousse sur
`github.com/megevanderwan2004-maker/lowbasemx`.

```bash
vercel --prod
```

## Panier et Shopify

**Les neuf produits sont branchés.** Chaque fiche de `catalog.js` porte un bloc
`shopify` avec son handle et, selon le cas, sa variante unique ou sa table
couleur × taille.

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

> **En-tête du checkout** — le nom affiché en haut du checkout est le *nom de la
> boutique* Shopify, aujourd'hui « My Store ». Il se change dans
> Réglages → Détails de la boutique ; un logo de checkout le remplace
> visuellement (Réglages → Checkout → Marque).
