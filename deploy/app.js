(function(){
  "use strict";

  /* =====================================================================
     Boutique Shopify
     ===================================================================== */
  var STORE = "https://jx8irc-px.myshopify.com";
  var PRODUCT_HANDLE = "garmin-cirqa-smart-band";
  var CHECKOUT_PARAMS = "&locale=es&country=MX";
  var VARIANTS = {
    "Negra":        { "S–M": "64093481107833", "L–XL": "64093481140601" },
    "Gris Francés": { "S–M": "64093481173369", "L–XL": "64093481206137" },
    "Malva":        { "S–M": "64093481238905", "L–XL": "64093481271673" },
    "Azul Capitán": { "S–M": "64093481304441", "L–XL": "64093481337209" }
  };
  var IMGS = {
    "Negra":        "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-negra.jpg?v=1785272697",
    "Gris Francés": "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-gris-frances.jpg?v=1785272697",
    "Malva":        "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-malva.jpg?v=1785272697",
    "Azul Capitán": "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-azul-capitan.jpg?v=1785272696"
  };

  var state = { color: "Negra", size: "S–M" };
  var reduceMotion = document.documentElement.className.indexOf("rm") > -1;
  var hasIO = "IntersectionObserver" in window;

  function $(id){ return document.getElementById(id); }
  function each(list, fn){ Array.prototype.forEach.call(list, fn); }

  /* Chaque module est isolé : une panne dans l'un ne doit jamais empêcher
     les autres de s'initialiser — et surtout jamais laisser la page
     invisible, puisque .rv part d'une opacité nulle. */
  function module(name, fn){
    try { fn(); }
    catch(err){
      if (window.console && console.error) console.error("[cirqa] " + name, err);
    }
  }

  /* =====================================================================
     Révélation au scroll — initialisée en premier

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
     Flou des surfaces fixes

     Tant que la vidéo joue derrière la nav et le dock, le fond serait
     rééchantillonné à la fréquence des images, par-dessus le décodage.
     Le flou n'est activé qu'une fois le hero dépassé — à cet endroit un
     voile sur une vidéo sombre et un flou sont visuellement identiques.
     ===================================================================== */
  module("past-hero", function(){
    var hero = $("hero");
    if (!hero) return;
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
     Sélection couleur / taille
     ===================================================================== */
  var swapTimer = null;
  var pendingSrc = IMGS[state.color];

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
    var src = IMGS[state.color];
    if (img && pendingSrc !== src){
      pendingSrc = src;
      if (swapTimer) clearTimeout(swapTimer);
      var alt = "Garmin CIRQA Smart Band color " + state.color;
      img.style.opacity = 0;
      swapTimer = setTimeout(function(){
        swapTimer = null;
        img.src = pendingSrc;
        img.alt = alt;
        img.style.opacity = 1;
      }, 150);
    }

    var label = $("dock-variant");
    if (label) label.textContent = state.color + " · Talla " + state.size + " · Envío gratis";
  }

  module("selection", function(){
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
  (window.requestIdleCallback || function(f){ setTimeout(f, 800); })(function(){
    for (var k in IMGS){ if (IMGS.hasOwnProperty(k)) (new Image()).src = IMGS[k]; }
  });
  });

  /* =====================================================================
     Checkout — la sélection courante part vers Shopify
     ===================================================================== */
  function goToCheckout(btn, restoreLabel){
    if (btn.disabled) return;
    /* La référence est résolue AVANT de désactiver le bouton : une
       combinaison inconnue ne doit pas laisser un bouton mort. */
    var byColor = VARIANTS[state.color];
    var id = byColor && byColor[state.size];
    if (!id){
      window.location.href = STORE + "/products/" + PRODUCT_HANDLE + "?locale=es&country=MX";
      return;
    }
    btn.disabled = true;
    btn.setAttribute("aria-disabled", "true");
    var previous = btn.textContent;
    btn.textContent = "Abriendo tu selección…";
    window.location.href = STORE + "/products/" + PRODUCT_HANDLE + "?variant=" + id + CHECKOUT_PARAMS;
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
    checkoutBtn.addEventListener("click", function(){
      goToCheckout(checkoutBtn, "Comprar ahora — $3,999 MXN");
    }, false);
  }
  var dockBtn = $("dock-btn");
  if (dockBtn){
    dockBtn.addEventListener("click", function(){
      goToCheckout(dockBtn, "Comprar ahora");
    }, false);
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
