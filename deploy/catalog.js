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
      image: CDN + "cirqa-negra.jpg?v=1785272697",
      hero: CDN + "cirqa-hero-entrenamiento.jpg?v=1785272697",
      /* Détouré : c'est cette vue qui sert au carrousel « Los más buscados »,
         où les produits flottent sans cadre. */
      packshot: "/media/productos/cirqa/cirqa-packshot.png",
      video: "/media/productos/cirqa/hero-cirqa.mp4",
      poster: "/media/productos/cirqa/poster-hero-cirqa.jpg",
      shopify: { handle: "garmin-cirqa-smart-band", variants: {
        "Negra":        { "S–M": "64093481107833", "L–XL": "64093481140601" },
        "Gris Francés": { "S–M": "64093481173369", "L–XL": "64093481206137" },
        "Malva":        { "S–M": "64093481238905", "L–XL": "64093481271673" },
        "Azul Capitán": { "S–M": "64093481304441", "L–XL": "64093481337209" }
      }},
      colors: [
        { name: "Negra",        dot: "#2b2b2e", image: CDN + "cirqa-negra.jpg?v=1785272697",        note: "Discreción total, del gimnasio a la oficina" },
        { name: "Gris Francés", dot: "#a99f88", image: CDN + "cirqa-gris-frances.jpg?v=1785272697", note: "Un neutro cálido que acompaña sin pedir atención" },
        { name: "Malva",        dot: "#a4787e", image: CDN + "cirqa-malva.jpg?v=1785272697",        note: "Suave y personal, para medir tu bienestar en calma" },
        { name: "Azul Capitán", dot: "#2e3f63", image: CDN + "cirqa-azul-capitan.jpg?v=1785272696", note: "Profundo y sereno, con carácter para todo el día" }
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
      shopify: { handle: "garmin-venu-4", variant: "64212128956793" },
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
      pairs: ["venu-4", "cirqa", "promix-relax"],
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
      videoRatio: "portrait"
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
      shopify: { handle: "the-absorption-company-sleep", variant: "64212136624505" },
      name: "The Absorption Company Sleep",
      short: "Sleep",
      brand: "The Absorption Company",
      tagline: "Siete sticks para dormir profundo, sin melatonina.",
      price: 499,
      badge: "Nuevo",
      category: "Suplementos",
      image: "/media/productos/absorption-sleep/absorption-sleep.png",
      hero: "/media/productos/absorption-sleep/absorption-sleep.png",
      packshot: "/media/productos/absorption-sleep/absorption-sleep.png",
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
      pairs: ["venu-4", "vivoactive-6", "creatina"],
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
      videoRatio: "portrait",
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
      image: "/media/landing/objetivos/goal-dormir.jpg",
      lede: "Sueño profundo, despertares medidos, rutina que se sostiene.",
      pick: "cirqa",
      also: ["absorption-sleep", "promix-relax"],
      why: "La CIRQA mide el sueño sin una pantalla que te despierte: puntuación, fases, VFC y temperatura de la piel, toda la noche."
    },
    {
      id: "rendimiento",
      label: "Performance",
      icon: "spark",
      image: "/media/landing/objetivos/goal-rendimiento.jpg",
      lede: "Entrenar con datos, no con sensaciones.",
      pick: "venu-4",
      also: ["promix-creatina", "creatina"],
      why: "Predisposición para entrenar, VO2 max y estado del entreno en una pantalla AMOLED que lees de un vistazo."
    },
    {
      id: "salud",
      label: "Cuidar mi salud diaria",
      icon: "heart",
      image: "/media/landing/objetivos/goal-salud.jpg",
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
    url: function(h){ return "/productos/" + h; }
  };
})(window);
