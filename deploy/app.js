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
  function productCard(p){
    var url = CATALOG.url(p.handle);
    return '<article class="prod">' +
        '<a class="prod-media" href="' + url + '" tabindex="-1" aria-hidden="true">' +
          '<img loading="lazy" src="' + esc(p.image) + '" alt="" width="600" height="600">' +
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

  /* =====================================================================
     Catalogue — rendu des cartes produit

     Rendu AVANT le module de révélation : les cartes injectées doivent
     être observables, sinon elles resteraient à opacité nulle.
     ===================================================================== */
  module("catalog", function(){
    var grid = $("cat-grid");
    if (!grid) return;
    var only = grid.getAttribute("data-exclude");
    var html = "";
    each(CATALOG.products, function(p){
      if (only && p.handle === only) return;
      html += productCard(p);
    });
    grid.innerHTML = html;
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
              '</div>' +
            '</div>' +
            '<div class="cat-grid rv">' + items.map(productCard).join("") + '</div>' +
          '</div>' +
        '</section>';
    });
    host.innerHTML = html;
  });

  /* =====================================================================
     Assistant — l'utilisateur part d'un objectif, pas d'un produit

     Aucun état n'est persisté et rien n'est envoyé : la recommandation
     est une simple correspondance objectif → handle, résolue dans
     catalog.js. Le bloc reste absent du DOM tant que rien n'est choisi.
     ===================================================================== */
  var GOAL_ICONS = {
    moon:     '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    bolt:     '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z"/>',
    spark:    '<path d="M12 2v5M12 17v5M2 12h5M17 12h5M5.6 5.6l3.5 3.5M14.9 14.9l3.5 3.5M18.4 5.6l-3.5 3.5M9.1 14.9l-3.5 3.5"/>',
    leaf:     '<path d="M4 20c0-8 6-14 16-14 0 10-6 15-13 15H4v-1zM8 17c2-4 5-7 9-9"/>',
    heart:    '<path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.5 2.8c0 5.8-8.5 11.3-8.5 11.3z"/>',
    infinity: '<path d="M7.5 15.5a3.5 3.5 0 1 1 0-7c3 0 6 7 9 7a3.5 3.5 0 1 0 0-7c-3 0-6 7-9 7z"/>'
  };

  function icon(name){
    return '<svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (GOAL_ICONS[name] || GOAL_ICONS.spark) + '</svg>';
  }

  module("goals", function(){
    var host = $("goals"), out = $("reco");
    if (!host || !out || !CATALOG.goals) return;

    host.innerHTML = CATALOG.goals.map(function(g, i){
      return '<button class="goal" type="button" role="radio" aria-checked="false" ' +
          'tabindex="' + (i === 0 ? "0" : "-1") + '" data-goal="' + esc(g.id) + '">' +
          (g.image
            ? '<span class="goal-media"><img loading="lazy" src="' + esc(g.image) + '" alt="" width="600" height="600"></span>'
            : "") +
          '<span class="goal-body">' +
            '<span class="goal-icon">' + icon(g.icon) + '</span>' +
            '<span class="goal-txt"><b>' + esc(g.label) + '</b><span>' + esc(g.lede) + '</span></span>' +
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
    var hero = $("hero");
    if (!hero || !$("hero-video")){ document.body.className += " past-hero"; return; }
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
    if (!shell) return;
    var t = null;
    function sync(){
      document.documentElement.style.setProperty("--dock-h", shell.offsetHeight + "px");
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

    /* On compare à la cible en attente, pas au src affiché : sinon un
       aller-retour rapide (A vers B vers A) trouve le src encore à « A »,
       n'ordonne aucun nouveau fondu, et le minuteur déjà en vol installe
       « B » alors que « A » est sélectionné — l'image reste sur la
       mauvaise photo, et parfois à opacité nulle. */
    var img = $("stage-img");
    var src = imageFor(state.color);
    if (img && src && pendingSrc !== src){
      pendingSrc = src;
      if (swapTimer) clearTimeout(swapTimer);
      var alt = PRODUCT.name + (state.color ? " color " + state.color : "");
      img.style.opacity = 0;
      swapTimer = setTimeout(function(){
        swapTimer = null;
        img.src = pendingSrc;
        img.alt = alt;
        img.style.opacity = 1;
      }, 150);
    }

    var label = $("dock-variant");
    if (label) label.textContent = variantLabel();
  }

  module("selection", function(){
    if (!PRODUCT) return;
    pendingSrc = imageFor(state.color);

    each(document.querySelectorAll(".rail-item"), function(b){
      b.addEventListener("click", function(){ state.color = b.getAttribute("data-color"); syncSelection(); }, false);
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
     Carrousel
     ===================================================================== */
  module("carousel", function(){
    var cards = $("cards");
    if (!cards) return;
    each(document.querySelectorAll(".card-arrows button"), function(b){
      b.addEventListener("click", function(){
        var step = (cards.querySelector(".pcard") || { offsetWidth: 300 }).offsetWidth + 14;
        var dx = step * Number(b.getAttribute("data-dir"));
        /* La forme à objet de scrollBy n'existe pas sur les Safari anciens :
           on retombe sur une affectation directe de scrollLeft. */
        try { cards.scrollBy({ left: dx, behavior: reduceMotion ? "auto" : "smooth" }); }
        catch(e){ cards.scrollLeft += dx; }
      }, false);
    });
  });

})();
