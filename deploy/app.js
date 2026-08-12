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

  /* Chaque module est isolé : une panne dans l'un ne doit jamais empêcher
     les autres de s'initialiser — et surtout jamais laisser la page
     invisible, puisque .rv part d'une opacité nulle. */
  function module(name, fn){
    try { fn(); }
    catch(err){
      if (window.console && console.error) console.error("[lowlabs] " + name, err);
    }
  }

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
    each(document.querySelectorAll(".fcards[data-handles]"), function(track){
      track.innerHTML = pickHandles(track.getAttribute("data-handles")).map(flyCard).join("");
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
      y = Math.max(0, Math.round(y));
      try { window.scrollTo({ top: y, behavior: "instant" }); }
      catch(e){ window.scrollTo(0, y); }
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
  module("goals", function(){
    var host = $("goals"), out = $("reco");
    if (!host || !out || !CATALOG.goals) return;

    /* Le visuel occupe toute la carte ; la nacelle de verre se pose dessus,
       titre et affordance à l'intérieur. Le pseudo-bouton « Ver selección »
       est un span : la carte est déjà un bouton radio, un bouton imbriqué
       serait invalide. */
    host.innerHTML = CATALOG.goals.map(function(g, i){
      return '<button class="goal" type="button" role="radio" aria-checked="false" ' +
          'tabindex="' + (i === 0 ? "0" : "-1") + '" data-goal="' + esc(g.id) + '">' +
          (g.image
            ? '<span class="goal-media"><img loading="lazy" src="' + esc(g.image) + '" alt="" width="600" height="900"></span>'
            : "") +
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

    function render(g){
      var p = CATALOG.byHandle(g.pick);
      if (!p) return;
      var also = (g.also || []).map(CATALOG.byHandle).filter(Boolean);

      out.innerHTML =
        '<div class="reco-head">' +
          '<span class="eyebrow">Tu recomendación</span>' +
          '<h3>' + esc(g.label) + '</h3>' +
          '<p>' + esc(g.why) + '</p>' +
        '</div>' +
        '<div class="reco-grid">' +
          '<div class="reco-media"><img src="' + esc(p.image) + '" alt="" width="600" height="600"></div>' +
          '<div class="reco-body">' +
            '<span class="prod-cat">Empieza por aquí · ' + esc(p.category) + '</span>' +
            '<h4>' + esc(p.name) + '</h4>' +
            '<p>' + esc(p.tagline) + '</p>' +
            '<div class="reco-price price-num">' +
              '<b>' + CATALOG.money(p.price) + '</b>' +
              (p.compareAt ? '<s>' + CATALOG.money(p.compareAt) + '</s>' : "") +
              '<small>MXN · Envío gratis</small>' +
            '</div>' +
            '<div class="reco-cta">' +
              '<a class="btn btn-ink" href="' + CATALOG.url(p.handle) + '">Ver ' + esc(p.short) + '</a>' +
              '<a class="btn btn-quiet" href="/tienda">Ver toda la tienda</a>' +
            '</div>' +
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

      out.hidden = false;
    }

    function select(btn, moveFocus){
      var g = CATALOG.byGoal(btn.getAttribute("data-goal"));
      if (!g) return;
      each(buttons, function(b){
        var on = b === btn;
        b.className = on
          ? (b.className.replace(/\s*active/g, "") + " active")
          : b.className.replace(/\s*active/g, "");
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
      });
      render(g);
      /* Le focus ne part sur la recommandation qu'au clic : au clavier il
         doit rester dans le groupe pour continuer à parcourir les choix. */
      if (moveFocus) out.focus();
    }

    each(buttons, function(b){
      b.addEventListener("click", function(){ select(b, true); }, false);
    });

    host.addEventListener("keydown", function(e){
      var i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      var d = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1
            : (e.key === "ArrowLeft"  || e.key === "ArrowUp")   ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = buttons[(i + d + buttons.length) % buttons.length];
      select(next, false);
      next.focus();
    }, false);
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
    var hero = $("hero");
    if (!hero){ document.body.className += " past-hero"; return; }
    if (!hasIO){ document.body.className += " past-hero"; return; }
    new IntersectionObserver(function(entries){
      var past = !entries[entries.length - 1].isIntersecting;
      document.body.className = past
        ? (document.body.className.replace(/\s*past-hero/g, "") + " past-hero")
        : document.body.className.replace(/\s*past-hero/g, "");
    }, { threshold: 0 }).observe(hero);
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
    if (state.size) bits.push("Talla " + state.size);
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

    /* La galerie suit la couleur : le cadre qui la porte devient l'actif.
       Rien à précharger ni à faire fondre — les cadres sont déjà dans la
       piste, on ne fait que la faire glisser. */
    if (state.color) showFrameByColor(state.color);

    var label = $("dock-variant");
    if (label) label.textContent = variantLabel();
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

  function galMark(i){
    each(galFrames, function(f, k){
      f.className = k === i ? "gal-frame on" : "gal-frame";
    });
    each(galThumbs, function(t, k){
      t.className = k === i ? "gal-thumb on" : "gal-thumb";
      t.setAttribute("aria-selected", k === i ? "true" : "false");
    });
    each(galDots ? galDots.children : [], function(d, k){
      d.className = k === i ? "on" : "";
    });
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
    var y = (window.pageYOffset || document.documentElement.scrollTop) + box.top - top;
    try { window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" }); }
    catch(e){ window.scrollTo(0, y); }
  }

  function showFrameByColor(color){
    if (!galFrames) return;
    for (var i = 0; i < galFrames.length; i++){
      if (galFrames[i].getAttribute("data-color") === color){ galGo(i); return; }
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
        /* Une vignette de couleur vaut choix de couleur : sans ça la
           galerie et le prix parleraient de deux produits différents. */
        var c = t.getAttribute("data-color");
        if (c && c !== state.color){ state.color = c; syncSelection(); }
        galGo(i);
      }, false);
    });

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
      var shop = p.shopify;
      if (!shop) return null;
      var color = colors[i];
      var size = i === 0 ? state.size : null;
      var variant = shop.variant || null;
      if (shop.variants && color){
        var byColor = shop.variants[color];
        /* Pas de taille choisie pour un article recommandé : on prend la
           première du catalogue plutôt que d'abandonner la variante. */
        if (byColor){
          if (!size && p.sizes) size = p.sizes[0].name;
          variant = (size && byColor[size]) || variant;
        }
      }
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
      b.addEventListener("click", function(){ state.size = b.getAttribute("data-size"); syncSelection(); }, false);
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
      var variant = shop.variant || null;
      if (shop.variants && state.color && state.size){
        var byColor = shop.variants[state.color];
        variant = (byColor && byColor[state.size]) || variant;
      }
      if (variant){
        LOWCART.add([{ variant: variant, handle: PRODUCT.handle,
                       color: state.color, size: state.size, qty: 1 }]);
        return;
      }
    }
    /* La référence est résolue AVANT de désactiver le bouton : une
       combinaison inconnue ne doit pas laisser un bouton mort. */
    var byColor = shop.variants && state.color ? shop.variants[state.color] : null;
    var id = byColor && state.size ? byColor[state.size] : null;
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
