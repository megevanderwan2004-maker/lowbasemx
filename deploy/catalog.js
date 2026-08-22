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
      pairs: ["absorption-sleep", "promix-relax", "creatina"],
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
      pairs: ["promix-creatina", "creatina", "absorption-sleep"],
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
      pairs: ["promix-relax", "absorption-sleep", "creatina"],
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
      pairs: ["promix-creatina", "promix-debloat", "absorption-sleep"],
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
      pairs: ["cirqa", "promix-relax", "venu-4"],
      shopify: { handle: "cymbiotika-liposomal-advanced-creatine", variant: "64212132823417" },
      name: "Cymbiotika Liposomal Advanced Creatine",
      short: "Advanced Creatine",
      brand: "Cymbiotika",
      tagline: "5 g de creatina liposomal. Tono muscular y recuperación.",
      price: 1349,
      compareAt: 1499,
      badge: "Suplementos",
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
      pairs: ["cirqa", "absorption-sleep", "venu-3s"],
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
      pairs: ["cirqa", "promix-relax", "venu-3s"],
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
      pairs: ["cirqa", "creatina", "venu-4"],
      shopify: { handle: "promix-non-gmo-creatine", variant: "64212133347705" },
      name: "Promix Non-GMO Creatine",
      short: "Non-GMO Creatine",
      brand: "Promix",
      tagline: "Creatina monohidratada micronizada, en sticks de 5 g.",
      price: 659,
      category: "Suplementos",
      image: "/media/productos/promix-creatina/promix-creatine-sticks.png",
      hero: "/media/productos/promix-creatina/promix-creatine-sticks.png",
      packshot: "/media/productos/promix-creatina/promix-creatine-sticks.png",
      /* Visuels de marque Promix. Le sachet porte « 30 × 5 g Stick Packs » :
         c'est l'emballage de nos 30 sticks, pas un autre format. */
      gallery: [
        "/media/productos/promix-creatina/promix-creatine-bolsa.jpg",
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
      pairs: ["cirqa", "promix-relax", "vivoactive-6"],
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
      pairs: ["cirqa", "absorption-sleep", "promix-relax"],
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
      also: ["absorption-sleep", "promix-relax"],
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
      also: ["promix-creatina", "creatina"],
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
    inCategory: function(cat){
      return PRODUCTS.filter(function(p){ return p.category === cat; });
    },
    money: money,
    variantOf: variantOf,
    priceOf: priceOf,
    url: function(h){ return "/productos/" + h; }
  };
})(window);
