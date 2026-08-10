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
│   ├── hero/                   hero-runners.jpg (desktop) + -mobile.jpg (1:2)
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

## `assets/` — sources brutes

Jamais servi en production (`vercel.json` ne publie que `deploy/`). C'est le
vrac d'origine, trié par nature :

```
assets/
├── garmin/          fiches produit officielles (PDF) et packshots Garmin HD
├── fotos/           photos sources (noms UUID) : lifestyle, produit, app
├── videos/          rushes vidéo avant montage/compression
├── marca/           logo, rendus ChatGPT/Canva, moodboards
└── fotosyvideos2/   dépôt d'origine, laissé tel quel
```

Seules les copies optimisées atterrissent dans `deploy/media/`. Les sources les
plus récentes restent **non suivies** par git : le dépôt est public et
`assets/garmin/` contient des documents revendeur confidentiels — voir
l'avertissement de `PROJECT_CONTEXT.md` §10 avant d'y toucher.

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
- Toute copie client est en espagnol (es-MX).
- Accessibilité : skip link, radiogroups ARIA, cibles tactiles ≥ 44 px,
  `prefers-reduced-motion`.

---

## Déploiement

`vercel.json` est prêt (`outputDirectory: deploy`, `cleanUrls: true`,
`buildCommand: null`, en-têtes de sécurité). Le dépôt pousse sur
`github.com/megevanderwan2004-maker/lowbasemx`.

```bash
vercel --prod
```

## Shopify

Seule la **CIRQA** est branchée sur le checkout Shopify (variantes couleur ×
taille pré-sélectionnées). Les autres fiches retombent volontairement sur un
`mailto:` — jamais sur une URL Shopify inexistante. Pour en brancher une :
créer le produit, relever les IDs de variantes, ajouter un bloc `shopify` dans
`catalog.js`, régénérer.

> Les prix hors CIRQA sont **provisoires** : convertis des tarifs américains à un
> taux arrondi, à confirmer avant lancement.
