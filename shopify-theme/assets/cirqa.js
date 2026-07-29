(function(){
  "use strict";
  /* Shopify checkout — variant IDs reales de la tienda lowlabs */
  var STORE = "";
  /* Variantes réelles injectées par Liquid (voir window.CIRQA en bas du template) */
  var DATA = window.CIRQA || { variants: [] };
  var VARIANTS = {}, AVAILABLE = {};
  DATA.variants.forEach(function(v){
    VARIANTS[v.color] = VARIANTS[v.color] || {};
    VARIANTS[v.color][v.size] = String(v.id);
    AVAILABLE[v.color + "|" + v.size] = v.available;
  });
  var IMGS = {
    "Negra": "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-negra.jpg?v=1785272697",
    "Gris Francés": "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-gris-frances.jpg?v=1785272697",
    "Malva": "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-malva.jpg?v=1785272697",
    "Azul Capitán": "https://cdn.shopify.com/s/files/1/1026/1721/9449/files/cirqa-azul-capitan.jpg?v=1785272696"
  };
  var COLOR_DESC = {
    "Negra": "El clásico que desaparece bajo cualquier manga — discreción total, del gimnasio a la oficina.",
    "Gris Francés": "Un neutro cálido, tono arena, que acompaña sin pedir atención.",
    "Malva": "Suave y personal, para quien mide su bienestar en calma.",
    "Azul Capitán": "Profundo y sereno, con carácter para todo el día."
  };
  var state = { color: "Negra", size: "S–M" };
  var swapTimer = null;
  var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Précharge des visuels couleur (idle) pour un swap sans flash */
  (window.requestIdleCallback || function(f){ setTimeout(f, 800); })(function(){
    Object.keys(IMGS).forEach(function(k){ (new Image()).src = IMGS[k]; });
  });

  function syncSwatches(){
    document.querySelectorAll(".swatch,.chip").forEach(function(b){
      var on = b.dataset.color === state.color;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".size-btn").forEach(function(b){
      var on = b.dataset.size === state.size;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    var img = IMGS[state.color], alt = "Garmin CIRQA Smart Band color " + state.color;
    if (swapTimer) clearTimeout(swapTimer);
    var els = ["stage-img","buy-img"].map(function(id){ return document.getElementById(id); }).filter(Boolean);
    var needSwap = els.some(function(el){ return el.src !== img; });
    if (needSwap){
      els.forEach(function(el){ el.style.opacity = 0; });
      swapTimer = setTimeout(function(){
        els.forEach(function(el){ el.src = img; el.alt = alt; el.style.opacity = 1; });
      }, 150);
    }
    var cn = document.getElementById("color-name"); if (cn) cn.textContent = state.color;
    var bn = document.getElementById("buy-color-name"); if (bn) bn.textContent = state.color;
    var cd = document.getElementById("color-desc"); if (cd) cd.textContent = COLOR_DESC[state.color];
    var cc = document.getElementById("colors-cta"); if (cc) cc.textContent = "Continuar con " + state.color + " →";
    var co = document.getElementById("checkout-btn");
    if (co && !co.disabled){
      var inStock = AVAILABLE[state.color + "|" + state.size] !== false;
      co.textContent = inStock ? DATA.ctaLabel : "Agotado en esta combinación";
      co.classList.toggle("is-oos", !inStock);
    }
  }
  document.querySelectorAll(".swatch,.chip").forEach(function(b){
    b.addEventListener("click", function(){ state.color = b.dataset.color; syncSwatches(); });
  });
  document.querySelectorAll(".size-btn").forEach(function(b){
    b.addEventListener("click", function(){ state.size = b.dataset.size; syncSwatches(); });
  });
  syncSwatches();

  /* Radiogroups : navigation aux flèches (roving tabindex géré dans syncSwatches) */
  document.querySelectorAll('[role="radiogroup"]').forEach(function(group){
    var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    group.addEventListener("keydown", function(e){
      var i = radios.indexOf(document.activeElement); if (i < 0) return;
      var d = (e.key === "ArrowRight" || e.key === "ArrowDown") ? 1 : (e.key === "ArrowLeft" || e.key === "ArrowUp") ? -1 : 0;
      if (!d) return; e.preventDefault();
      var next = radios[(i + d + radios.length) % radios.length];
      next.click(); next.focus();
    });
  });

  /* Checkout : garde anti double-clic + feedback */
  document.getElementById("checkout-btn").addEventListener("click", function(){
    var btn = this;
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = "Redirigiendo al pago…";
    var id = (VARIANTS[state.color] || {})[state.size];
    if (!id){ btn.disabled = false; btn.textContent = "Selecciona color y talla"; return; }
    window.location.href = STORE + "/cart/" + id + ":1";
    setTimeout(function(){ btn.disabled = false; btn.textContent = DATA.ctaLabel; }, 6000);
  });

  /* Carousel arrows */
  var cards = document.getElementById("cards");
  document.querySelectorAll(".car-arrows button").forEach(function(b){
    b.addEventListener("click", function(){
      cards.scrollBy({ left: 320 * Number(b.dataset.dir), behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Hardware story : rotación automática con barra de progreso (patrón WHOOP fifty-fifty) */
  (function(){
    var items = Array.prototype.slice.call(document.querySelectorAll(".hw-item"));
    var img = document.getElementById("hw-img");
    var pauseBtn = document.getElementById("hw-pause");
    if (!items.length || !img || !pauseBtn) return;
    var idx = 0, paused = reduceMotion, raf = null, start = null;
    var DURATION = 5000;
    function select(i, restart){
      idx = i;
      items.forEach(function(it, j){
        it.classList.toggle("active", j === i);
        var bar = it.querySelector(".hw-track i");
        if (bar) bar.style.width = "0";
      });
      var it = items[i];
      if (img.src !== it.dataset.img){ img.src = it.dataset.img; img.alt = it.dataset.alt || ""; }
      if (restart){ start = null; }
    }
    function tick(ts){
      if (!paused){
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / DURATION);
        var bar = items[idx].querySelector(".hw-track i");
        if (bar) bar.style.width = (p * 100) + "%";
        if (p >= 1){ select((idx + 1) % items.length, true); }
      }
      raf = requestAnimationFrame(tick);
    }
    items.forEach(function(it, i){
      it.addEventListener("click", function(){ select(i, true); });
    });
    pauseBtn.addEventListener("click", function(){
      paused = !paused;
      if (!paused) start = null;
      pauseBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      pauseBtn.setAttribute("aria-label", paused ? "Reanudar rotación automática" : "Pausar rotación automática");
      document.getElementById("hw-pause-icon").innerHTML = paused
        ? '<path d="M8 5v14l11-7z"/>'
        : '<rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/>';
    });
    if (reduceMotion){
      pauseBtn.setAttribute("aria-pressed", "true");
      pauseBtn.setAttribute("aria-label", "Reanudar rotación automática");
      document.getElementById("hw-pause-icon").innerHTML = '<path d="M8 5v14l11-7z"/>';
    }
    raf = requestAnimationFrame(tick);
  })();

  if ("IntersectionObserver" in window){
    /* Sticky mobile buy bar : visible après le hero, cachée sur la section d'achat */
    var sticky = document.getElementById("sticky-buy");
    var hero = document.querySelector(".hero");
    var buySection = document.getElementById("comprar");
    var pastHero = false, onBuy = false;
    var updateSticky = function(){
      var show = pastHero && !onBuy;
      sticky.classList.toggle("on", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      if ("inert" in sticky) sticky.inert = !show;
    };
    new IntersectionObserver(function(en){ pastHero = !en[en.length-1].isIntersecting; updateSticky(); }, { threshold: 0 }).observe(hero);
    new IntersectionObserver(function(en){ onBuy = en[en.length-1].isIntersecting; updateSticky(); }, { threshold: 0.15 }).observe(buySection);

    /* Scroll reveal */
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function(el, i){
      el.style.transitionDelay = (Math.min(i % 6, 4) * 40) + "ms";
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in"); });
  }
})();
