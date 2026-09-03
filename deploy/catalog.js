/* =========================================================================
   lowlabs — catalogue partagé
   Source unique de vérité pour les cartes de la home, les pages produit et
   le dock. Toute page produit lit sa fiche ici via son handle.
   Les prix sont provisoires : ils seront repris depuis Shopify au branchement.
   ========================================================================= */
(function(global){
  "use strict";

  var CDN = "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/";

  var PRODUCTS = [
    {
      handle: "cirqa",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["cirqa","banda","band","pulsera","smart band","brazalete","sin pantalla","sueno","sleep","salud","health","estres","body battery","garmin"],
      pairs: ["banda-cirqa", "absorption-sleep", "promix-creatina"],
      gallery: [
        "/media/archivo/cirqa/cirqa-rock.jpg",
        "/media/archivo/cirqa/wrist-negra.jpg",
        "/media/archivo/cirqa/cirqa-sensor-negra.jpg",
        "/media/archivo/cirqa/app-body-battery.jpg"
      ],
      name: "Garmin CIRQA™ Smart Band",
      short: "CIRQA™ Smart Band",
      brand: "Garmin",
      tagline: "Monitor de salud y ejercicio. Sin suscripción requerida.",
      price: 3999,
      compareAt: 4199,
      badge: "Más vendido",
      category: "Wearables",
      /* Rendus officiels Garmin, un par coloris (voir `colors`). */
      image: "/media/productos/cirqa/cirqa-negra.jpg",
      hero: CDN + "cirqa-hero-entrenamiento.jpg?v=1785272697",
      /* Détouré : c'est cette vue qui sert au carrousel « Los más buscados »
         ET aux cartes de la tienda, où les produits flottent sans cadre —
         les deux passent par `flyMedia`, qui lit `packshot` avant `image`.
         Malva depuis le 22/08/2026 ; `cirqa-packshot.png` est le détourage
         Negra qu'elle remplace, conservé. Le détourage vient de
         `cirqa-malva.jpg` : le rendu brut a un fond blanc, et sur une carte
         sans cadre `drop-shadow` en ferait l'ombre d'un rectangle. */
      packshot: "/media/productos/cirqa/cirqa-malva-packshot.png",
      /* `card` est LE visuel des carrousels et des grilles — le seul endroit
         à changer pour corriger ce qu'on y voit.

         Tous les `card.png` sont produits par `build/card-shots.py`, qui
         recadre chaque source sur son contenu réel et la repose au centre
         d'un carré avec la MÊME réserve pour tous : les packshots venaient
         de six studios différents et occupaient de 55 % à 94 % de leur
         fichier, ce qui se lisait comme un défaut d'échelle d'une tuile à
         l'autre. Les sources ne sont pas touchées — le script écrit à côté.

         Ici, `card` répare en plus une incohérence : la carte montrait la
         Malva alors que la fiche ouvre sur la Negra, premier coloris. Le
         client voyait un bracelet mauve, cliquait, tombait sur un noir. */
      card: "/media/productos/cirqa/card.png",
      video: "/media/productos/cirqa/hero-cirqa.mp4",
      poster: "/media/productos/cirqa/poster-hero-cirqa.jpg",
      shopify: { handle: "garmin-cirqa-smart-band", variants: {
        "Negra":        { "S–M": "64093481107833", "L–XL": "64093481140601" },
        "Gris Francés": { "S–M": "64093481173369", "L–XL": "64093481206137" },
        "Malva":        { "S–M": "64093481238905", "L–XL": "64093481271673" },
        "Azul Capitán": { "S–M": "64093481304441", "L–XL": "64093481337209" }
      }},
      /* Les quatre visuels de coloris sont les rendus produit officiels
         Garmin (res.garmin.com, vue trois-quarts « cf »), un par numéro de
         pièce : 010-04675-00 Noir → Negra, -01 Lin → Gris Francés,
         -02 Rose → Malva, -03 Bleu Marine → Azul Capitán. Ils sont
         recadrés au plus près du bracelet et servis en local.
         `shotFit` dit au générateur de les CONTENIR dans le cadre de la
         galerie : ce sont des rendus sur fond blanc, les rogner couperait
         le bracelet. */
      shotFit: "contain",
      /* `image` est la vue principale du coloris, `views` les autres vues du
         MÊME coloris : le capteur et ses LED, puis la boucle ouverte de
         profil. Toutes portent la couleur dans la galerie — choisir un
         coloris amène sur sa première vue, et le geste latéral fait
         défiler les trois avant de passer au coloris suivant. */
      colors: [
        { name: "Negra",        dot: "#2b2b2e", image: "/media/productos/cirqa/cirqa-negra.jpg",
          views: ["/media/productos/cirqa/cirqa-negra-sensor.jpg", "/media/productos/cirqa/cirqa-negra-perfil.jpg"],
          note: "Discreción total, del gimnasio a la oficina" },
        { name: "Gris Francés", dot: "#a6a098", image: "/media/productos/cirqa/cirqa-gris-frances.jpg",
          views: ["/media/productos/cirqa/cirqa-gris-frances-sensor.jpg", "/media/productos/cirqa/cirqa-gris-frances-perfil.jpg"],
          note: "Un neutro cálido que acompaña sin pedir atención" },
        { name: "Malva",        dot: "#9f8384", image: "/media/productos/cirqa/cirqa-malva.jpg",
          views: ["/media/productos/cirqa/cirqa-malva-sensor.jpg", "/media/productos/cirqa/cirqa-malva-perfil.jpg"],
          note: "Suave y personal, para medir tu bienestar en calma" },
        { name: "Azul Capitán", dot: "#2e3f63", image: "/media/productos/cirqa/cirqa-azul-capitan.jpg",
          views: ["/media/productos/cirqa/cirqa-azul-capitan-sensor.jpg", "/media/productos/cirqa/cirqa-azul-capitan-perfil.jpg"],
          note: "Profundo y sereno, con carácter para todo el día" }
      ],
      sizes: [
        { name: "S–M",  note: "muñeca 120–200 mm" },
        { name: "L–XL", note: "muñeca 145–240 mm" }
      ],
      highlights: [
        "Monitoreo de salud las 24 horas",
        "Seguimiento avanzado del sueño, puntuación y coaching personalizado",
        "Hasta 10 días de duración de batería entre cargas",
        "Detección automática de más de 80 actividades"
      ],
      specs: [
        ["Pantalla", "Sin pantalla — todo en Garmin Connect™"],
        ["Batería", "Hasta 10 días"],
        ["Peso", "18 g (S–M) · 20 g (L–XL)"],
        ["Caja", "27.5 × 46.9 × 8.7 mm"],
        ["Conectividad", "GPS conectado, Bluetooth®, ANT+"],
        ["App", "Garmin Connect™ (gratuita, sin suscripción)"]
      ]
    },
    {
      handle: "venu-4",
      card: "/media/productos/venu-4/card.png",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["venu","reloj","watch","smartwatch","amoled","pantalla","entrenamiento","vo2","garmin"],
      pairs: ["promix-creatina", "absorption-sleep", "cirqa"],
      /* Une seule option, la couleur : `variants` est donc une table plate,
         couleur → référence, sans niveau de taille. */
      shopify: { handle: "garmin-venu-4", variants: {
        "Crema":      "64212128956793",
        "Gris Taupe": "64326127550841",
        "Negro":      "64326127583609"
      }},
      shotFit: "contain",
      colors: [
        { name: "Crema",      dot: "#e8e2d2", image: "/media/productos/venu-4/venu-4-crema.jpg",
          views: ["/media/productos/venu-4/venu-4-crema-sensor.jpg", "/media/productos/venu-4/venu-4-crema-perfil.jpg"],
          note: "Silicona color hueso y bisel dorado" },
        { name: "Gris Taupe", dot: "#87837b", image: "/media/productos/venu-4/venu-4-gris-taupe.jpg",
          views: ["/media/productos/venu-4/venu-4-gris-taupe-sensor.jpg", "/media/productos/venu-4/venu-4-gris-taupe-perfil.jpg"],
          note: "Un neutro cálido con bisel plateado" },
        { name: "Negro",      dot: "#373737", image: "/media/productos/venu-4/venu-4-negro.jpg",
          views: ["/media/productos/venu-4/venu-4-negro-sensor.jpg", "/media/productos/venu-4/venu-4-negro-perfil.jpg"],
          note: "Discreto de la oficina al gimnasio" }
      ],
      name: "Garmin Venu® 4",
      short: "Venu® 4",
      brand: "Garmin",
      tagline: "La pantalla AMOLED que convierte tus datos en decisiones.",
      price: 10999,
      compareAt: 11499,
      badge: "Nuevo",
      category: "Wearables",
      image: "/media/productos/venu-4/venu-4.png",
      hero: "/media/productos/venu-4/venu-4.png",
      /* Photos d'usage Garmin : la montre au poignet, à l'entraînement et
         la lampe de la Venu 4 dans le noir. Elles ferment la galerie,
         après les vues produit. */
      gallery: [
        "/media/productos/venu-4/entreno-flexiones.jpg",
        "/media/productos/venu-4/entreno-kettlebell.jpg",
        "/media/productos/venu-4/linterna-noche.jpg"
      ],
      highlights: [
        "Pantalla AMOLED brillante y siempre legible",
        "Predisposición para entrenar, VO2 max y estado del entreno",
        "Entrenador de sueño y puntuación del sueño",
        "Hasta 12 días de batería en modo smartwatch"
      ],
      specs: [
        ["Pantalla", "AMOLED táctil"],
        ["Batería", "Hasta 12 días (modo smartwatch)"],
        ["Deportes", "Más de 80 aplicaciones deportivas"],
        ["Salud", "Body Battery™, VFC, pulsioximetría¹"],
        ["Conectividad", "GPS multibanda, Bluetooth®, ANT+, Wi-Fi"],
        ["App", "Garmin Connect™ (gratuita)"]
      ]
    },
    {
      handle: "venu-3s",
      card: "/media/productos/venu-3s/card.png",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["venu","reloj","watch","smartwatch","amoled","compacto","41 mm","muneca delgada","garmin"],
      pairs: ["promix-relax", "promix-creatina", "cirqa"],
      shopify: { handle: "garmin-venu-3s", variant: "64212129743225" },
      name: "Garmin Venu® 3S",
      short: "Venu® 3S",
      brand: "Garmin",
      tagline: "El mismo sistema Garmin, en una caja más compacta.",
      price: 8899,
      compareAt: 9399,
      category: "Wearables",
      image: "/media/productos/venu-3s/venu-3s.png",
      hero: "/media/productos/venu-3s/venu-3s.png",
      highlights: [
        "Caja de 41 mm, pensada para muñecas más delgadas",
        "Coach de sueño y siesta detectada automáticamente",
        "Llamadas y asistente de voz desde la muñeca",
        "Hasta 10 días de batería en modo smartwatch"
      ],
      specs: [
        ["Pantalla", "AMOLED táctil 1.2\""],
        ["Caja", "41 mm"],
        ["Batería", "Hasta 10 días (modo smartwatch)"],
        ["Salud", "Body Battery™, sueño, estrés, pulsioximetría¹"],
        ["Conectividad", "GPS, Bluetooth®, ANT+, Wi-Fi"],
        ["App", "Garmin Connect™ (gratuita)"]
      ]
    },
    {
      handle: "vivoactive-6",
      card: "/media/productos/vivoactive-6/card.png",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["vivoactive","reloj","watch","smartwatch","entrenamiento","training","gps","garmin"],
      pairs: ["promix-creatina", "promix-debloat", "cirqa"],
      shopify: { handle: "garmin-vivoactive-6", variant: "64212131119481" },
      name: "Garmin Vívoactive® 6",
      short: "Vívoactive® 6",
      brand: "Garmin",
      tagline: "Lo esencial del entrenamiento, sin nada de más.",
      price: 5999,
      compareAt: 6299,
      category: "Wearables",
      image: "/media/productos/vivoactive-6/vivoactive-6.png",
      hero: "/media/productos/vivoactive-6/vivoactive-6.png",
      highlights: [
        "Más de 80 aplicaciones deportivas integradas",
        "Entrenador de sueño y puntuación del sueño",
        "Rutinas guiadas de fuerza, yoga y pilates",
        "Hasta 11 días de batería en modo smartwatch"
      ],
      specs: [
        ["Pantalla", "AMOLED táctil"],
        ["Batería", "Hasta 11 días (modo smartwatch)"],
        ["Deportes", "Más de 80 aplicaciones deportivas"],
        ["Salud", "Body Battery™, sueño, estrés"],
        ["Conectividad", "GPS, Bluetooth®, ANT+"],
        ["App", "Garmin Connect™ (gratuita)"]
      ]
    },
    {
      handle: "creatina",
      card: "/media/productos/creatina/card.png",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["creatina","creatine","liposomal","cymbiotika","fuerza","strength","musculo","muscle","rendimiento"],
      pairs: ["cirqa", "promix-debloat", "venu-4"],
      shopify: { handle: "cymbiotika-liposomal-advanced-creatine", variant: "64212132823417" },
      name: "Cymbiotika Liposomal Advanced Creatine",
      short: "Advanced Creatine",
      brand: "Cymbiotika",
      tagline: "5 g de creatina liposomal. Tono muscular y recuperación.",
      price: 1349,
      compareAt: 1499,
      /* Le badge disait « Suplementos » — la catégorie, que la carte
         affiche déjà par ailleurs, et qui ne dit rien d'un produit en
         particulier. Retiré le 03/09/2026 : un repère commercial se
         mérite (« Más vendido », « Nuevo »), il ne se remplit pas avec
         le rayon. */
      badge: "",
      category: "Suplementos",
      image: "/media/productos/creatina/creatina.png",
      hero: "/media/productos/creatina/creatina.png",
      highlights: [
        "5 g de creatina por sobre, sabor Tangerine Vanilla",
        "Tecnología liposomal para una absorción mejorada",
        "Apoya el rendimiento, la recuperación muscular y la salud cerebral*",
        "24 sobres líquidos listos para tomar — sin mezclar, sin grumos"
      ],
      specs: [
        ["Formato", "24 sobres líquidos — un mes"],
        ["Creatina", "5 g por porción"],
        ["Sabor", "Tangerine Vanilla"],
        ["Tecnología", "Liposomal — absorción mejorada"],
        ["Certificaciones", "Vegan, Non-GMO, Clean Label Project"],
        ["Formulación", "Por dietistas y científicos"]
      ],
      video: "/media/productos/creatina/sup-creatina.mp4",
      poster: "/media/productos/creatina/poster-sup-creatina.jpg",
      videoRatio: "portrait",
      /* Visuels de marque Cymbiotika. La boîte porte bien « 24 x 30 mL
         Liquid Packets » : c'est le format que nous vendons. */
      gallery: [
        "/media/productos/creatina/creatina-caja.jpg",
        "/media/productos/creatina/creatina-sobre.jpg",
        "/media/productos/creatina/creatina-bolsa.jpg",
        "/media/productos/creatina/creatina-textura.jpg"
      ]
    },
    /* ---------------------------------------------------------------------
       Les suppléments Cymbiotika ajoutés au catalogue.
       Prix, textes et fiches techniques sont provisoires : ils viennent de
       la maquette Canva et seront repris depuis Shopify au branchement.
       Chaque fiche porte sa vidéo produit — c'est elle qui sert de visuel
       principal, la photo n'étant que l'affiche extraite de la boucle.
       --------------------------------------------------------------------- */
    {
      handle: "promix-relax",
      card: "/media/productos/promix-relax/card.png",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["relax","magnesio","magnesium","calma","descanso","recuperacion","recovery","melisa","lemon balm","sueno","noche","promix"],
      pairs: ["cirqa", "promix-debloat", "venu-3s"],
      shopify: { handle: "promix-relax-magnesium-complex", variant: "64212134855033" },
      name: "Promix Relax: Magnesium Complex",
      short: "Relax",
      brand: "Promix",
      tagline: "Magnesio bisglicinato y melisa, para el descanso y la recuperación.",
      price: 989,
      badge: "Nuevo",
      category: "Suplementos",
      image: "/media/productos/promix-relax/promix-relax.png",
      hero: "/media/productos/promix-relax/promix-relax.png",
      packshot: "/media/productos/promix-relax/promix-relax.png",
      /* Le visuel principal est un détourage : sans ce drapeau, aucun cadre ne
         porte `.contain`, la règle `.gal-stage:has(.gal-frame.contain)` ne
         prend pas, et le bocal se posait sur la plaque grise du cadre. */
      shotFit: "contain",
      /* Trois vues ajoutées le 23/08/2026, là où la fiche n'en avait qu'une et
         aucune vignette. Ce sont les originaux 1200x1500 du site Promix,
         recadrés au carré ici plutôt que rognés par le `cover` du cadre — le
         cadrage se choisit, il ne se subit pas.
         Deux autres vues existent chez Promix et sont volontairement écartées :
         « supplement facts » et « key benefits » sont des panneaux de texte EN
         ANGLAIS. La fiche est en espagnol et porte déjà ces informations dans
         `highlights` et `specs`. */
      gallery: [
        "/media/productos/promix-relax/relax-bote.jpg",
        "/media/productos/promix-relax/relax-ritual.jpg",
        "/media/productos/promix-relax/relax-capsulas.jpg"
      ],
      highlights: [
        "Apoya un sueño reparador¹",
        "Favorece la relajación muscular¹",
        "Ayuda a calmar el sistema nervioso¹",
        "Magnesio bisglicinato, la forma más biodisponible y suave para la digestión"
      ],
      specs: [
        ["Marca", "Promix Nutrition"],
        ["Formato", "90 cápsulas — 30 porciones"],
        ["Porción", "3 cápsulas, 30–60 min antes de dormir"],
        ["Fórmula", "Magnesio bisglicinato + extracto orgánico de melisa"],
        ["Sin", "Glifosato, gluten, soya, transgénicos ni ingredientes artificiales"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Promix",
        title: "Bajar el ritmo, también se entrena.",
        text: "Magnesio bisglicinato y melisa orgánica: la melisa actúa sobre el GABA para favorecer la relajación, el magnesio acompaña la recuperación muscular.¹"
      }
    },
    {
      handle: "absorption-sleep",
      card: "/media/productos/absorption-sleep/card.png",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["sleep","sueno","dormir","noche","descanso","absorption","the absorption company","insomnio","rutina nocturna"],
      pairs: ["cirqa", "promix-debloat", "venu-3s"],
      /* Option unique : le format. La table est donc plate, format →
         référence, et chaque format porte SON prix. */
      shopify: { handle: "the-absorption-company-sleep", variants: {
        "7 sticks":  "64212136624505",
        "14 sticks": "64326122668409",
        "28 dosis":  "64326122701177"
      }},
      /* L'intitulé de l'option : « Talla » n'aurait aucun sens ici. */
      sizeLabel: "Formato",
      /* Chaque format a SON visuel : l'étui de 7, celui de 14 et le sachet
         de 28 doses ne se ressemblent pas. La galerie les porte comme elle
         porte les coloris ailleurs — choisir un format amène dessus. */
      sizes: [
        { name: "7 sticks",  note: "una semana",  price: 499,
          image: "/media/productos/absorption-sleep/absorption-sleep.png" },
        { name: "14 sticks", note: "dos semanas", price: 899,
          image: "/media/productos/absorption-sleep/sleep-14-sticks.jpg" },
        { name: "28 dosis",  note: "un mes",      price: 1599,
          image: "/media/productos/absorption-sleep/sleep-28-dosis.jpg",
          views: ["/media/productos/absorption-sleep/sleep-28-dosis-vaso.jpg"] }
      ],
      shotFit: "contain",
      name: "The Absorption Company Sleep",
      short: "Sleep",
      brand: "The Absorption Company",
      tagline: "Siete sticks para dormir profundo, sin melatonina.",
      price: 499,
      badge: "Nuevo",
      category: "Suplementos",
      /* Visuel principal : le sachet de 28 doses, c'est-à-dire la 3e vue de
         la fiche, détourée. Avant le 22/08/2026 c'était l'étui de 7 sticks
         (`absorption-sleep.png`) — un PNG dont 76 % de la surface était un
         rectangle blanc opaque, ce qui donnait au `drop-shadow` de la carte
         l'ombre d'une boîte au lieu de celle du produit.
         Attention : les trois formats gardent LEURS visuels dans `sizes`,
         et c'est encore « 7 sticks » qui est sélectionné par défaut. */
      image: "/media/productos/absorption-sleep/sleep-packshot.png",
      hero: "/media/productos/absorption-sleep/sleep-packshot.png",
      packshot: "/media/productos/absorption-sleep/sleep-packshot.png",
      highlights: [
        "Sin melatonina — descanso sin dependencia ni niebla matinal",
        "Azafrán liposomal Capsoil® y aceite de pasiflora Capsoil® para reducir el estrés",
        "PharmaGABA® y glicina para relajarte y mejorar la calidad del sueño",
        "Jugo de cereza ácida y magnesio bisglicinato liposomal para despertar sin pesadez"
      ],
      specs: [
        ["Marca", "The Absorption Company"],
        ["Formato", "7 sticks × 7.13 g (49.91 g)"],
        ["Sabor", "Chamomile Lemonade"],
        ["Ingredientes clave", "Azafrán liposomal, pasiflora, PharmaGABA®, apigenina, magnesio bisglicinato liposomal, cereza ácida, L-teanina, L-triptófano, L-glicina"],
        ["Tecnología", "Capsoil® — hasta 5 veces más absorción"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "The Absorption Company",
        title: "Duerme profundo, despierta ligero.",
        text: "Una mezcla respaldada por la ciencia, sin melatonina: te ayuda a caer en un sueño profundo y a despertar sin esa sensación de resaca.*"
      }
    },
    /* ---------------------------------------------------------------------
       Promix Nutrition. Prix convertis depuis les tarifs américains
       (32 $ et 29 $ US) à un taux arrondi : provisoires, à confirmer.
       Les packshots viennent du CDN de la marque, copiés en local.
       --------------------------------------------------------------------- */
    {
      handle: "promix-creatina",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["creatina","creatine","monohidrato","monohydrate","non gmo","promix","fuerza","strength","musculo","muscle"],
      pairs: ["cirqa", "promix-debloat", "venu-4"],
      shopify: { handle: "promix-non-gmo-creatine", variant: "64212133347705" },
      name: "Promix Non-GMO Creatine",
      short: "Non-GMO Creatine",
      brand: "Promix",
      tagline: "Creatina monohidratada micronizada, en sticks de 5 g.",
      price: 659,
      category: "Suplementos",
      /* Visuel principal : le sachet, c'est-à-dire la 2e vue de la fiche,
         détourée de son fond crème. Avant le 23/08/2026 c'étaient les trois
         sticks (`promix-creatine-sticks.png`) — un PNG dont plus de la moitié
         de la surface était opaque, ce qui donnait au `drop-shadow` de la
         carte l'ombre d'un rectangle au lieu de celle du produit.
         Les sticks ne sont pas perdus : ils passent dans la galerie. */
      image: "/media/productos/promix-creatina/promix-creatine-packshot.png",
      hero: "/media/productos/promix-creatina/promix-creatine-packshot.png",
      packshot: "/media/productos/promix-creatina/promix-creatine-packshot.png",
      /* Le packshot d'origine gardait, en bas à gauche, l'ombre portée du
         studio : un voile crème que `mix-blend-mode:multiply` transformait
         en salissure sur la tuile grise. Redétouré le 03/09/2026 depuis
         `1-promix-creatine-stick-packs.png` avec build/cutout.swift
         (mode `dist`, 14/26), puis recadré sur sa boîte englobante pour
         occuper sa tuile comme les autres produits. */
      card: "/media/productos/promix-creatina/card.png",
      /* Sans ce drapeau, aucun cadre ne porte `.contain`, la règle
         `.gal-stage:has(.gal-frame.contain)` ne prend pas, et le cadre de la
         galerie garde `--surface-teal` : le détourage se poserait alors sur
         une plaque grise. C'est le second fond à traiter, après celui de
         l'image elle-même. */
      shotFit: "contain",
      /* Visuels de marque Promix. Le sachet porte « 30 × 5 g Stick Packs » :
         c'est l'emballage de nos 30 sticks, pas un autre format.
         `promix-creatine-bolsa.jpg` n'y est plus : c'est lui qui est devenu
         le visuel principal, détouré. */
      gallery: [
        "/media/productos/promix-creatina/promix-creatine-sticks.png",
        "/media/productos/promix-creatina/promix-creatine-lifestyle.jpg"
      ],
      highlights: [
        "Creatina monohidratada micronizada, sin endulzar y sin sabor",
        "Apoya de forma segura el aumento de tamaño, fuerza y potencia muscular*",
        "Esencial en los programas de entrenamiento de fuerza y potencia",
        "Fácil de digerir y de mezclar"
      ],
      specs: [
        ["Marca", "Promix Nutrition"],
        ["Formato", "30 sticks individuales × 5 g"],
        ["Creatina", "5 g por stick"],
        ["Sabor", "Sin sabor"],
        ["Certificaciones", "Non-GMO Project Verified, vegano, keto y paleo"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Promix",
        title: "Creatina y nada más.",
        text: "Un solo ingrediente, molido lo bastante fino para desaparecer en el agua. Un stick por sesión, sin sabor que tapar ni aditivos que explicar.*"
      }
    },
    {
      handle: "promix-debloat",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["debloat","digestion","probiotico","probiotic","prebiotico","prebiotic","hinchazon","bloating","intestino","gut","promix"],
      pairs: ["creatina", "cirqa", "vivoactive-6"],
      shopify: { handle: "promix-debloat-prebiotic-probiotic", variant: "64212135903609" },
      name: "Promix Debloat Prebiotic + Probiotic",
      short: "Debloat",
      brand: "Promix",
      tagline: "Prebióticos y probióticos en sobres, tres sabores.",
      price: 599,
      category: "Suplementos",
      image: "/media/productos/promix-debloat/promix-debloat.png",
      hero: "/media/productos/promix-debloat/promix-debloat.png",
      video: "/media/productos/promix-debloat/debloat-loop.mp4",
      poster: "/media/productos/promix-debloat/poster-debloat-loop.jpg",
      packshot: "/media/productos/promix-debloat/promix-debloat.png",
      /* Le trio de sticks remplace la boucle vidéo dans les carrousels :
         plus lisible en petit, et cohérent avec les autres cartes, qui sont
         toutes des visuels fixes depuis le 03/09/2026. */
      card: "/media/productos/promix-debloat/card.png",
      /* Le packshot est déjà détouré ; ce qui se voyait comme un fond, c'est
         la plaque de la galerie. Sans `shotFit`, aucun cadre ne porte
         `.contain`, la règle `.gal-stage:has(.gal-frame.contain)` ne prend
         pas et le cadre garde `--surface-teal` : le PNG transparent se
         posait donc sur du gris. */
      shotFit: "contain",
      videoRatio: "portrait",
      /* Visuels de marque Promix. Le sachet liste 4 White Peach + 4 Florida
         Orange + 4 Tropical Mango : ce sont bien nos 12 sobres. */
      gallery: [
        "/media/productos/promix-debloat/debloat-bolsa.jpg",
        "/media/productos/promix-debloat/debloat-sobres.jpg",
        "/media/productos/promix-debloat/debloat-trio.jpg",
        "/media/productos/promix-debloat/debloat-mano.jpg"
      ],
      highlights: [
        "Prebióticos y probióticos en un mismo sobre",
        "Pensado para la digestión y el confort intestinal*",
        "Paquete variado: Tropical Mango, Florida Orange y White Peach",
        "Ingredientes naturales, sin aditivos artificiales"
      ],
      specs: [
        ["Marca", "Promix Nutrition"],
        ["Formato", "12 sobres — paquete variado"],
        ["Sabores", "Tropical Mango, Florida Orange, White Peach"],
        ["Fórmula", "Prebióticos + probióticos"],
        ["Ingredientes", "Naturales, sin aditivos artificiales"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Promix",
        title: "Un sobre, un vaso de agua.",
        text: "Prebióticos y probióticos que se toman como una bebida, en tres sabores para no cansarte del mismo. Para el confort digestivo de todos los días.*"
      }
    },
    {
      /* Accessoire officiel Garmin : les trois teintes que la CIRQA elle-même
         n'a pas. SKU et prix viennent de la fiche revendeur Garmin
         (`assets/cirqa/documentos/`), où les sept bracelets sont à 1 099 MXN.
         Les quatre autres teintes (Negra, Gris Francés, Malva, Azul Capitán)
         existent aussi chez Garmin : elles attendent leurs visuels. */
      handle: "banda-cirqa",
      /* Mots-clés de recherche — jamais affichés. Espagnol ET anglais :
         le catalogue est en es-MX mais les noms de molécules et les
         termes produit circulent en anglais. */
      keywords: ["banda","band","correa","strap","repuesto","recambio","cirqa","brazalete","garmin"],
      pairs: ["cirqa", "absorption-sleep", "promix-creatina"],
      shopify: { handle: "banda-cirqa-repuesto", variants: {
        "Gris Lima":    { "S–M": "64326134333817", "L–XL": "64326134366585" },
        "Oliva Oscuro": { "S–M": "64326134399353", "L–XL": "64326134432121" },
        "Azul Francés": { "S–M": "64326134464889", "L–XL": "64326134497657" }
      }},
      name: "Banda CIRQA™ de repuesto",
      short: "Banda de repuesto",
      brand: "Garmin",
      tagline: "Cambia el color sin cambiar de banda.",
      price: 1099,
      category: "Accesorios",
      image: "/media/productos/banda-cirqa/banda-gris-lima.jpg",
      hero: "/media/productos/banda-cirqa/banda-gris-lima.jpg",
      /* Détourée : le rendu brut est un JPEG sur fond blanc, donc opaque de
         bord à bord — sur la carte sans cadre, `drop-shadow` en dessinait
         l'ombre du rectangle entier. La galerie, elle, garde le JPEG : son
         cadre est blanc et `mix-blend-mode:multiply` y efface le fond. */
      packshot: "/media/productos/banda-cirqa/banda-packshot.png",
      /* Un seul coloris en carrousel — le bleu — pour que la bande de
         rechange ne se lise pas comme trois produits différents selon la
         page. Les sept coloris restent sur la fiche, où ils se choisissent. */
      card: "/media/productos/banda-cirqa/card.png",
      shotFit: "contain",
      colors: [
        { name: "Gris Lima",    dot: "#a8a98d", image: "/media/productos/banda-cirqa/banda-gris-lima.jpg",
          note: "Gris cálido con remate lima" },
        { name: "Oliva Oscuro", dot: "#4f5232", image: "/media/productos/banda-cirqa/banda-oliva-oscuro.jpg",
          note: "Verde profundo, casi militar" },
        { name: "Azul Francés", dot: "#8e9cc4", image: "/media/productos/banda-cirqa/banda-azul-frances.jpg",
          note: "Azul claro y luminoso" }
      ],
      sizes: [
        { name: "S–M",  note: "muñeca 120–200 mm" },
        { name: "L–XL", note: "muñeca 145–240 mm" }
      ],
      highlights: [
        "Compatible con todas las Garmin CIRQA™ Smart Band",
        "El mismo tejido elástico y el mismo cierre que la banda original",
        "Dos tallas, para muñecas de 120 a 240 mm",
        "Accesorio oficial Garmin"
      ],
      specs: [
        ["Marca", "Garmin"],
        ["Compatibilidad", "CIRQA™ Smart Band"],
        ["Tallas", "S–M (120–200 mm) · L–XL (145–240 mm)"],
        ["Material", "Tejido elástico, cierre de gancho"],
        ["Colores", "Gris Lima, Oliva Oscuro, Azul Francés"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Garmin",
        title: "Un gesto, otro color.",
        text: "La banda se cambia en segundos, sin herramientas. La misma CIRQA para entrenar, para la oficina y para dormir."
      }
    }
  ];

  /* -----------------------------------------------------------------------
     Objectifs — le point d'entrée de l'assistant.
     `pick` est le handle recommandé en premier, `also` les compléments.
     Trois entrées, comme la maquette : la grille les range en 3 × 1 au
     large et en 2 colonnes en dessous.
     ----------------------------------------------------------------------- */
  var GOALS = [
    {
      id: "dormir",
      label: "Dormir mejor",
      icon: "moon",
      video: "/media/landing/objetivos/goal-dormir.mp4",
      poster: "/media/landing/objetivos/poster-goal-dormir.jpg",
      lede: "Sueño profundo, despertares medidos, rutina que se sostiene.",
      pick: "cirqa",
      also: ["absorption-sleep", "banda-cirqa"],
      why: "La CIRQA mide el sueño sin una pantalla que te despierte: puntuación, fases, VFC y temperatura de la piel, toda la noche."
    },
    {
      id: "rendimiento",
      label: "Performance",
      icon: "spark",
      video: "/media/landing/objetivos/goal-rendimiento.mp4",
      poster: "/media/landing/objetivos/poster-goal-rendimiento.jpg",
      lede: "Entrenar con datos, no con sensaciones.",
      pick: "venu-4",
      also: ["promix-creatina", "absorption-sleep"],
      why: "Predisposición para entrenar, VO2 max y estado del entreno en una pantalla AMOLED que lees de un vistazo."
    },
    {
      id: "salud",
      label: "Cuidar mi salud diaria",
      icon: "heart",
      video: "/media/landing/objetivos/goal-salud.mp4",
      poster: "/media/landing/objetivos/poster-goal-salud.jpg",
      lede: "Un registro continuo, sin volverlo una obsesión.",
      pick: "cirqa",
      also: ["promix-debloat", "promix-relax", "creatina"],
      why: "Salud 24/7 en 18 gramos de tela: estrés, pulsioximetría¹ y más de 80 actividades detectadas solas."
    }
  ];

  var BY_HANDLE = {};
  for (var i = 0; i < PRODUCTS.length; i++) BY_HANDLE[PRODUCTS[i].handle] = PRODUCTS[i];

  /* -----------------------------------------------------------------------
     Recommandations — la logique vit ICI, et nulle part ailleurs

     `pairs` (par produit) et `also` (par objectif) restent la préférence
     éditoriale : ce qu'on AIMERAIT proposer. Mais depuis le 03/09/2026 rien
     ne sort sans passer par `recommend()`, qui applique trois règles.

     1. GROUPES EXCLUSIFS. Deux produits d'un même groupe répondent au même
        besoin : les montrer ensemble ne complète rien, ça demande au client
        d'arbitrer à notre place. Ils ne peuvent donc ni se recommander l'un
        l'autre, ni cohabiter dans une même liste.
        · Sleep et Relax — les deux formules du soir. C'est la règle dure :
          consulter l'un ne doit JAMAIS proposer l'autre.
        · Les deux créatines — Cymbiotika et Promix. Même molécule, deux
          marques : c'est un choix, pas un complément.
        · Les trois montres — proposer une seconde montre à qui en regarde
          une déjà, c'est la lui faire remettre en question.
     2. COMPLÉMENTARITÉ. À qualité égale, on préfère ce qui vient d'une
        autre catégorie que le produit consulté — un wearable appelle des
        suppléments, un supplément appelle un wearable ou un supplément
        d'une autre fonction. Aucune catégorie ne peut occuper toute la
        liste : au plus `n - 1` places.
     3. JAMAIS LE PRODUIT CONSULTÉ. Ni ses doublons.

     Le repli est le catalogue lui-même : si les paires éditoriales ne
     suffisent plus une fois filtrées, on complète avec ce qui reste de
     compatible plutôt que de rendre une liste courte.
     ----------------------------------------------------------------------- */
  var EXCLUSIVE = [
    ["absorption-sleep", "promix-relax"],
    ["creatina", "promix-creatina"],
    ["venu-4", "venu-3s", "vivoactive-6"]
  ];

  function conflict(a, b){
    if (a === b) return true;
    for (var i = 0; i < EXCLUSIVE.length; i++){
      var g = EXCLUSIVE[i];
      if (g.indexOf(a) > -1 && g.indexOf(b) > -1) return true;
    }
    return false;
  }

  /* `seed` permet de faire passer une liste ÉCRITE À LA MAIN par le même
     filtre — c'est ce qui garantit qu'un `also` d'objectif obéit aux mêmes
     règles qu'un `pairs` de fiche produit, sans dupliquer le tri. */
  function recommend(handle, n, seed){
    var self = BY_HANDLE[handle];
    n = n || 3;

    var wanted = seed || (self && self.pairs) || [];
    /* Le catalogue en repli, les compléments d'abord : une catégorie autre
       que celle du produit consulté passe devant. */
    var rest = PRODUCTS.map(function(p){ return p.handle; })
      .filter(function(h){ return wanted.indexOf(h) === -1; });
    if (self){
      rest.sort(function(a, b){
        var da = BY_HANDLE[a].category === self.category ? 1 : 0;
        var db = BY_HANDLE[b].category === self.category ? 1 : 0;
        return da - db;
      });
    }

    var out = [], perCat = {};
    var queue = wanted.concat(rest);
    for (var i = 0; i < queue.length && out.length < n; i++){
      var c = BY_HANDLE[queue[i]];
      if (!c) continue;
      if (handle && conflict(c.handle, handle)) continue;

      var clash = false;
      for (var k = 0; k < out.length; k++){
        if (conflict(c.handle, out[k].handle)){ clash = true; break; }
      }
      if (clash) continue;

      /* Aucune catégorie ne prend toute une liste de trois : il y reste
         toujours une place pour autre chose. En dessous, le plafond ne
         s'applique pas — sur deux compléments, exiger deux catégories
         différentes écarterait un second supplément pertinent pour aller
         chercher un accessoire qui l'est moins. */
      var cap = n <= 2 ? n : n - 1;
      var used = perCat[c.category] || 0;
      if (used >= cap) continue;

      perCat[c.category] = used + 1;
      out.push(c);
    }
    return out;
  }

  /* -----------------------------------------------------------------------
     Recherche — aucun service externe, uniquement ce catalogue

     Trois exigences derrière ce moteur : répondre pendant la frappe, tolérer
     l'à-peu-près (accents, casse, mot partiel, une faute de frappe), et ne
     jamais rendre un résultat que le client ne comprendrait pas.

     · `norm` retire les accents et la casse : « sueño », « SUENO » et
       « sueno » sont la même requête. C'est indispensable en espagnol.
     · Chaque produit est aplati une seule fois en une liste de mots — nom,
       nom court, marque, catégorie, accroche et `keywords`. Le coût est
       payé au chargement, pas à chaque touche.
     · TOUS les mots de la requête doivent trouver preneur : « creatina
       promix » ne doit pas remonter la créatine Cymbiotika juste parce que
       « creatina » correspond.
     · La tolérance aux fautes est volontairement étroite — une seule
       substitution, et seulement sur les mots d'au moins quatre lettres.
       Au-delà, « venu » remonterait « menu » et la recherche perdrait sa
       crédibilité.
     ----------------------------------------------------------------------- */
  function norm(v){
    v = String(v == null ? "" : v).toLowerCase();
    return v.normalize ? v.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : v;
  }

  function words(v){
    return norm(v).split(/[^a-z0-9]+/).filter(Boolean);
  }

  /* Vrai si `a` et `b` sont à une substitution près. On ne traite ni
     l'insertion ni la suppression : à cette échelle de catalogue elles
     ouvrent plus de faux positifs qu'elles ne rattrapent de fautes. */
  function near(a, b){
    if (a.length !== b.length || a.length < 4) return false;
    var d = 0;
    for (var i = 0; i < a.length; i++){
      if (a.charAt(i) !== b.charAt(i) && ++d > 1) return false;
    }
    return d === 1;
  }

  var HAY = {};
  function haystack(p){
    if (HAY[p.handle]) return HAY[p.handle];
    var bag = []
      .concat(words(p.name), words(p.short), words(p.brand),
              words(p.category), words(p.tagline));
    (p.keywords || []).forEach(function(k){ bag = bag.concat(words(k)); });
    var seen = {}, out = [];
    bag.forEach(function(w){ if (!seen[w]){ seen[w] = 1; out.push(w); } });
    return (HAY[p.handle] = out);
  }

  /* Le poids dit la QUALITÉ de la correspondance, pas sa quantité : un mot
     entier vaut mieux qu'un début de mot, qui vaut mieux qu'un fragment au
     milieu, qui vaut mieux qu'une faute rattrapée. */
  function hit(bag, q){
    var best = 0;
    for (var i = 0; i < bag.length; i++){
      var w = bag[i];
      if (w === q) return 10;
      if (w.indexOf(q) === 0) best = Math.max(best, 7);
      else if (w.indexOf(q) > 0) best = Math.max(best, 4);
      else if (near(w, q)) best = Math.max(best, 3);
    }
    return best;
  }

  function searchProducts(query){
    var qs = words(query);
    if (!qs.length) return [];
    var out = [];
    PRODUCTS.forEach(function(p){
      var bag = haystack(p), total = 0;
      for (var i = 0; i < qs.length; i++){
        var h = hit(bag, qs[i]);
        if (!h) return;              /* un mot sans preneur écarte le produit */
        total += h;
      }
      /* Coup de pouce au produit dont le nom COMMENCE par la requête : qui
         tape « venu » cherche la Venu avant un supplément qui la cite. */
      if (norm(p.short).indexOf(norm(query)) === 0 ||
          norm(p.name).indexOf(norm(query)) === 0) total += 6;
      out.push({ product: p, score: total });
    });
    out.sort(function(a, b){ return b.score - a.score || a.product.price - b.product.price; });
    return out.map(function(r){ return r.product; });
  }

  /* Les rayons sont des réponses à part entière : « watch » doit pouvoir
     ouvrir Wearables, pas seulement lister quatre montres. */
  var AISLES = [
    { label: "Wearables",   url: "/wearables",
      keywords: ["wearable","wearables","reloj","relojes","watch","watches","smartwatch","garmin","banda","pulsera"] },
    { label: "Suplementos", url: "/suplementos",
      keywords: ["suplemento","suplementos","supplement","supplements","vitaminas","polvo","capsulas","sobres"] },
    { label: "Accesorios",  url: "/tienda",
      keywords: ["accesorio","accesorios","accessory","correa","strap","banda","repuesto","recambio","cable"] }
  ];

  function searchAisles(query){
    var qs = words(query);
    if (!qs.length) return [];
    var out = [];
    AISLES.forEach(function(a){
      var bag = words(a.label).concat(a.keywords.reduce(function(acc, k){ return acc.concat(words(k)); }, []));
      var total = 0;
      for (var i = 0; i < qs.length; i++){
        var h = hit(bag, qs[i]);
        if (!h) return;
        total += h;
      }
      out.push({ aisle: a, score: total });
    });
    out.sort(function(a, b){ return b.score - a.score; });
    return out.map(function(r){ return r.aisle; });
  }

  var BY_GOAL = {};
  for (var g = 0; g < GOALS.length; g++) BY_GOAL[GOALS[g].id] = GOALS[g];

  /* Catégories, dans l'ordre d'affichage de la page Tienda. */
  var CATEGORIES = [];
  for (var c = 0; c < PRODUCTS.length; c++){
    if (CATEGORIES.indexOf(PRODUCTS[c].category) === -1) CATEGORIES.push(PRODUCTS[c].category);
  }

  function money(n){
    return "$" + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* -----------------------------------------------------------------------
     Résolution d'une variante Shopify — le seul endroit qui connaisse la
     forme de `shopify.variants`. Trois formes cohabitent :

       · variante unique        shopify.variant           = "id"
       · une option             shopify.variants[valeur]  = "id"
         (couleur seule, comme la Venu 4 ; ou format seul, comme Sleep)
       · deux options           shopify.variants[couleur][taille] = "id"

     Une combinaison inconnue retombe sur la variante unique plutôt que sur
     rien : mieux vaut ouvrir la fiche boutique que casser le panier.
     ----------------------------------------------------------------------- */
  function variantOf(p, color, size){
    var shop = p && p.shopify;
    if (!shop) return null;
    var table = shop.variants;
    if (!table) return shop.variant || null;
    var node = (color != null && table[color] != null) ? table[color]
             : (size  != null && table[size]  != null) ? table[size]
             : null;
    if (node == null) return shop.variant || null;
    if (typeof node === "string") return node;
    if (size != null && node[size]) return node[size];
    /* Taille non choisie — un article recommandé, par exemple : on prend la
       première du catalogue plutôt que d'abandonner la variante. */
    if (p.sizes && node[p.sizes[0].name]) return node[p.sizes[0].name];
    return shop.variant || null;
  }

  /* Prix d'une combinaison : une option peut porter le sien (les formats de
     Sleep, par exemple). Sans prix propre, c'est celui de la fiche. */
  function priceOf(p, color, size){
    var list = [];
    if (p.sizes) list = list.concat(p.sizes);
    if (p.colors) list = list.concat(p.colors);
    for (var i = 0; i < list.length; i++){
      var o = list[i];
      if (o.price == null) continue;
      if (o.name === size || o.name === color) return { price: o.price, compareAt: o.compareAt || null };
    }
    return { price: p.price, compareAt: p.compareAt || null };
  }

  global.LOWLABS = {
    products: PRODUCTS,
    goals: GOALS,
    categories: CATEGORIES,
    byHandle: function(h){ return BY_HANDLE[h]; },
    byGoal: function(id){ return BY_GOAL[id]; },
    /* Le seul point d'entrée des recommandations. Tout ce qui propose un
       produit à côté d'un autre passe par là : le bundle des fiches, les
       compléments de l'assistant par objectif, et ce qui viendra ensuite. */
    recommend: recommend,
    /* La recherche : produits d'abord, rayons ensuite. Aucun index externe,
       aucun appel réseau — le catalogue se suffit. */
    search: searchProducts,
    searchAisles: searchAisles,
    inCategory: function(cat){
      return PRODUCTS.filter(function(p){ return p.category === cat; });
    },
    money: money,
    variantOf: variantOf,
    priceOf: priceOf,
    url: function(h){ return "/productos/" + h; }
  };
})(window);
