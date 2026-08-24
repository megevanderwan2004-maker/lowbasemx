(function(){
  "use strict";

  /* =====================================================================
     Boutique Shopify — le checkout n'est branché que sur les produits
     qui déclarent un handle et des variantes dans catalog.js.
     Les autres pointent vers leur page produit locale.
     ===================================================================== */
  var STORE = "https://jx8irc-px.myshopify.com";
  var CHECKOUT_PARAMS = "&locale=es&country=MX";

  var CATALOG = window.LOWLABS || { products: [], byHandle: function(){ return null; },
                                    money: function(n){ return "$" + n; }, url: function(h){ return "/productos/" + h; } };

  /* La page produit se déclare via data-product sur <body>. Sur la home,
     l'attribut est absent : tous les modules produit se retirent seuls. */
  var PRODUCT = CATALOG.byHandle(document.body.getAttribute("data-product") || "");

  var state = {
    color: PRODUCT && PRODUCT.colors ? PRODUCT.colors[0].name : null,
    size:  PRODUCT && PRODUCT.sizes  ? PRODUCT.sizes[0].name  : null
  };
  var reduceMotion = document.documentElement.className.indexOf("rm") > -1;
  var hasIO = "IntersectionObserver" in window;

  function $(id){ return document.getElementById(id); }
  function each(list, fn){ Array.prototype.forEach.call(list, fn); }
  function esc(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  /* Bascule une classe sans toucher aux autres : réécrire className en
     entier effacerait celles que le générateur a posées — `.contain` sur
     les vues produit, par exemple, qui commande leur cadrage. */
  function flag(el, name, on){
    var re = new RegExp("(^|\\s)" + name + "(?=\\s|$)", "g");
    var base = el.className.replace(re, " ").replace(/\s+/g, " ").replace(/^ | $/g, "");
    el.className = on ? (base + " " + name) : base;
  }

  /* Chaque module est isolé : une panne dans l'un ne doit jamais empêcher
     les autres de s'initialiser — et surtout jamais laisser la page
     invisible, puisque .rv part d'une opacité nulle. */
  function module(name, fn){
    try { fn(); }
    catch(err){
      if (window.console && console.error) console.error("[lowlabs] " + name, err);
    }
  }

  /* =====================================================================
     Défilement fluide — une seule instance de Lenis

     Lenis pilote la position réelle du document : `position:sticky`, les
     ancres, les observateurs d'intersection et les surfaces fixes
     continuent donc de fonctionner sans adaptation.

     Trois garde-fous :
     · `autoRaf` — la boucle d'animation est celle de Lenis, la seule de
       la page. Aucune autre n'est ouverte ici.
     · `syncTouch:false` (défaut) — le tactile reste natif : sur
       téléphone le doigt garde l'inertie du système, les pistes
       horizontales leur élan, et rien ne verrouille le défilement.
     · mouvement réduit — Lenis honore `prefers-reduced-motion` de
       lui-même ; on ne le démarre même pas, la page garde son défilement
       natif.
     ===================================================================== */
  var lenis = null;

  /* Le seul point d'entrée pour amener la page quelque part : sans lui,
     un `window.scrollTo` pendant que Lenis anime laisserait les deux
     positions se contredire pendant une frame. */
  /* `opts` — `duration` en secondes et `easing` — pour les trajets qui
     doivent se voir : Lenis prend alors le pas sur son lerp d'instance. */
  function scrollToY(y, instant, opts){
    y = Math.max(0, Math.round(y));
    if (lenis){
      var o = { immediate: !!instant };
      if (opts && opts.duration) o.duration = opts.duration;
      if (opts && opts.easing) o.easing = opts.easing;
      lenis.scrollTo(y, o);
      return;
    }
    try { window.scrollTo({ top: y, behavior: instant ? "instant" : (reduceMotion ? "auto" : "smooth") }); }
    catch(e){ window.scrollTo(0, y); }
  }

  module("smooth-scroll", function(){
    if (reduceMotion || !window.Lenis) return;

    lenis = new window.Lenis({
      autoRaf: true,
      /* Inertie : plus le lerp est bas, plus la page continue sur sa
         lancée. À .1 l'effet passait inaperçu sur un trackpad, dont
         l'inertie système ressemble déjà à ça ; à .075 le glissement se
         voit à la souris comme au trackpad sans jamais retarder la main. */
      lerp: .075,
      wheelMultiplier: 1,
      /* Les ancres restent à nous : le site dégage la nav flottante avec
         `scroll-margin-top`, que Lenis ne relit pas. */
      anchors: false
    });

    /* Molette horizontale sur une piste : Lenis appelle preventDefault sur
       tous les événements `wheel` qu'il traite, ce qui tuerait le geste
       latéral au trackpad. On lui coupe donc l'événement — et rien
       d'autre — quand le geste est franchement horizontal ; le navigateur
       fait alors défiler la piste lui-même.
       Le tactile, lui, n'est jamais intercepté : Lenis ne le touche pas. */
    var TRACKS = ".cards,.goals,.gal-stage,.gal-thumbs,.rail-track";
    document.addEventListener("wheel", function(e){
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (!e.target || !e.target.closest || !e.target.closest(TRACKS)) return;
      e.stopPropagation();
    }, { capture: true, passive: true });

    /* Les liens d'ancrage de la page : on refait le calcul que le
       navigateur ferait (le retrait de `scroll-margin-top`) puis on laisse
       Lenis y glisser. Le lien d'évitement garde son saut instantané —
       c'est ce qu'attend un lecteur au clavier. */
    document.addEventListener("click", function(e){
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a || a.className.indexOf("skip") > -1) return;
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset
            - (parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0);
      scrollToY(y, false);
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    }, false);
  });

  /* Le seul contrôle exposé : le tiroir du panier verrouille la page en
     posant `overflow:hidden` sur le corps. Sans cet arrêt, Lenis
     continuerait d'avancer sa position interne sur une page devenue
     immobile — et la relâcherait d'un coup à la fermeture. */
  window.LOWSCROLL = {
    stop:  function(){ if (lenis) lenis.stop(); },
    start: function(){ if (lenis) lenis.start(); },
    to:    scrollToY
  };

  /* La carte produit est le seul gabarit : home, boutique et recommandation
     la réutilisent, aucune variante n'est dupliquée ailleurs. */
  /* Un produit qui déclare une vidéo l'utilise comme visuel de carte : la
     boucle remplace la photo dans la même boîte, l'affiche restant posée
     tant que la lecture n'a pas démarré (ou si elle est refusée). */
  function cardMedia(p){
    if (!p.video){
      return '<img loading="lazy" src="' + esc(p.image) + '" alt="" width="600" height="600">';
    }
    return '<video autoplay muted loop playsinline webkit-playsinline preload="metadata" ' +
      'disablepictureinpicture disableremoteplayback poster="' + esc(p.poster || p.image) + '" ' +
      'width="600" height="600" aria-hidden="true" tabindex="-1" data-autoloop>' +
        '<source src="' + esc(p.video) + '" type="video/mp4">' +
      '</video>';
  }

  function productCard(p){
    var url = CATALOG.url(p.handle);
    return '<article class="prod">' +
        '<a class="prod-media" href="' + url + '" tabindex="-1" aria-hidden="true">' +
          cardMedia(p) +
          (p.badge ? '<span class="prod-badge glass-dark">' + esc(p.badge) + '</span>' : "") +
        '</a>' +
        '<div class="prod-body">' +
          '<span class="prod-cat">' + esc(p.category) + '</span>' +
          '<h3 class="prod-name">' + esc(p.name) + '</h3>' +
          '<p class="prod-tag">' + esc(p.tagline) + '</p>' +
          '<div class="prod-price price-num">' +
            '<b>' + CATALOG.money(p.price) + '</b>' +
            (p.compareAt ? '<s>' + CATALOG.money(p.compareAt) + '</s>' : "") +
            '<small>MXN</small>' +
          '</div>' +
          '<a class="btn btn-ink btn-block btn-sm" href="' + url + '">Ver producto</a>' +
        '</div>' +
      '</article>';
  }

  /* La carte du carrousel « Los más buscados » : le produit flotte, sans
     cadre ni fond. Elle n'affiche que le packshot, un nom court et le
     prix — d'où le packshot détouré plutôt que la photo de la fiche. */
  function arrows(label){
    return '<div class="card-arrows">' +
        '<button class="btn btn-quiet btn-sm" type="button" data-dir="-1" aria-label="Ver los anteriores de ' + esc(label) + '">←</button>' +
        '<button class="btn btn-quiet btn-sm" type="button" data-dir="1" aria-label="Ver los siguientes de ' + esc(label) + '">→</button>' +
      '</div>';
  }

  /* Les suppléments qui ont une boucle la jouent dans le carrousel ; les
     wearables gardent leur packshot détouré. Le fond de studio de la
     boucle est dissous par le masque radial du CSS, sans quoi elle
     redeviendrait un rectangle au milieu des fiches qui flottent. */
  function flyMedia(p){
    if (p.category === "Suplementos" && p.video){
      return '<video autoplay muted loop playsinline webkit-playsinline preload="metadata" ' +
        'disablepictureinpicture disableremoteplayback poster="' + esc(p.poster || p.packshot || p.image) + '" ' +
        'width="600" height="600" aria-hidden="true" tabindex="-1" data-autoloop>' +
          '<source src="' + esc(p.video) + '" type="video/mp4">' +
        '</video>';
    }
    return '<img loading="lazy" src="' + esc(p.packshot || p.image) + '" alt="" width="600" height="600">';
  }

  function flyCard(p){
    return '<a class="fcard" href="' + CATALOG.url(p.handle) + '">' +
        '<span class="fcard-media">' + flyMedia(p) + '</span>' +
        '<b class="fcard-name">' + esc(p.short) + '</b>' +
        /* Le prix devient l'affordance : un bouton au même langage que
           « Comprar ». C'est un span — la carte entière est déjà un lien,
           et un <button> imbriqué dans un <a> serait invalide. */
        '<span class="btn btn-ink btn-sm fcard-buy price-num">' + CATALOG.money(p.price) + ' <small>MXN</small></span>' +
      '</a>';
  }

  /* =====================================================================
     Catalogue — rendu des cartes produit

     Rendu AVANT le module de révélation : les cartes injectées doivent
     être observables, sinon elles resteraient à opacité nulle.

     Une grille se déclare soit par exclusion (`data-exclude`, le reste du
     catalogue sous une fiche produit), soit par liste explicite
     (`data-handles`, la sélection éditoriale de la home).
     ===================================================================== */
  function pickHandles(list){
    return list.split(",")
      .map(function(h){ return CATALOG.byHandle(h.replace(/^\s+|\s+$/g, "")); })
      .filter(Boolean);
  }

  module("catalog", function(){
    each(document.querySelectorAll(".cat-grid[data-exclude],.cat-grid[data-handles]"), function(grid){
      var only = grid.getAttribute("data-exclude");
      var list = grid.getAttribute("data-handles");
      var items = list
        ? pickHandles(list)
        : CATALOG.products.filter(function(p){ return !only || p.handle !== only; });
      grid.innerHTML = items.map(productCard).join("");
    });
    /* Les pages de rayon (/wearables, /suplementos) ne listent aucun
       produit dans leur HTML : elles nomment une catégorie, et c'est
       catalog.js qui dit ce qu'elle contient. Ajouter ou retirer un
       produit du catalogue suffit donc à mettre la page à jour. */
    each(document.querySelectorAll(".cat-grid[data-category]"), function(grid){
      var items = CATALOG.inCategory(grid.getAttribute("data-category"));
      grid.innerHTML = items.map(productCard).join("");
      var count = document.querySelector('[data-count-for="' + grid.id + '"]');
      if (count){
        count.textContent = items.length + (items.length > 1 ? " productos" : " producto");
      }
    });
    each(document.querySelectorAll(".fcards[data-handles]"), function(track){
      track.innerHTML = pickHandles(track.getAttribute("data-handles")).map(flyCard).join("");
    });
  });

  /* =====================================================================
     Tri d'un rayon — trois entrées, aucune n'écrit dans l'URL ni ne
     persiste : c'est un confort de lecture, pas un état de la page.

     Les cartes sont déplacées, jamais re-rendues : un re-rendu casserait
     l'observateur qui met en pause les boucles produit hors écran, et
     redémarrerait chaque vidéo au premier tri.
     ===================================================================== */
  module("cat-sort", function(){
    each(document.querySelectorAll("[data-sort-for]"), function(bar){
      var grid = $(bar.getAttribute("data-sort-for"));
      if (!grid || !grid.getAttribute("data-category")) return;

      var base = CATALOG.inCategory(grid.getAttribute("data-category"));
      var nodes = Array.prototype.slice.call(grid.children);
      if (nodes.length !== base.length) return;

      var byHandle = {};
      each(base, function(p, i){ byHandle[p.handle] = nodes[i]; });

      var ORDER = {
        "destacados": null,
        "precio-asc":  function(a, b){ return a.price - b.price; },
        "precio-desc": function(a, b){ return b.price - a.price; }
      };

      each(bar.querySelectorAll("button"), function(b){
        b.addEventListener("click", function(){
          var cmp = ORDER[b.getAttribute("data-sort")];
          var items = base.slice();
          if (cmp) items.sort(cmp);
          each(items, function(p){ grid.appendChild(byHandle[p.handle]); });
          each(bar.querySelectorAll("button"), function(o){
            o.setAttribute("aria-pressed", o === b ? "true" : "false");
          });
        }, false);
      });
    });
  });

  /* =====================================================================
     Boutique — un rayon par catégorie, dans l'ordre du catalogue
     ===================================================================== */
  module("shop", function(){
    var host = $("shop-sections");
    if (!host || !CATALOG.categories) return;

    /* Les ancres du menu de la boutique doivent rester stables :
       on les dérive du nom de catégorie, pas de son index. */
    function slug(s){
      return s.toLowerCase()
        .replace(/[áàä]/g,"a").replace(/[éèë]/g,"e").replace(/[íìï]/g,"i")
        .replace(/[óòö]/g,"o").replace(/[úùü]/g,"u")
        .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
    }

    var html = "";
    each(CATALOG.categories, function(cat){
      var items = CATALOG.inCategory(cat);
      if (!items.length) return;
      var id = slug(cat);
      /* La piste sort du conteneur : c'est son encoche interne qui aligne
         la première carte sur la grille, et le débord qui laisse deviner
         la suivante. */
      html +=
        '<section class="shop-sec" id="' + id + '" aria-labelledby="' + id + '-t">' +
          '<div class="container">' +
            '<div class="section-head rv">' +
              '<div>' +
                '<span class="eyebrow">' + esc(cat) + '</span>' +
                '<h2 id="' + id + '-t">' + esc(cat) + '</h2>' +
              '</div>' +
              '<div class="head-aside">' +
                '<p class="shop-count">' + items.length +
                  (items.length > 1 ? " productos" : " producto") + '</p>' +
                arrows(cat) +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="cards fcards rv">' + items.map(flyCard).join("") + '</div>' +
        '</section>';
    });
    host.innerHTML = html;

    /* Les rayons naissent ici, donc après que le navigateur a traité le
       fragment de l'URL : arriver sur /tienda#wearables laissait la page
       calée n'importe où, l'ancre n'existant pas encore au moment du
       saut. On rejoue le saut une fois les sections posées. */
    var target = location.hash && document.getElementById(location.hash.slice(1));
    if (!target) return;

    function land(){
      /* `html` porte scroll-behavior:smooth : « auto » s'y résout en
         glissement animé, qu'un autre défilement annule en cours de
         route. « instant » est le seul mot-clé qui passe outre.
         La marge d'ancrage n'étant honorée que par scrollIntoView, on la
         relit pour la déduire nous-mêmes : c'est elle qui dégage la nav
         flottante au-dessus du titre du rayon. */
      var y = target.getBoundingClientRect().top + window.pageYOffset
            - (parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0);
      /* Instantané : c'est un atterrissage, pas un déplacement voulu par
         le lecteur — et Lenis animerait par-dessus le saut du navigateur. */
      scrollToY(y, true);
    }

    /* Se poser une seule fois ne tient pas : le navigateur exécute son
       propre saut vers le fragment APRÈS ce script — sur une ancre qui
       n'existait pas quand il a lu l'URL, donc au mauvais endroit — et
       la mise en page bouge encore ensuite (images des rayons au-dessus,
       métriques des deux webfonts, repli des flèches d'un carrousel qui
       tient à l'écran). On repose donc à chaque secousse, jusqu'à ce que
       tout se stabilise.

       La garde n'est pas la position — le saut du navigateur en ferait
       une fausse « intervention du lecteur » et nous ferait renoncer —
       mais un vrai geste : au premier doigt, molette ou touche, on ne
       touche plus à rien. */
    var touched = false;
    function markTouched(){ touched = true; }
    var GESTURES = ["wheel", "touchstart", "keydown", "pointerdown"];
    for (var gi = 0; gi < GESTURES.length; gi++){
      window.addEventListener(GESTURES[gi], markTouched, { passive: true });
    }
    function reland(){ if (!touched) land(); }

    land();
    /* Après la mise en page suivante, donc après le saut du navigateur. */
    if (window.requestAnimationFrame) requestAnimationFrame(reland);
    window.addEventListener("load", reland, false);
    if (window.ResizeObserver){
      var ro = new ResizeObserver(reland);
      ro.observe(document.body);
      /* Deux secondes : au-delà, plus rien ne bouge de lui-même, et
         continuer à observer ferait sauter la page sous un lecteur. */
      setTimeout(function(){ ro.disconnect(); }, 2000);
    }
  });

  /* =====================================================================
     Assistant — l'utilisateur part d'un objectif, pas d'un produit

     Aucun état n'est persisté et rien n'est envoyé : la recommandation
     est une simple correspondance objectif → handle, résolue dans
     catalog.js. Le bloc reste absent du DOM tant que rien n'est choisi.
     ===================================================================== */
  /* Le visuel d'un objectif est une boucle muette, au même gabarit que
     celles des chapitres : mêmes attributs, même `data-autoloop`, donc
     la même mise en pause hors écran. Une fiche qui n'a qu'une photo
     retombe sur l'image. */
  function goalMedia(g){
    if (g.video){
      return '<span class="goal-media">' +
        '<video autoplay muted loop playsinline webkit-playsinline preload="metadata" ' +
          'disablepictureinpicture disableremoteplayback poster="' + esc(g.poster || "") + '" ' +
          'width="720" height="1280" aria-hidden="true" tabindex="-1" data-autoloop>' +
          '<source src="' + esc(g.video) + '" type="video/mp4">' +
        '</video></span>';
    }
    if (g.image){
      return '<span class="goal-media"><img loading="lazy" src="' + esc(g.image) + '" alt="" width="720" height="1280"></span>';
    }
    return "";
  }

  module("goals", function(){
    var stage = $("goals-stage"),
        host  = $("goals"),
        wrap  = $("reco-wrap"),
        out   = $("reco"),
        back  = $("reco-back");
    if (!stage || !host || !wrap || !out || !back || !CATALOG.goals) return;

    /* Même seuil que la feuille de style. Au-dessus, le plateau est une
       rangée : la carte choisie VOYAGE jusqu'à la place de la première.
       En dessous il est une colonne : elle SE REPLIE en bandeau. Deux
       gestes différents, un seul état — c'est le format qui décide, pas
       le script. */
    function narrow(){
      return window.matchMedia
        ? window.matchMedia("(max-width: 719px)").matches
        : window.innerWidth <= 719;
    }

    /* Les cartes ne sont plus des boutons radio. Le geste a changé : il ne
       s'agit plus de cocher une option parmi trois mais d'en OUVRIR une,
       et `aria-expanded` le dit exactement. Conséquence directe : plus de
       tabindex tournant — les trois cartes sont trois boutons ordinaires,
       la tabulation les parcourt, les flèches ne font que déplacer le
       focus (voir plus bas), et l'ouverture demande Entrée ou Espace.
       Le pseudo-bouton « Ver selección » reste un span : la carte est déjà
       un bouton, un bouton imbriqué serait invalide. */
    host.innerHTML = CATALOG.goals.map(function(g){
      return '<button class="goal" type="button" aria-expanded="false" aria-controls="reco" ' +
          'data-goal="' + esc(g.id) + '">' +
          goalMedia(g) +
          /* La nacelle est transparente : c'est le voile en dégradé de la
             carte (.goal::after) qui porte la lisibilité, et seul le
             pseudo-bouton garde sa surface de verre. */
          '<span class="goal-body">' +
            '<span class="goal-txt"><b>' + esc(g.label) + '</b></span>' +
            '<span class="goal-cta glass-light blurred">Ver selección</span>' +
          '</span>' +
        '</button>';
    }).join("");

    var buttons = Array.prototype.slice.call(host.querySelectorAll(".goal"));
    var openBtn = null;   /* la carte ouverte, ou null */
    var timers  = [];     /* les étapes en attente — toutes annulables */

    function later(fn, ms){ timers.push(setTimeout(fn, ms)); }
    /* Un second clic pendant qu'une chorégraphie se joue ne doit pas
       empiler deux séquences : chaque entrée commence par tout annuler.
       C'est ce qui rend l'aller-retour rapide inoffensif. */
    function cancel(){ while (timers.length) clearTimeout(timers.pop()); }

    function render(g){
      var p = CATALOG.byHandle(g.pick);
      if (!p) return;
      var also = (g.also || []).map(CATALOG.byHandle).filter(Boolean);

      /* Trois retraits par rapport à la version longue, tous pour la même
         raison — la carte disait deux fois la même chose :
         · le titre reprenait l'objectif, déjà porté par la carte restée à
           gauche ;
         · `p.tagline` doublait `g.why`, et c'est `why` qui est utile : il
           dit pourquoi CE produit pour CET objectif ;
         · « Ver toda la tienda » renvoyait ailleurs au moment précis où l'on
           vient de répondre à la question posée.
         Reste une ligne de contexte, une vignette, une raison, un prix, une
         action. Ces trois blocs — `.reco-head`, `.reco-grid`, `.reco-also` —
         sont aussi les trois lignes que la CSS fait monter l'une après
         l'autre à l'ouverture : les renommer casserait le décalé. */
      out.innerHTML =
        '<p class="reco-head">' +
          '<span class="eyebrow">Tu recomendación</span>' +
          '<span class="reco-goal">' + esc(g.label) + '</span>' +
        '</p>' +
        '<div class="reco-grid">' +
          '<span class="reco-media"><img src="' + esc(p.image) + '" alt="" width="600" height="600"></span>' +
          '<div class="reco-body">' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p>' + esc(g.why) + '</p>' +
            '<p class="reco-price price-num">' +
              '<b>' + CATALOG.money(p.price) + '</b>' +
              (p.compareAt ? '<s>' + CATALOG.money(p.compareAt) + '</s>' : "") +
              '<small>MXN · Envío gratis</small>' +
            '</p>' +
            '<a class="btn btn-ink btn-sm" href="' + CATALOG.url(p.handle) + '">Ver ' + esc(p.short) + '</a>' +
          '</div>' +
        '</div>' +
        (also.length
          ? '<div class="reco-also">' +
              '<p class="reco-also-t">Se complementa bien con</p>' +
              '<div class="reco-also-list">' +
                also.map(function(a){
                  return '<a class="reco-chip" href="' + CATALOG.url(a.handle) + '">' +
                    '<img loading="lazy" src="' + esc(a.image) + '" alt="" width="44" height="44">' +
                    '<span><b>' + esc(a.short) + '</b><small>' + CATALOG.money(a.price) + ' MXN</small></span>' +
                  '</a>';
                }).join("") +
              '</div>' +
            '</div>'
          : "");
    }

    /* -------------------------------------------------------------------
       FLIP — la seule chose que la CSS ne peut pas faire seule

       Le principe : on mesure AVANT (`first`), on laisse le navigateur
       poser la mise en page d'arrivée, on mesure APRÈS, puis on repousse
       l'élément à sa position de départ d'un coup et on le relâche. Il
       n'anime donc jamais une mise en page, seulement une transformée —
       et la place qu'il occupe dans la rangée est la bonne dès la
       première image.
       ------------------------------------------------------------------- */
    /* Au large : la carte change de place, jamais de taille. */
    function travel(el, first, ms, done){
      var last = el.getBoundingClientRect();
      var dx = first.left - last.left, dy = first.top - last.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5){ if (done) done(); return; }
      el.style.transition = "none";
      el.style.transform  = "translate(" + Math.round(dx) + "px," + Math.round(dy) + "px)";
      /* Lire une valeur calculée force le navigateur à APPLIQUER l'état de
         départ avant qu'on pose celui d'arrivée. Sans cette lecture les
         deux seraient regroupés dans la même image et rien ne bougerait. */
      void el.offsetWidth;
      el.style.transition = "transform " + ms + "ms var(--goals-ease)";
      el.style.transform  = "";
      later(function(){
        el.style.transition = ""; el.style.transform = "";
        if (done) done();
      }, ms);
    }

    /* Sur téléphone : la carte change de taille, jamais de place. Deux
       propriétés animées sur UN élément dont l'unique enfant est en
       position absolue — c'est assez peu pour tenir la fréquence d'images.
       `object-fit:cover` sur la boucle fait le reste : elle est recadrée,
       jamais déformée. */
    function fold(el, first, ms, done){
      var last = el.getBoundingClientRect();
      if (Math.abs(first.height - last.height) < .5 &&
          Math.abs(first.width  - last.width)  < .5){ if (done) done(); return; }
      el.style.setProperty("--goals-fold", ms + "ms");
      flag(el, "is-folding", true);
      el.style.transition = "none";
      el.style.width  = first.width  + "px";
      el.style.height = first.height + "px";
      void el.offsetWidth;
      el.style.transition = "width " + ms + "ms var(--goals-ease),height " + ms + "ms var(--goals-ease)";
      el.style.width  = last.width  + "px";
      el.style.height = last.height + "px";
      later(function(){
        el.style.transition = ""; el.style.width = ""; el.style.height = "";
        el.style.removeProperty("--goals-fold");
        flag(el, "is-folding", false);
        if (done) done();
      }, ms);
    }

    /* -------------------------------------------------------------------
       Le glissement de la page

       Il ne se déclenche plus systématiquement. Depuis que le plateau
       garde exactement la même boîte ouvert et fermé, il n'y a le plus
       souvent RIEN à rattraper sur grand écran : bouger la page serait un
       mouvement gratuit, et franchement agaçant pour qui essaie les trois
       objectifs l'un après l'autre. On ne glisse donc que si le plateau
       déborde vraiment de l'écran — en pratique sur téléphone et sur les
       petits portables.
       Quand il glisse, il se pose : 1,1s en quintique sortante, le trajet
       part franchement puis s'amortit longuement sur la fin.
       ------------------------------------------------------------------- */
    function settle(instant, landing){
      var box = stage.getBoundingClientRect();
      /* Le dégagement se mesure sur la pilule elle-même : elle est fixe,
         change de hauteur sous 1024px et porte ses propres marges. */
      var pill = document.querySelector(".nav-pill");
      var haut = pill ? pill.getBoundingClientRect().bottom + 18 : 96;
      /* Déjà en vue, et en entier : il n'y a rien à rattraper. Un
         atterrissage, lui, se cale toujours — la page vient de s'ouvrir,
         personne n'a encore rien lu. */
      if (!landing && box.top >= haut && box.bottom <= window.innerHeight) return;

      /* On préfère caler la SECTION plutôt que le seul plateau : l'amorce
         et la question restent alors lisibles au-dessus de leur réponse,
         ce qui vaut mieux qu'un panneau qui arrive seul avec son titre
         coupé par le haut de l'écran. On ne se rabat sur le plateau que si
         la section entière ne tient pas sous la nav — sur téléphone,
         essentiellement.
         `landing` lève cette réserve : quelqu'un qui arrive par
         `#objetivo=rendimiento`, depuis une campagne par exemple, doit
         d'abord lire la question. Que la réponse dépasse sous la ligne de
         flottaison n'est pas un problème, c'est une invitation à
         descendre — alors qu'un gros titre tronqué en haut d'écran est un
         accident. */
      var cible = stage, sec = $("objetivo");
      if (sec){
        var haine = sec.getBoundingClientRect().top;
        if (landing || haut + (box.bottom - haine) <= window.innerHeight) cible = sec;
      }
      var cb = cible.getBoundingClientRect();
      scrollToY((window.pageYOffset || document.documentElement.scrollTop) + cb.top - haut,
        !!instant, { duration: 1.1, easing: function(t){ return 1 - Math.pow(1 - t, 5); } });
    }

    /* L'objectif ouvert s'écrit dans l'URL : le lien devient partageable,
       et une campagne qui parle de sommeil peut faire atterrir directement
       sur la recommandation « dormir ». `replaceState` et non `pushState` :
       celui qui essaie les trois objectifs ne doit pas avoir à appuyer
       quatre fois sur « précédent » pour quitter le site. Le retour reste
       donc « ← Volver », Échap, et le clic hors du plateau. */
    function stamp(id){
      if (!window.history || !history.replaceState) return;
      try {
        history.replaceState(null, "",
          location.pathname + location.search +
          (id ? "#objetivo=" + encodeURIComponent(id) : "#objetivo"));
      } catch(e){}
    }

    /* Le sens dans lequel une carte écartée sort — et revient : vers
       l'extérieur, chacune de son côté de la carte ouverte. */
    function push(j, i){ return (j < i ? "-28px" : "28px"); }

    /* -------------------------------------------------------------------
       Ouvrir
       ------------------------------------------------------------------- */
    function openGoal(btn, opts){
      opts = opts || {};
      var g = CATALOG.byGoal(btn.getAttribute("data-goal"));
      if (!g || openBtn === btn) return;
      cancel();

      var i = buttons.indexOf(btn);
      var first = btn.getBoundingClientRect();
      var small = narrow();

      /* Le basculement d'état lui-même : les deux autres quittent la
         rangée POUR DE BON — c'est ce retrait, et lui seul, qui libère la
         place que le panneau vient prendre. */
      function place(){
        each(buttons, function(b){
          if (b === btn) return;
          b.hidden = true;
          flag(b, "is-leaving", false);
          b.style.transitionDelay = "";
          b.style.removeProperty("--goals-push");
        });
        btn.setAttribute("aria-expanded", "true");
        flag(stage, "is-open", true);
        wrap.hidden = false;
        render(g);
        openBtn = btn;
        stamp(g.id);
      }

      function focusPanel(){
        /* `preventScroll` est la moitié qui compte : sans lui, le
           navigateur saute d'un coup sur l'élément focalisé et c'est CE
           saut qu'on voyait, pas un défilement. On le lui retire, puis on
           refait le trajet nous-mêmes s'il y a lieu. */
        try { out.focus({ preventScroll: true }); } catch(e){ out.focus(); }
      }

      /* Mouvement réduit, ou ouverture directe depuis l'URL : pas de
         chorégraphie du tout. On arrive, c'est ouvert. */
      if (reduceMotion || opts.instant){
        place();
        flag(wrap, "is-in", true);
        if (opts.focus) focusPanel();
        settle(!!opts.instant, !!opts.landing);
        return;
      }

      /* 1. Les deux autres partent vers l'extérieur, à 40ms d'écart. */
      var k = 0;
      each(buttons, function(b, j){
        if (b === btn) return;
        b.style.setProperty("--goals-push", push(j, i));
        b.style.transitionDelay = (k++ * 40) + "ms";
        flag(b, "is-leaving", true);
      });

      /* 2. 240ms de sortie + 40ms de retard pour la seconde : la place est
            libre, la carte choisie peut la rejoindre. */
      later(function(){
        place();
        if (small) fold(btn, first, 340, function(){ settle(false); });
        else { travel(btn, first, 400, null); settle(false); }

        /* 3. Le panneau s'ouvre PENDANT que la carte finit son trajet.
              Ce recouvrement est le détail qui empêche la séquence de se
              lire comme trois étapes distinctes : à l'œil, c'est un seul
              mouvement qui se transforme. */
        later(function(){ flag(wrap, "is-in", true); }, 100);
        if (opts.focus) later(focusPanel, 140);
      }, 280);
    }

    /* -------------------------------------------------------------------
       Refermer — le miroir exact, en plus court. Un retour ne se contemple
       pas : 160 + 260ms là où l'aller en prend 280 + 400.
       ------------------------------------------------------------------- */
    function closeGoal(opts){
      opts = opts || {};
      if (!openBtn) return;
      cancel();

      var btn = openBtn, i = buttons.indexOf(btn), small = narrow();
      var first = btn.getBoundingClientRect();

      function restore(){
        each(buttons, function(b){
          b.hidden = false;
          flag(b, "is-leaving", false);
          b.style.transitionDelay = "";
        });
        btn.setAttribute("aria-expanded", "false");
        flag(stage, "is-open", false);
        flag(wrap, "is-in",  false);
        flag(wrap, "is-out", false);
        wrap.hidden = true;
        openBtn = null;
        stamp(null);
        /* Sur téléphone la piste redéfile dès qu'elle a de nouveau trois
           cartes : on la ramène sur celle qu'on vient de quitter, sinon
           elle réapparaîtrait hors de l'écran, à droite. */
        if (small){
          host.scrollLeft = Math.max(0,
            btn.offsetLeft - (host.clientWidth - btn.offsetWidth) / 2);
        }
      }

      function giveBack(){
        if (!opts.focus) return;
        try { btn.focus({ preventScroll: true }); } catch(e){ btn.focus(); }
      }

      if (reduceMotion || opts.instant){ restore(); giveBack(); return; }

      /* 1. La colonne s'efface d'un bloc et repart vers la droite, d'où
            elle était venue. Un essuyage inverse ligne par ligne ferait
            durer une sortie qui doit être immédiate. */
      flag(wrap, "is-out", true);

      later(function(){
        restore();
        if (small) fold(btn, first, 260, null);
        else travel(btn, first, 260, null);

        /* 2. Les deux autres reviennent de l'extérieur, dans l'ordre où
              elles étaient parties. `both` sur l'animation les tient
              invisibles pendant leur retard : sans lui, elles
              apparaîtraient une image avant de commencer. */
        var k = 0;
        each(buttons, function(b, j){
          if (b === btn) return;
          b.style.setProperty("--goals-push", push(j, i));
          b.style.animationDelay = (60 + k++ * 40) + "ms";
          flag(b, "is-coming", true);
        });
        later(function(){
          each(buttons, function(b){
            flag(b, "is-coming", false);
            b.style.animationDelay = "";
            b.style.removeProperty("--goals-push");
          });
        }, 420);

        giveBack();
      }, 160);
    }

    /* -------------------------------------------------------------------
       Commandes
       ------------------------------------------------------------------- */
    each(buttons, function(b){
      b.addEventListener("click", function(){
        /* La carte ouverte referme : c'est un bouton d'ouverture, il se
           comporte comme tel dans les deux sens. Une seconde façon de
           revenir, en plus du lien au-dessus du panneau. */
        if (openBtn === b) closeGoal({ focus: true });
        else openGoal(b, { focus: true });
      }, false);
    });

    back.addEventListener("click", function(){ closeGoal({ focus: true }); }, false);

    /* Échap ferme, où que soit le focus dans le plateau — y compris dans
       le panneau, où il atterrit à l'ouverture. */
    stage.addEventListener("keydown", function(e){
      if (!openBtn) return;
      if (e.key !== "Escape" && e.key !== "Esc") return;
      e.preventDefault();
      closeGoal({ focus: true });
    }, false);

    /* Un clic hors du plateau ferme aussi. En phase de bouillonnement, et
       donc APRÈS le gestionnaire des cartes : le clic qui vient d'ouvrir
       remonte bien jusqu'ici, mais sa cible est dans le plateau et la
       remontée s'arrête là. */
    document.addEventListener("click", function(e){
      if (!openBtn) return;
      var n = e.target;
      while (n && n !== document){
        if (n === stage) return;
        n = n.parentNode;
      }
      closeGoal({});
    }, false);

    /* Les flèches ne font plus que DÉPLACER le focus. Avant, elles
       cochaient l'option suivante — c'était juste pour un groupe de
       boutons radio ; maintenant qu'un choix ouvre un panneau, elles
       déclencheraient trois ouvertures pour traverser la piste. */
    host.addEventListener("keydown", function(e){
      var d = (e.key === "ArrowRight" || e.key === "ArrowDown") ?  1
            : (e.key === "ArrowLeft"  || e.key === "ArrowUp")   ? -1 : 0;
      if (!d) return;
      var libres = [];
      each(buttons, function(b){ if (!b.hidden) libres.push(b); });
      var i = libres.indexOf(document.activeElement);
      /* Ouvert, il ne reste qu'une carte : la flèche n'a nulle part où
         aller et la page doit garder son défilement au clavier. */
      if (i < 0 || libres.length < 2) return;
      e.preventDefault();
      libres[(i + d + libres.length) % libres.length].focus();
    }, false);

    /* Ouverture directe : `#objetivo=dormir`. Aucun élément ne porte cet
       identifiant, le navigateur ne sait donc pas résoudre l'ancre — c'est
       à nous d'amener la page sur la section, et sans animation : à
       l'arrivée sur une page on atterrit, on ne glisse pas. Le court
       décalage laisse Lenis démarrer avant qu'on lui demande un trajet. */
    var direct = /^#objetivo=(.+)$/.exec(location.hash || "");
    if (direct){
      var vise = null;
      each(buttons, function(b){
        if (b.getAttribute("data-goal") === decodeURIComponent(direct[1])) vise = b;
      });
      if (vise){
        /* Au RECHARGEMENT, le navigateur repose la page où elle était à la
           visite précédente — et il le fait APRÈS ce premier calage, qui
           passerait donc à la trappe. On lui retire la main le temps de
           l'atterrissage, puis on la lui rend une fois `load` passé pour
           que les rechargements suivants retrouvent leur comportement
           normal. La seconde passe de `settle` est la ceinture : si la
           restauration a malgré tout eu lieu, elle la corrige. */
        var garde = null;
        try {
          garde = history.scrollRestoration;
          history.scrollRestoration = "manual";
        } catch(e){}
        setTimeout(function(){ openGoal(vise, { instant: true, landing: true }); }, 60);
        window.addEventListener("load", function(){
          setTimeout(function(){
            if (openBtn === vise) settle(true, true);
            try { if (garde) history.scrollRestoration = garde; } catch(e){}
          }, 0);
        }, false);
      }
    }
  });

  /* =====================================================================
     Révélation au scroll

     Les éléments .rv démarrent invisibles : si cette étape échouait, la
     page entière resterait blanche. D'où le garde-fou : si l'observateur
     n'a jamais été déclenché au bout de 4 s (API absente, rappel jamais
     appelé, onglet ouvert en arrière-plan), on révèle tout d'un coup.
     ===================================================================== */
  var revealFired = false;

  module("reveal", function(){
    var targets = document.querySelectorAll(".rv");
    if (!targets.length) { revealFired = true; return; }

    function revealAll(){
      each(document.querySelectorAll(".rv"), function(el){
        if (el.className.indexOf(" in") === -1) el.className += " in";
      });
    }

    if (!hasIO){ revealFired = true; revealAll(); return; }

    var io = new IntersectionObserver(function(entries){
      revealFired = true;
      each(entries, function(e){
        if (!e.isIntersecting) return;
        if (e.target.className.indexOf(" in") === -1) e.target.className += " in";
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });

    each(targets, function(el, i){
      el.style.transitionDelay = (Math.min(i % 6, 4) * 40) + "ms";
      io.observe(el);
    });

    setTimeout(function(){ if (!revealFired) revealAll(); }, 4000);
  });

  /* =====================================================================
     Hero — vidéo automatique, muette, en boucle

     L'affiche et la vidéo occupent la même boîte : si la lecture est
     refusée (mode économie d'énergie iOS, réglage « ne jamais lire »),
     l'affiche reste et la section est complète — aucun trou, aucun reflow.
     ===================================================================== */
  module("hero-video", function(){
    var hero = $("hero"), v = $("hero-video"), toggle = $("hero-toggle"), icon = $("hero-toggle-icon");
    /* icon fait partie du garde : sans lui, sync() lèverait une exception et
       l'affiche resterait posée sur une vidéo en train de jouer. */
    if (!hero || !v || !toggle || !icon) return;

    var ICON_PAUSE = '<rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/>';
    var ICON_PLAY  = '<path d="M8 5v14l11-7z"/>';
    /* Distingue une pause voulue (bouton, hors écran, onglet caché) d'une
       pause imposée par le navigateur : sans ça, le repli s'afficherait
       à chaque fois que la section sort du champ. */
    var intentionalPause = false;

    function sync(){
      var paused = v.paused;
      hero.className = paused
        ? hero.className.replace(/\s*is-playing/g, "")
        : (hero.className.replace(/\s*is-playing/g, "") + " is-playing");
      icon.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.setAttribute("aria-label", paused ? "Reproducir el video de fondo" : "Pausar el video de fondo");
    }

    function attempt(){
      /* La propriété IDL est ce que lit la politique d'autoplay ; l'attribut
         HTML seul n'alimente que defaultMuted une fois l'élément créé. */
      v.muted = true;
      v.defaultMuted = true;
      var p;
      try { p = v.play(); } catch(e){ sync(); return; }
      if (p && typeof p.then === "function") p.then(sync)["catch"](sync);
      else setTimeout(sync, 1200);
    }

    v.addEventListener("playing", sync, false);
    v.addEventListener("pause", sync, false);

    if (reduceMotion){
      /* Aucun mécanisme CSS n'arrête une lecture : il faut retirer
         l'attribut et mettre en pause. L'affiche devient l'image du hero. */
      v.removeAttribute("autoplay");
      v.pause();
      sync();
    } else {
      attempt();
    }

    toggle.addEventListener("click", function(){
      if (v.paused){
        /* En mouvement réduit la vidéo est masquée par CSS : l'appui sur
           lecture est un consentement explicite, il faut donc aussi la
           rendre visible, sans quoi elle jouerait derrière l'affiche. */
        if (reduceMotion && hero.className.indexOf("motion-ok") === -1){
          hero.className += " motion-ok";
        }
        intentionalPause = false;
        attempt();
      } else {
        intentionalPause = true;
        v.pause();
      }
    }, false);

    /* Hors écran : on met en pause pour la batterie. Jamais load() ni
       currentTime = 0 — cela relancerait la sélection de ressource,
       ferait réapparaître l'affiche et casserait la boucle. */
    /* inView par défaut à true : sans IntersectionObserver on ne peut pas
       savoir, et mieux vaut jouer que rester figé sur l'affiche. */
    var inView = true;
    if (hasIO){
      new IntersectionObserver(function(entries){
        var e = entries[entries.length - 1];
        inView = e.isIntersecting;
        if (inView){
          if (!intentionalPause && !reduceMotion && v.paused) attempt();
        } else if (!v.paused){
          v.pause();
        }
      }, { threshold: 0.15 }).observe(v);
    }
    /* Au retour sur l'onglet on ne relance que si le hero est encore à
       l'écran : l'observateur ne se redéclenche pas tout seul, la vidéo
       jouerait sinon indéfiniment hors champ. */
    document.addEventListener("visibilitychange", function(){
      if (document.hidden){
        if (!v.paused) v.pause();
      } else if (inView && !intentionalPause && !reduceMotion && v.paused){
        attempt();
      }
    }, false);
  });

  /* =====================================================================
     Boucles de section (bannières vidéo)

     Décoratives : aucune commande de lecture n'est requise puisque le
     mouvement réduit les fige sur leur affiche. Elles ne jouent que
     lorsqu'elles sont à l'écran.
     ===================================================================== */
  module("section-loops", function(){
    var vids = document.querySelectorAll("video[data-autoloop]");
    if (!vids.length) return;

    each(vids, function(v){
      if (reduceMotion){
        v.removeAttribute("autoplay");
        v.pause();
        return;
      }
      function attempt(){
        v.muted = true; v.defaultMuted = true;
        var p;
        try { p = v.play(); } catch(e){ return; }
        if (p && typeof p["catch"] === "function") p["catch"](function(){});
      }
      if (!hasIO){ attempt(); return; }
      new IntersectionObserver(function(entries){
        var e = entries[entries.length - 1];
        if (e.isIntersecting){ if (v.paused) attempt(); }
        else if (!v.paused){ v.pause(); }
      }, { threshold: 0.2 }).observe(v);
    });

    document.addEventListener("visibilitychange", function(){
      if (!document.hidden) return;
      each(vids, function(v){ if (!v.paused) v.pause(); });
    }, false);
  });

  /* =====================================================================
     Flou des surfaces fixes

     Tant que la vidéo joue derrière la nav et le dock, le fond serait
     rééchantillonné à la fréquence des images. Le flou n'est activé
     qu'une fois le hero dépassé. Sur une page sans hero vidéo (page
     produit), il est actif d'entrée.
     ===================================================================== */
  module("past-hero", function(){
    /* .has-hero est posée dans le HTML, pas ici : elle conditionne la
       réserve haute de la carte, qui doit être bonne dès la première
       peinture — sinon le contenu saute au chargement du script. */
    /* Le visuel d'ouverture, quel qu'il soit : le hero de la home, ou la
       bannière plein écran d'une page de rayon. Jusqu'au 22/08/2026 seul
       `#hero` comptait, donc les deux rayons recevaient `past-hero` d'entrée
       — le dock y rééchantillonnait le fond de la bannière en permanence,
       exactement ce que la règle `body:not(.past-hero) .dock-shell` cherche
       à éviter, et la pilule n'avait aucun moyen de savoir qu'elle flottait
       sur une vidéo. */
    var ouverture = $("hero") || document.querySelector(".cat-head");
    /* Le repère est le bord haut de CE QUI SUIT le visuel : `#contenido` sur
       la home, `.cat-list` sur un rayon. Ni l'un ni l'autre n'est collant,
       la mesure est donc stable — le hero, lui, est épinglé et son propre
       bord bas ne dit plus où il finit. */
    var flux = ouverture && ouverture.nextElementSibling;
    if (!ouverture || !flux){ document.body.className += " past-hero"; return; }

    /* Le repère est le bord haut de `main`, qui commence exactement là où
       le hero finit. Pas un IntersectionObserver : depuis le défilement
       « feuille » le hero est épinglé et ne quitte plus le cadre, et le
       reporter sur `main` demanderait un cadre d'observation réduit à un
       trait — un cadre d'aire nulle ne notifie pas de façon fiable, et un
       témoin assez petit pour être précis se fait enjamber par un élan.
       Une comparaison de position est exacte à tout moment. */
    var seuil = 0;
    function mesure(){
      seuil = flux.getBoundingClientRect().top
            + (window.pageYOffset || document.documentElement.scrollTop);
    }
    var etat = null;
    function sync(){
      var past = (window.pageYOffset || document.documentElement.scrollTop) >= seuil;
      if (past === etat) return;
      etat = past;
      document.body.className = past
        ? (document.body.className.replace(/\s*past-hero/g, "") + " past-hero")
        : document.body.className.replace(/\s*past-hero/g, "");
    }
    mesure(); sync();

    /* Aucune boucle nouvelle : Lenis en tient déjà une et publie sa
       position à chaque image. Sans Lenis — mouvement réduit — on écoute le
       défilement natif, en passif. `sync` ne lit rien de la mise en page :
       c'est une comparaison de nombres, le seuil étant mesuré à part. */
    if (lenis && lenis.on) lenis.on("scroll", sync);
    else window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", function(){ mesure(); sync(); }, { passive: true });
  });

  /* =====================================================================
     Hauteur du dock

     Elle change avec la police une fois chargée, avec la longueur de la
     chaîne de prix et à chaque point de rupture : la mesurer est la seule
     façon de garantir que le footer passe bien au-dessus.
     ===================================================================== */
  module("dock-height", function(){
    var shell = $("dock-shell");
    var pill = document.querySelector(".nav-pill");
    if (!shell && !pill) return;
    var t = null;
    function sync(){
      if (shell) document.documentElement.style.setProperty("--dock-h", shell.offsetHeight + "px");
      /* La pilule passe de un à deux rangs selon la largeur : sa hauteur
         est la seule façon fiable de savoir où commencer la page. */
      if (pill) document.documentElement.style.setProperty("--nav-h", pill.offsetHeight + "px");
    }
    sync();
    window.addEventListener("resize", function(){
      clearTimeout(t); t = setTimeout(sync, 120);
    }, false);
    window.addEventListener("orientationchange", sync, false);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then){
      document.fonts.ready.then(sync);
    }
  });

  /* =====================================================================
     Page produit — sélection couleur / taille
     ===================================================================== */
  var swapTimer = null;
  var pendingSrc = null;

  function imageFor(color){
    if (!PRODUCT) return null;
    if (!PRODUCT.colors) return PRODUCT.image;
    for (var i = 0; i < PRODUCT.colors.length; i++){
      if (PRODUCT.colors[i].name === color) return PRODUCT.colors[i].image;
    }
    return PRODUCT.image;
  }

  function variantLabel(){
    var bits = [];
    if (state.color) bits.push(state.color);
    if (state.size) bits.push((PRODUCT && PRODUCT.sizeLabel ? PRODUCT.sizeLabel : "Talla") + " " + state.size);
    bits.push("Envío gratis");
    return bits.join(" · ");
  }

  function syncSelection(){
    each(document.querySelectorAll(".rail-item"), function(b){
      var on = b.getAttribute("data-color") === state.color;
      b.className = on
        ? (b.className.replace(/\s*active/g, "") + " active")
        : b.className.replace(/\s*active/g, "");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    each(document.querySelectorAll(".size-btn"), function(b){
      var on = b.getAttribute("data-size") === state.size;
      b.className = on
        ? (b.className.replace(/\s*active/g, "") + " active")
        : b.className.replace(/\s*active/g, "");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });

    /* La valeur choisie s'écrit à côté de son intitulé : une pastille
       entourée ne dit pas son nom. */
    each(document.querySelectorAll("[data-opt]"), function(el){
      var v = el.getAttribute("data-opt") === "color" ? state.color : state.size;
      if (v) el.textContent = v;
    });

    /* La galerie suit l'option qui la pilote : la couleur quand il y en a,
       sinon le format s'il porte ses visuels. Rien à précharger ni à faire
       fondre — les cadres sont déjà dans la piste, on ne fait que la faire
       glisser. */
    if (state.color) showFrame("data-color", state.color);
    else if (state.size) showFrame("data-size", state.size);

    var label = $("dock-variant");
    if (label) label.textContent = variantLabel();

    syncPrice();
  }

  /* Un format peut coûter plus cher que la fiche (les 14 sticks de Sleep,
     par exemple) : le prix affiché, le prix barré, le dock et l'intitulé du
     bouton suivent la sélection. Sans ça le client lirait 499 et paierait
     1 599. */
  function syncPrice(){
    if (!PRODUCT || !CATALOG.priceOf) return;
    var pr = CATALOG.priceOf(PRODUCT, state.color, state.size);
    var money = CATALOG.money;

    var main = $("pdp-price");
    if (main) main.textContent = money(pr.price);

    var cmp = $("pdp-compare");
    if (cmp){
      if (pr.compareAt){ cmp.textContent = money(pr.compareAt); cmp.removeAttribute("hidden"); }
      else cmp.setAttribute("hidden", "");
    }

    var dock = $("dock-price");
    if (dock) dock.textContent = money(pr.price) + " MXN";

    var btn = $("checkout-btn");
    if (btn && btn.getAttribute("data-label")){
      btn.textContent = btn.getAttribute("data-label") + " — " + money(pr.price) + " MXN";
    }
  }

  /* =====================================================================
     Galerie produit — une piste horizontale qui se fait glisser, des
     vignettes qui la commandent, et le sélecteur de couleur qui l'amène
     sur le bon cadre. Aucune image n'est échangée : elles coexistent,
     c'est le défilement qui choisit. Le geste natif garde donc son
     inertie et rien ne clignote au changement.
     ===================================================================== */
  var galStage, galFrames, galThumbs, galDots;

  function galIndex(){
    if (!galStage || !galStage.clientWidth) return 0;
    return Math.round(galStage.scrollLeft / galStage.clientWidth);
  }

  /* Le bandeau suit la piste. Sans ça, arriver à la douzième image par le
     geste latéral laissait la vignette active hors du cadre : le bandeau
     montrait toujours les six premières, et rien ne disait où l'on en
     était. La vignette est centrée quand la place le permet. */
  var galFollowed = -1;
  function galFollow(i){
    var t = galThumbs && galThumbs[i];
    if (!t) return;
    var strip = t.parentNode;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    var left = t.offsetLeft - (strip.clientWidth - t.offsetWidth) / 2;
    left = Math.max(0, Math.min(strip.scrollWidth - strip.clientWidth, left));
    if (Math.abs(strip.scrollLeft - left) < 2) return;
    try { strip.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" }); }
    catch(e){ strip.scrollLeft = left; }
  }

  function galMark(i){
    each(galFrames, function(f, k){ flag(f, "on", k === i); });
    each(galThumbs, function(t, k){
      flag(t, "on", k === i);
      t.setAttribute("aria-selected", k === i ? "true" : "false");
    });
    each(galDots ? galDots.children : [], function(d, k){
      d.className = k === i ? "on" : "";
    });
    /* Seulement quand l'index CHANGE : appelé à chaque frame du défilement
       de la piste, le recentrage se battrait avec le geste en cours. */
    if (i !== galFollowed){ galFollowed = i; galFollow(i); }
  }

  /* Le bandeau de vignettes ne se faisait pas glisser. Il défile pourtant
     — `overflow-x:auto` — mais il ne fait que 48px de haut sur téléphone :
     le navigateur doit décider dès les premiers pixels si le geste revient
     à la piste ou au défilement vertical de la page, et sur une bande aussi
     mince il tranche presque toujours pour la page. La souris, elle, n'a
     jamais su faire glisser une piste.
     On lui retire donc l'arbitrage : la classe pose `touch-action:pan-y`,
     qui lui laisse le vertical — la page continue de défiler depuis le
     bandeau — et nous rend l'horizontal, piloté ici. La classe est posée
     par le script et non dans le HTML : sans `PointerEvent` pour prendre le
     relais, la piste doit garder son défilement natif. */
  function dragScroll(track){
    if (!track || !window.PointerEvent) return;
    if (track.className.indexOf("draggable") < 0) track.className += " draggable";
    var id = -1, startX = 0, startLeft = 0, dragged = false;

    track.addEventListener("pointerdown", function(e){
      if (e.button) return;
      id = e.pointerId; startX = e.clientX; startLeft = track.scrollLeft; dragged = false;
    }, false);

    track.addEventListener("pointermove", function(e){
      if (e.pointerId !== id) return;
      var dx = e.clientX - startX;
      /* Seuil : sous 4px c'est un appui, pas un glissement. Sans lui, le
         moindre tremblement du doigt annulerait le choix de la vignette. */
      if (!dragged){
        if (Math.abs(dx) < 4) return;
        dragged = true;
        try { track.setPointerCapture(id); } catch(err){}
      }
      track.scrollLeft = startLeft - dx;
    }, false);

    function end(e){
      if (e.pointerId !== id) return;
      try { track.releasePointerCapture(id); } catch(err){}
      id = -1;
      /* Le clic ne part qu'APRÈS le relâchement : `dragged` doit rester vrai
         le temps qu'il passe devant le garde ci-dessous. */
      if (dragged) setTimeout(function(){ dragged = false; }, 0);
    }
    track.addEventListener("pointerup", end, false);
    track.addEventListener("pointercancel", end, false);

    /* Un glissement ne vaut pas choix de vignette : on l'arrête en capture,
       avant que le bouton ne voie le clic. */
    track.addEventListener("click", function(e){
      if (!dragged) return;
      e.preventDefault(); e.stopPropagation();
    }, true);
  }

  function galGo(i){
    if (!galStage) return;
    var x = i * galStage.clientWidth;
    try { galStage.scrollTo({ left: x, behavior: reduceMotion ? "auto" : "smooth" }); }
    catch(e){ galStage.scrollLeft = x; }
    galMark(i);
  }

  /* Ramène la galerie sous les yeux après un changement de variante.
     Réservé aux formats où le sélecteur passe SOUS le visuel : au-dessus
     de 980px les deux colonnes sont côte à côte, la galerie est déjà
     visible et faire défiler la page serait gratuit. */
  function revealGallery(){
    if (!galStage) return;
    if (!window.matchMedia || !matchMedia("(max-width: 979px)").matches) return;
    var box = galStage.getBoundingClientRect();
    var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 64;
    var top = navH + 22;
    if (box.top >= top && box.bottom <= window.innerHeight) return;
    scrollToY((window.pageYOffset || document.documentElement.scrollTop) + box.top - top, false);
  }

  function showFrame(attr, value){
    if (!galFrames) return;
    for (var i = 0; i < galFrames.length; i++){
      if (galFrames[i].getAttribute(attr) === value){ galGo(i); return; }
    }
  }

  module("gallery", function(){
    galStage = $("gal-stage");
    if (!galStage) return;
    galFrames = galStage.querySelectorAll(".gal-frame");
    galThumbs = document.querySelectorAll(".gal-thumb");
    galDots = $("gal-dots");

    if (galDots && galFrames.length > 1){
      for (var i = 0; i < galFrames.length; i++) galDots.appendChild(document.createElement("i"));
    }

    each(galThumbs, function(t){
      t.addEventListener("click", function(){
        var i = Number(t.getAttribute("data-i")) || 0;
        /* Une vignette vaut choix d'option : sans ça la galerie et le prix
           parleraient de deux produits différents. */
        var c = t.getAttribute("data-color");
        var z = t.getAttribute("data-size");
        if (c && c !== state.color){ state.color = c; syncSelection(); }
        else if (z && z !== state.size){ state.size = z; syncSelection(); }
        galGo(i);
      }, false);
    });

    dragScroll(document.querySelector(".gal-thumbs"));

    var ticking = false;
    galStage.addEventListener("scroll", function(){
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function(){ ticking = false; galMark(galIndex()); });
    }, false);

    galMark(0);
  });

  /* =====================================================================
     Compléments — la piste est remplie par le module `catalog` depuis
     data-handles ; il ne reste qu'à retirer la section si la fiche n'a
     pas de compléments déclarés, plutôt que d'afficher un titre seul.
     ===================================================================== */
  /* =====================================================================
     Bundle — le produit consulté, non décochable, plus les compléments
     déclarés dans `pairs`. Les prix sont ceux du catalogue, c'est-à-dire
     ceux de la boutique ; la remise n'est qu'affichée ici, c'est Shopify
     qui l'applique au checkout via son code.
     ===================================================================== */
  /* Un article de bundle montre par défaut son packshot ; s'il a des
     couleurs, c'est la photo de la couleur choisie qui s'affiche, et les
     pastilles la changent. */
  function bundleShot(p, color){
    if (p.colors){
      for (var i = 0; i < p.colors.length; i++){
        if (p.colors[i].name === color) return p.colors[i].image;
      }
      return p.colors[0].image;
    }
    return p.packshot || p.image;
  }

  function bundleMedia(p, color){
    return '<span class="bundle-media"><img loading="lazy" src="' + esc(bundleShot(p, color)) +
           '" alt="" width="300" height="300"></span>';
  }

  function bundleSwatches(p, color, i){
    if (!p.colors) return "";
    var html = '<span class="bundle-colors" role="radiogroup" aria-label="Color de ' + esc(p.short) + '">';
    each(p.colors, function(c){
      var on = c.name === color;
      html += '<button class="bundle-swatch' + (on ? " on" : "") + '" type="button" role="radio" ' +
              'aria-checked="' + (on ? "true" : "false") + '" tabindex="' + (on ? "0" : "-1") + '" ' +
              'data-bi="' + i + '" data-color="' + esc(c.name) + '" ' +
              'style="background:' + esc(c.dot) + '" aria-label="' + esc(c.name) + '"></button>';
    });
    html += "</span><span class=\"bundle-color-name\">" + esc(color || "") + "</span>";
    return html;
  }

  module("bundle", function(){
    var sec = $("bundle"), row = $("bundle-row");
    if (!sec || !row || !PRODUCT) return;

    var extras = (sec.getAttribute("data-handles") || "").split(",")
      .map(function(h){ return CATALOG.byHandle(h.replace(/^\s+|\s+$/g, "")); })
      .filter(Boolean);
    if (!extras.length){ sec.parentNode.removeChild(sec); return; }

    var items = [PRODUCT].concat(extras);
    var picked = items.map(function(){ return true; });
    /* Chaque article garde SA couleur : celle de la fiche pour le produit
       consulté, la première du catalogue pour les autres. */
    var colors = items.map(function(p, i){
      if (!p.colors) return null;
      return i === 0 && state.color ? state.color : p.colors[0].name;
    });

    function itemHtml(p, i){
      return (i ? '<span class="bundle-plus" aria-hidden="true">+</span>' : "") +
        '<div class="bundle-item on" data-i="' + i + '">' +
          bundleMedia(p, colors[i]) +
          (i === 0 ? '<span class="bundle-this">Este producto</span>' : "") +
          '<a class="bundle-name" href="' + esc(CATALOG.url(p.handle)) + '">' + esc(p.short) + '</a>' +
          '<span class="bundle-price price-num">' + CATALOG.money(p.price) + '</span>' +
          bundleSwatches(p, colors[i], i) +
          (i === 0
            ? '<span class="bundle-fixed" aria-hidden="true">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' +
              '</span>'
            : '<input class="bundle-pick" type="checkbox" checked data-i="' + i + '" aria-label="Incluir ' + esc(p.short) + ' en el bundle">') +
        '</div>';
    }

    function draw(){
      var html = "";
      each(items, function(p, i){ html += itemHtml(p, i); });
      row.innerHTML = html;
      bindRow();
      paint();
    }

    function totals(){
      var full = 0;
      each(items, function(p, i){ if (picked[i]) full += p.price; });
      var off = picked.filter(Boolean).length > 1 ? Math.round(full * (window.LOWCART ? LOWCART.BUNDLE_OFF : 0.1)) : 0;
      return { full: full, off: off, net: full - off };
    }

    function paint(){
      var t = totals();
      each(row.querySelectorAll(".bundle-item"), function(el){
        var i = Number(el.getAttribute("data-i"));
        el.className = "bundle-item " + (picked[i] ? "on" : "off");
      });
      $("bundle-regular").textContent = CATALOG.money(t.full);
      $("bundle-save").textContent = t.off ? "−" + CATALOG.money(t.off) : "—";
      $("bundle-total").textContent = CATALOG.money(t.net);
    }

    function bindRow(){
      each(row.querySelectorAll(".bundle-pick"), function(box){
        box.addEventListener("change", function(){
          picked[Number(box.getAttribute("data-i"))] = box.checked;
          paint();
        }, false);
      });
      /* Une pastille change la photo de son article. Pour le produit
         consulté, elle vaut choix de couleur tout court : la galerie du
         haut, le prix et le dock suivent, sinon le bundle et la fiche
         parleraient de deux montres différentes. */
      each(row.querySelectorAll(".bundle-swatch"), function(sw){
        sw.addEventListener("click", function(){
          var i = Number(sw.getAttribute("data-bi"));
          var c = sw.getAttribute("data-color");
          if (colors[i] === c) return;
          colors[i] = c;
          if (i === 0 && items[0].colors){ state.color = c; syncSelection(); }
          draw();
        }, false);
      });
    }

    /* Chaque article part avec SA variante : la couleur et la taille
       choisies plus haut pour le produit consulté, la variante unique
       pour les compléments. */
    function lineFor(p, i){
      if (!p.shopify) return null;
      var color = colors[i];
      var size = i === 0 ? state.size : null;
      /* Pas de taille choisie pour un article recommandé : on prend la
         première du catalogue plutôt que d'abandonner la variante. */
      if (!size && p.sizes) size = p.sizes[0].name;
      var variant = CATALOG.variantOf ? CATALOG.variantOf(p, color, size) : (p.shopify.variant || null);
      if (!variant) return null;
      return { variant: variant, handle: p.handle, color: color || null,
               size: size || null, qty: 1 };
    }

    draw();

    $("bundle-add").addEventListener("click", function(){
      if (!window.LOWCART) return;
      var picks = [];
      each(items, function(p, i){
        if (!picked[i]) return;
        var line = lineFor(p, i);
        if (line) picks.push(line);
      });
      if (picks.length) LOWCART.add(picks, picks.length > 1);
    }, false);
  });

  module("selection", function(){
    if (!PRODUCT) return;
    pendingSrc = imageFor(state.color);

    each(document.querySelectorAll(".rail-item"), function(b){
      b.addEventListener("click", function(){
        var next = b.getAttribute("data-color");
        var changed = next !== state.color;
        state.color = next;
        syncSelection();
        /* Le sélecteur est sous le visuel sur mobile : sans ce retour,
           on choisit une couleur sans jamais voir le produit changer.
           Uniquement quand la couleur change vraiment, et uniquement si
           la galerie n'est pas déjà en vue — sinon la page sauterait à
           chaque appui. */
        if (changed) revealGallery();
      }, false);
    });
    each(document.querySelectorAll(".size-btn"), function(b){
      b.addEventListener("click", function(){
        var next = b.getAttribute("data-size");
        var changed = next !== state.size;
        state.size = next;
        syncSelection();
        /* Même raison que pour les coloris : sur mobile le sélecteur est
           sous le visuel, et un format qui change de photo doit se voir. */
        if (changed && !PRODUCT.colors) revealGallery();
      }, false);
    });

    /* Groupes radio : navigation aux flèches, tabindex glissant */
    each(document.querySelectorAll('[role="radiogroup"]'), function(group){
      var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
      group.addEventListener("keydown", function(e){
        var i = radios.indexOf(document.activeElement);
        if (i < 0) return;
        var d = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1
              : (e.key === "ArrowLeft"  || e.key === "ArrowUp")   ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = radios[(i + d + radios.length) % radios.length];
        next.click(); next.focus();
      }, false);
    });

    syncSelection();

    /* Préchargement à l'inactivité : le changement de couleur se fait sans flash */
    if (PRODUCT.colors){
      (window.requestIdleCallback || function(f){ setTimeout(f, 800); })(function(){
        each(PRODUCT.colors, function(c){ (new Image()).src = c.image; });
      });
    }
  });

  /* =====================================================================
     Checkout — la sélection courante part vers Shopify.
     Produit sans configuration Shopify : le bouton reste informatif et
     dirige vers le contact, jamais vers une URL de boutique inexistante.
     ===================================================================== */
  function goToCheckout(btn, restoreLabel){
    if (btn.disabled || !PRODUCT) return;
    var shop = PRODUCT.shopify;
    if (!shop || !shop.handle){
      window.location.href = "mailto:lowlabsmx@gmail.com?subject=" +
        encodeURIComponent("Pedido: " + PRODUCT.name);
      return;
    }

    /* La variante choisie rejoint le panier, qui ouvre son tiroir. C'est
       lui qui reconstruira le panier Shopify au moment de payer : d'ici
       là, rien ne quitte le site. */
    if (window.LOWCART){
      var variant = CATALOG.variantOf ? CATALOG.variantOf(PRODUCT, state.color, state.size)
                                      : (shop.variant || null);
      if (variant){
        LOWCART.add([{ variant: variant, handle: PRODUCT.handle,
                       color: state.color, size: state.size, qty: 1 }]);
        return;
      }
    }
    /* La référence est résolue AVANT de désactiver le bouton : une
       combinaison inconnue ne doit pas laisser un bouton mort. */
    var id = CATALOG.variantOf ? CATALOG.variantOf(PRODUCT, state.color, state.size) : null;
    if (!id){
      window.location.href = STORE + "/products/" + shop.handle + "?locale=es&country=MX";
      return;
    }
    btn.disabled = true;
    btn.setAttribute("aria-disabled", "true");
    var previous = btn.textContent;
    btn.textContent = "Abriendo tu selección…";
    window.location.href = STORE + "/products/" + shop.handle + "?variant=" + id + CHECKOUT_PARAMS;
    /* Si l'utilisateur revient en arrière, le bouton doit être réutilisable. */
    setTimeout(function(){
      btn.disabled = false;
      btn.removeAttribute("aria-disabled");
      btn.textContent = restoreLabel || previous;
    }, 6000);
  }

  module("checkout", function(){
    var checkoutBtn = $("checkout-btn");
    if (checkoutBtn){
      var mainLabel = checkoutBtn.textContent;
      checkoutBtn.addEventListener("click", function(){ goToCheckout(checkoutBtn, mainLabel); }, false);
    }
    var dockBtn = $("dock-btn");
    if (dockBtn){
      var dockLabel = dockBtn.textContent;
      dockBtn.addEventListener("click", function(){ goToCheckout(dockBtn, dockLabel); }, false);
    }
  });

  /* =====================================================================
     Texte replié sur mobile

     Le repli est purement décoratif : le paragraphe complet reste dans le
     DOM, seul l'affichage est tronqué. Sans JS il s'affiche entier — on
     n'ajoute jamais une troncature qu'on ne saurait pas dérouler.
     ===================================================================== */
  module("read-more", function(){
    var mq = window.matchMedia ? window.matchMedia("(max-width: 719px)") : null;
    if (!mq) return;

    var targets = document.querySelectorAll(
      ".chapter-copy > p, .section-head p, .band-inner > p, .pdp-lede, .reco-head > p"
    );
    if (!targets.length) return;

    var items = [];
    each(targets, function(p){
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "more-btn";
      btn.textContent = "Ver más";
      btn.setAttribute("aria-expanded", "false");
      p.parentNode.insertBefore(btn, p.nextSibling);

      btn.addEventListener("click", function(){
        var open = p.className.indexOf("open") > -1;
        p.className = open
          ? p.className.replace(/\s*open/g, "")
          : (p.className + " open");
        btn.textContent = open ? "Ver más" : "Ver menos";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
      }, false);

      items.push({ p: p, btn: btn });
    });

    function sync(){
      each(items, function(it){
        if (!mq.matches){
          it.p.className = it.p.className.replace(/\s*clamped/g, "").replace(/\s*open/g, "");
          it.btn.className = "more-btn";
          return;
        }
        /* On ne replie que ce qui déborde vraiment : sur un texte court le
           bouton n'aurait rien à dérouler. La mesure se fait déplié. */
        it.p.className = it.p.className.replace(/\s*clamped/g, "");
        var overflows = it.p.scrollHeight > it.p.clientHeight + 4 ||
          it.p.getBoundingClientRect().height > parseFloat(getComputedStyle(it.p).lineHeight) * 3.4;
        if (!overflows){ it.btn.className = "more-btn"; return; }
        if (it.p.className.indexOf("open") === -1) it.p.className += " clamped";
        else it.p.className += " clamped";
        it.btn.className = "more-btn on";
      });
    }

    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    else if (mq.addListener) mq.addListener(sync);
    if (document.fonts && document.fonts.ready && document.fonts.ready.then){
      document.fonts.ready.then(sync);
    }
  });

  /* =====================================================================
     Carrousel
     ===================================================================== */
  /* Remonte jusqu'à la section porteuse : chaque paire de flèches ne pilote
     que la piste de son propre rayon. */
  function ownerSection(el){
    while (el && el.tagName !== "SECTION") el = el.parentNode;
    return el;
  }

  module("carousel", function(){
    each(document.querySelectorAll(".card-arrows"), function(arrows){
      var cards = (ownerSection(arrows) || document).querySelector(".cards");
      if (!cards) return;
      each(arrows.querySelectorAll("button"), function(b){
        b.addEventListener("click", function(){
          /* Le pas est l'écart réel entre deux éléments : le mesurer évite de
             dupliquer la gouttière du CSS, et un pas faux ferait recaler
             l'ancrage sur la carte d'à côté à chaque appui. */
          var a = cards.children[0], c = cards.children[1];
          var step = a && c ? (c.offsetLeft - a.offsetLeft)
                   : a ? a.offsetWidth + 14 : 300;
          var dx = step * Number(b.getAttribute("data-dir"));
          /* La forme à objet de scrollBy n'existe pas sur les Safari anciens :
             on retombe sur une affectation directe de scrollLeft. */
          try { cards.scrollBy({ left: dx, behavior: reduceMotion ? "auto" : "smooth" }); }
          catch(e){ cards.scrollLeft += dx; }
        }, false);
      });

      /* Même règle que les pastilles : une piste qui tient déjà à l'écran
         n'a rien à faire défiler. Les flèches y seraient deux boutons
         morts, et surtout une rangée de vide entre le titre et les
         cartes — exactement ce que le resserrement doit supprimer. */
      function sync(){
        /* 2px de marge : les largeurs sous-pixel d'une piste centrée
           suffisent à faire déborder scrollWidth d'une fraction. */
        var scrolls = cards.scrollWidth - cards.clientWidth > 2;
        arrows.hidden = !scrolls;
        /* L'aparté qui ne portait que ces flèches deviendrait une ligne
           de grille vide sous le titre. Celui de la boutique garde son
           compte de produits : on ne le replie que s'il est seul. */
        var aside = arrows.parentNode;
        if (aside && aside.className === "head-aside" && aside.children.length === 1){
          aside.hidden = !scrolls;
        }
      }
      window.addEventListener("resize", sync, false);
      /* Les images des cartes arrivent après le premier calcul : la piste
         peut encore changer de largeur. */
      window.addEventListener("load", sync, false);
      sync();
    });
  });

  /* =====================================================================
     Pastilles sous les carrousels — un repère que la piste se fait
     glisser. Purement décoratives : le geste et les flèches restent les
     seules commandes, elles ne prennent donc jamais le focus. Le nombre
     de pastilles suit le nombre d'écrans réellement disponibles, et
     tombe à zéro quand tout tient déjà à l'écran.
     ===================================================================== */
  module("carousel-dots", function(){
    each(document.querySelectorAll(".card-dots"), function(host){
      /* Les objectifs défilent aussi, mais dans .goals — une piste qui
         n'est un carrousel que sous 760px. Rien à conditionner ici : la
         piste ne déborde pas au-dessus, donc aucune pastille n'est
         produite. */
      var cards = (ownerSection(host) || document).querySelector(".cards, .goals");
      if (!cards) return;
      var dots = [];

      /* Le compte se déduit du pas réel entre deux cartes, pas du rapport
         scrollWidth/clientWidth : ce dernier compte les gouttières et
         réclame une page de plus dès qu'une carte occupe toute la piste. */
      function pageCount(){
        var a = cards.children[0], b = cards.children[1];
        if (!a || !cards.clientWidth) return 1;
        var step = b ? (b.offsetLeft - a.offsetLeft) : a.offsetWidth;
        if (!step) return 1;
        /* La piste porte son encoche en padding : c'est la boîte de
           contenu, pas clientWidth, qui dit combien de cartes tiennent. */
        var cs = window.getComputedStyle(cards);
        var inner = cards.clientWidth
          - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
        var perPage = Math.max(1, Math.round(inner / step));
        return Math.max(1, Math.ceil(cards.children.length / perPage));
      }

      function mark(){
        if (!dots.length) return;
        var max = cards.scrollWidth - cards.clientWidth;
        var i = max <= 0 ? 0 : Math.round(cards.scrollLeft / max * (dots.length - 1));
        each(dots, function(d, k){ d.className = k === i ? "on" : ""; });
      }

      function build(){
        var n = pageCount();
        if (n === dots.length || (n < 2 && !dots.length)) return;
        host.innerHTML = "";
        dots = [];
        if (n < 2) return;
        for (var i = 0; i < n; i++){
          dots.push(host.appendChild(document.createElement("i")));
        }
        mark();
      }

      var ticking = false;
      cards.addEventListener("scroll", function(){
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function(){ ticking = false; mark(); });
      }, false);

      window.addEventListener("resize", build, false);
      build();
      /* Les cartes sont injectées juste avant ce module, mais leurs
         images ne le sont pas : la largeur de piste bouge encore après
         le premier calcul. */
      window.addEventListener("load", build, false);
    });
  });

})();
