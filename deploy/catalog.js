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
      packshot: "/media/cirqa-packshot.png",
      video: "/media/hero-cirqa.mp4",
      poster: "/media/poster-hero-cirqa.jpg",
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
      name: "Garmin Venu® 4",
      short: "Venu® 4",
      brand: "Garmin",
      tagline: "La pantalla AMOLED que convierte tus datos en decisiones.",
      price: 10999,
      compareAt: 11499,
      badge: "Nuevo",
      category: "Wearables",
      image: "/media/venu-4.png",
      hero: "/media/venu-4.png",
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
      name: "Garmin Venu® 3S",
      short: "Venu® 3S",
      brand: "Garmin",
      tagline: "El mismo sistema Garmin, en una caja más compacta.",
      price: 8899,
      compareAt: 9399,
      category: "Wearables",
      image: "/media/venu-3s.png",
      hero: "/media/venu-3s.png",
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
      name: "Garmin Vívoactive® 6",
      short: "Vívoactive® 6",
      brand: "Garmin",
      tagline: "Lo esencial del entrenamiento, sin nada de más.",
      price: 5999,
      compareAt: 6299,
      category: "Wearables",
      image: "/media/vivoactive-6.png",
      hero: "/media/vivoactive-6.png",
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
      name: "Cymbiotika Liposomal Advanced Creatine",
      short: "Advanced Creatine",
      brand: "Cymbiotika",
      tagline: "5 g de creatina liposomal. Tono muscular y recuperación.",
      price: 1349,
      compareAt: 1499,
      badge: "Suplementos",
      category: "Suplementos",
      image: "/media/creatina.png",
      hero: "/media/creatina.png",
      highlights: [
        "5 g de creatina por sobre, sabor Tangerine Vanilla",
        "Tecnología liposomal para una absorción mejorada",
        "Apoya el rendimiento, la recuperación muscular y la salud cerebral*",
        "24 sobres líquidos de 30 mL — sin mezclar, sin grumos"
      ],
      specs: [
        ["Formato", "24 sobres líquidos × 30 mL (720 mL)"],
        ["Creatina", "5 g por porción"],
        ["Sabor", "Tangerine Vanilla"],
        ["Tecnología", "Liposomal — absorción mejorada"],
        ["Certificaciones", "Vegan, Non-GMO, Clean Label Project"],
        ["Formulación", "Por dietistas y científicos"]
      ],
      video: "/media/sup-creatina.mp4",
      poster: "/media/poster-sup-creatina.jpg",
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
      handle: "womens-multivitamin",
      name: "Cymbiotika Women's Multivitamin +18",
      short: "Women's Multivitamin",
      brand: "Cymbiotika",
      tagline: "Multivitamínico liposomal para mujeres, en sobres líquidos.",
      price: 400,
      badge: "Nuevo",
      category: "Suplementos",
      image: "/media/sup-womens.jpg",
      hero: "/media/sup-womens.jpg",
      video: "/media/sup-womens.mp4",
      packshot: "/media/sup-womens-cut.png",
      poster: "/media/sup-womens.jpg",
      videoRatio: "portrait",
      highlights: [
        "Vitaminas y minerales esenciales para mujeres de 18 años en adelante",
        "Tecnología liposomal para una absorción mejorada",
        "Sobres líquidos listos para tomar — sin mezclar, sin pastillas",
        "Vegan, Non-GMO y con trazabilidad total de ingredientes"
      ],
      specs: [
        ["Marca", "Cymbiotika"],
        ["Formato", "Sobres líquidos individuales"],
        ["Tecnología", "Liposomal — absorción mejorada"],
        ["Certificaciones", "Vegan, Non-GMO, Clean Label Project"],
        ["Formulación", "Por dietistas y científicos"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Cymbiotika",
        title: "Un solo sobre, todos los días.",
        text: "Sin frascos, sin dosificadores, sin pastillas que cuesta pasar. Un sobre líquido que te llevas donde quieras y tomas en segundos.*"
      }
    },
    {
      handle: "synbiotic",
      name: "Cymbiotika Synbiotic",
      short: "Synbiotic",
      brand: "Cymbiotika",
      tagline: "Probióticos y prebióticos en una sola cápsula.",
      price: 400,
      category: "Suplementos",
      image: "/media/ritual-essential.png",
      hero: "/media/ritual-essential.png",
      packshot: "/media/ritual-essential.png",
      highlights: [
        "Probióticos y prebióticos combinados en una sola toma",
        "Cápsula de liberación dirigida",
        "Apoya la digestión y el equilibrio intestinal*",
        "Vegan, Non-GMO y con trazabilidad total de ingredientes"
      ],
      specs: [
        ["Marca", "Cymbiotika"],
        ["Formato", "Cápsulas"],
        ["Tecnología", "Liberación dirigida"],
        ["Certificaciones", "Vegan, Non-GMO, Clean Label Project"],
        ["Formulación", "Por dietistas y científicos"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Cymbiotika",
        title: "La cápsula que llega hasta donde importa.",
        text: "Probióticos y prebióticos protegidos por una cápsula que no se abre antes de tiempo. Un gesto al día para el equilibrio intestinal.*"
      }
    },
    /* ---------------------------------------------------------------------
       Promix Nutrition. Prix convertis depuis les tarifs américains
       (59 $ et 29 $ US) à un taux arrondi : provisoires, à confirmer.
       Les packshots viennent du CDN de la marque, copiés en local.
       --------------------------------------------------------------------- */
    {
      handle: "promix-creatina",
      name: "Promix Micronized Creatine",
      short: "Micronized Creatine",
      brand: "Promix",
      tagline: "Creatina monohidratada micronizada, sin sabor ni aditivos.",
      price: 1199,
      category: "Suplementos",
      image: "/media/promix-creatine.png",
      hero: "/media/promix-creatine.png",
      highlights: [
        "5 g de creatina monohidratada por porción",
        "Partículas micronizadas, hasta 20 veces más finas, para disolverse mejor",
        "Sin sabor, sin endulzantes, sin rellenos ni transgénicos",
        "Probada por laboratorio externo"
      ],
      specs: [
        ["Marca", "Promix Nutrition"],
        ["Formato", "Bolsa de 900 g — 180 porciones"],
        ["Creatina", "5 g por porción"],
        ["Sabor", "Sin sabor"],
        ["Procesado", "Micronizado"],
        ["Envío", "Gratis a todo México"]
      ],
      story: {
        eyebrow: "Promix",
        title: "Creatina y nada más.",
        text: "Un solo ingrediente, molido lo bastante fino para desaparecer en el agua. Sin sabor que tapar, sin aditivos que explicar.*"
      }
    },
    {
      handle: "promix-debloat",
      name: "Promix Debloat Prebiotic + Probiotic",
      short: "Debloat",
      brand: "Promix",
      tagline: "Prebióticos y probióticos en sobres, tres sabores.",
      price: 599,
      category: "Suplementos",
      image: "/media/promix-debloat.png",
      hero: "/media/promix-debloat.png",
      video: "/media/promix-loop.mp4",
      poster: "/media/poster-promix-loop.jpg",
      packshot: "/media/promix-debloat.png",
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
      image: "/media/goal-dormir.jpg",
      lede: "Sueño profundo, despertares medidos, rutina que se sostiene.",
      pick: "cirqa",
      also: ["creatina"],
      why: "La CIRQA mide el sueño sin una pantalla que te despierte: puntuación, fases, VFC y temperatura de la piel, toda la noche."
    },
    {
      id: "rendimiento",
      label: "Performance",
      icon: "spark",
      image: "/media/goal-rendimiento.jpg",
      lede: "Entrenar con datos, no con sensaciones.",
      pick: "venu-4",
      also: ["promix-creatina"],
      why: "Predisposición para entrenar, VO2 max y estado del entreno en una pantalla AMOLED que lees de un vistazo."
    },
    {
      id: "salud",
      label: "Cuidar mi salud diaria",
      icon: "heart",
      image: "/media/goal-salud.jpg",
      lede: "Un registro continuo, sin volverlo una obsesión.",
      pick: "cirqa",
      also: ["womens-multivitamin", "synbiotic", "creatina"],
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
