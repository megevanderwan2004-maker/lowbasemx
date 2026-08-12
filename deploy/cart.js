/* =========================================================================
   lowlabs — panier

   Le site est statique et servi depuis un autre domaine que la boutique :
   il n'existe donc pas de session Shopify côté navigateur. Le panier tient
   ici une liste de RÉFÉRENCES DE VARIANTES Shopify — jamais de prix
   inventés : le nom, la photo et le tarif sont relus du catalogue, qui est
   la copie locale de la boutique.

   Au moment de payer, la liste part telle quelle dans un lien de panier
   Shopify (/cart/ID:QTE,ID:QTE) : c'est Shopify qui reconstruit le panier,
   applique ses prix, son stock et ses remises, puis ouvre son checkout.
   Aucune logique de paiement n'est dupliquée de notre côté.
   ========================================================================= */
(function(global){
  "use strict";

  var STORE = "https://jx8irc-px.myshopify.com";
  var KEY = "lowlabs.cart.v1";
  /* Code de remise créé côté Shopify pour les bundles : il n'est joint au
     lien que si le panier vient d'un bundle, et c'est Shopify qui décide
     de l'appliquer ou non. */
  var BUNDLE_CODE = "BUNDLE10";
  var BUNDLE_OFF = 0.10;

  var CATALOG = global.LOWLABS || null;
  var lines = [];
  var bundled = false;
  var root = null;

  function esc(s){
    return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function money(n){ return CATALOG ? CATALOG.money(n) : "$" + n; }

  function read(){
    try {
      var raw = global.localStorage.getItem(KEY);
      var data = raw ? JSON.parse(raw) : null;
      if (data && data.lines){ lines = data.lines; bundled = !!data.bundled; }
    } catch(e){ lines = []; }
  }
  function write(){
    try { global.localStorage.setItem(KEY, JSON.stringify({ lines: lines, bundled: bundled })); } catch(e){}
  }

  /* Une ligne = une variante Shopify. Le reste (nom, photo, prix) est
     retrouvé au rendu : rien n'est figé dans le stockage, un changement de
     catalogue se répercute donc tout seul. */
  function product(l){ return CATALOG ? CATALOG.byHandle(l.handle) : null; }

  function lineImage(p){ return p ? (p.packshot || p.image) : ""; }

  function lineOptions(l){
    var bits = [];
    if (l.color) bits.push(l.color);
    if (l.size) bits.push("Talla " + l.size);
    return bits.join(" · ");
  }

  /* Le client corrige sa couleur ou sa taille sans repasser par la fiche :
     un menu par option, et la variante Shopify est recalculée derrière. */
  function variantFor(p, color, size){
    var shop = p.shopify;
    if (!shop) return null;
    if (shop.variants && color){
      var byColor = shop.variants[color];
      if (byColor && size && byColor[size]) return byColor[size];
    }
    return shop.variant || null;
  }

  function pickers(p, l, i){
    if (!p.colors && !p.sizes) return "";
    var html = '<span class="cart-vars">';
    if (p.colors){
      html += '<select data-var="color" data-i="' + i + '" aria-label="Color">';
      for (var c = 0; c < p.colors.length; c++){
        var name = p.colors[c].name;
        html += '<option value="' + esc(name) + '"' + (name === l.color ? " selected" : "") + '>' + esc(name) + '</option>';
      }
      html += "</select>";
    }
    if (p.sizes){
      html += '<select data-var="size" data-i="' + i + '" aria-label="Talla">';
      for (var z = 0; z < p.sizes.length; z++){
        var sname = p.sizes[z].name;
        html += '<option value="' + esc(sname) + '"' + (sname === l.size ? " selected" : "") + '>Talla ' + esc(sname) + '</option>';
      }
      html += "</select>";
    }
    return html + "</span>";
  }

  function setVariant(i, which, value){
    var l = lines[i];
    if (!l) return;
    var p = product(l);
    if (!p) return;
    if (which === "color") l.color = value; else l.size = value;
    var v = variantFor(p, l.color, l.size);
    if (v) l.variant = String(v);
    write(); render();
  }

  function count(){
    var n = 0;
    for (var i = 0; i < lines.length; i++) n += lines[i].qty;
    return n;
  }

  function subtotal(){
    var t = 0;
    for (var i = 0; i < lines.length; i++){
      var p = product(lines[i]);
      if (p) t += p.price * lines[i].qty;
    }
    return t;
  }

  function sameLine(a, b){
    return a.variant === b.variant && a.handle === b.handle;
  }

  function add(items, fromBundle){
    for (var i = 0; i < items.length; i++){
      var it = items[i];
      if (!it || !it.variant) continue;
      var line = { variant: String(it.variant), handle: it.handle, color: it.color || null,
                   size: it.size || null, qty: it.qty || 1 };
      var found = false;
      for (var j = 0; j < lines.length; j++){
        if (sameLine(lines[j], line)){ lines[j].qty += line.qty; found = true; break; }
      }
      if (!found) lines.push(line);
    }
    if (fromBundle) bundled = true;
    write(); render(); open();
  }

  function setQty(i, q){
    if (!lines[i]) return;
    lines[i].qty = Math.max(0, q);
    if (!lines[i].qty) lines.splice(i, 1);
    if (!lines.length) bundled = false;
    write(); render();
  }

  /* Lien de panier Shopify : la boutique reconstruit le panier à partir des
     variantes, applique ses prix et ouvre son checkout. */
  function checkoutHref(){
    if (!lines.length) return null;
    var parts = [];
    for (var i = 0; i < lines.length; i++) parts.push(lines[i].variant + ":" + lines[i].qty);
    var url = STORE + "/cart/" + parts.join(",") + "?locale=es&country=MX";
    if (bundled) url += "&discount=" + BUNDLE_CODE;
    return url;
  }

  /* ---------------------------------------------------------------- vue */
  function shell(){
    if (root) return root;
    root = document.createElement("div");
    root.className = "cart";
    root.setAttribute("hidden", "");
    root.innerHTML =
      '<div class="cart-veil" data-close></div>' +
      '<aside class="cart-panel" role="dialog" aria-modal="true" aria-label="Tu carrito">' +
        '<header class="cart-head">' +
          '<b>Tu carrito</b>' +
          '<button class="cart-x btn btn-quiet btn-sm" type="button" data-close aria-label="Cerrar el carrito">✕</button>' +
        '</header>' +
        '<div class="cart-lines"></div>' +
        '<footer class="cart-foot">' +
          '<div class="cart-sum"><span>Subtotal</span><b class="price-num"></b></div>' +
          '<p class="cart-note">Envío gratis a todo México · impuestos y descuentos calculados en el checkout.</p>' +
          '<a class="btn btn-ink btn-block btn-lg cart-go" href="#">Ir al checkout</a>' +
          '<button class="btn btn-quiet btn-block cart-more" type="button" data-close>Seguir comprando</button>' +
        '</footer>' +
      '</aside>';
    document.body.appendChild(root);

    root.addEventListener("change", function(e){
      var t = e.target;
      var which = t.getAttribute && t.getAttribute("data-var");
      if (which) setVariant(Number(t.getAttribute("data-i")), which, t.value);
    }, false);

    root.addEventListener("click", function(e){
      var t = e.target;
      if (t.hasAttribute && t.hasAttribute("data-close")) { close(); return; }
      var act = t.getAttribute && t.getAttribute("data-act");
      if (!act) return;
      var i = Number(t.getAttribute("data-i"));
      if (act === "less") setQty(i, lines[i].qty - 1);
      else if (act === "more") setQty(i, lines[i].qty + 1);
      else if (act === "rm") setQty(i, 0);
    }, false);

    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && !root.hasAttribute("hidden")) close();
    }, false);
    return root;
  }

  function render(){
    var el = shell();
    var box = el.querySelector(".cart-lines");
    if (!lines.length){
      box.innerHTML = '<p class="cart-empty">Tu carrito está vacío.<span>Elige un producto y vuelve aquí.</span></p>';
    } else {
      var html = "";
      for (var i = 0; i < lines.length; i++){
        var l = lines[i], p = product(l);
        if (!p) continue;
        var opts = lineOptions(l);
        html +=
          '<article class="cart-line">' +
            '<a class="cart-thumb" href="' + esc(CATALOG.url(p.handle)) + '">' +
              '<img loading="lazy" src="' + esc(lineImage(p)) + '" alt="" width="90" height="90">' +
            '</a>' +
            '<div class="cart-body">' +
              '<a class="cart-name" href="' + esc(CATALOG.url(p.handle)) + '">' + esc(p.short) + '</a>' +
              (opts && !(p.colors || p.sizes) ? '<span class="cart-opts">' + esc(opts) + '</span>' : "") +
              pickers(p, l, i) +
              '<div class="cart-qty">' +
                '<button type="button" data-act="less" data-i="' + i + '" aria-label="Quitar uno">−</button>' +
                '<span>' + l.qty + '</span>' +
                '<button type="button" data-act="more" data-i="' + i + '" aria-label="Añadir uno">+</button>' +
                '<button class="cart-rm" type="button" data-act="rm" data-i="' + i + '">Quitar</button>' +
              '</div>' +
            '</div>' +
            '<b class="cart-price price-num">' + money(p.price * l.qty) + '</b>' +
          '</article>';
      }
      box.innerHTML = html;
    }

    el.querySelector(".cart-sum b").textContent = money(subtotal()) + " MXN";
    var go = el.querySelector(".cart-go");
    var href = checkoutHref();
    go.setAttribute("href", href || "#");
    if (href) go.removeAttribute("aria-disabled"); else go.setAttribute("aria-disabled", "true");
    el.querySelector(".cart-foot").style.display = lines.length ? "" : "none";

    each(document.querySelectorAll("[data-cart-count]"), function(b){
      var n = count();
      b.setAttribute("data-count", n);
      if (n) b.setAttribute("data-has", "1"); else b.removeAttribute("data-has");
    });
  }

  function each(list, fn){ Array.prototype.forEach.call(list, fn); }

  function open(){
    var el = shell();
    el.removeAttribute("hidden");
    /* Deux images : sans le temps d'un cadre, la transition ne part pas. */
    requestAnimationFrame(function(){ el.className = "cart on"; });
    /* Le dock d'achat est lui aussi fixé en bas : sans ce drapeau il
       chevaucherait le pied du tiroir. */
    document.body.className += " cart-open";
    document.body.style.overflow = "hidden";
  }
  function close(){
    if (!root) return;
    root.className = "cart";
    document.body.className = document.body.className.replace(/\s*cart-open/g, "");
    document.body.style.overflow = "";
    setTimeout(function(){ if (root && root.className === "cart") root.setAttribute("hidden", ""); }, 260);
  }

  /* --------------------------------------------------------------- init */
  function init(){
    CATALOG = global.LOWLABS || CATALOG;
    if (!CATALOG) return;
    read();
    render();
    each(document.querySelectorAll("[data-cart-open]"), function(b){
      b.addEventListener("click", function(e){ e.preventDefault(); open(); }, false);
    });
  }

  global.LOWCART = {
    add: add,
    open: open,
    close: close,
    count: count,
    subtotal: subtotal,
    lines: function(){ return lines.slice(); },
    checkoutHref: checkoutHref,
    BUNDLE_OFF: BUNDLE_OFF,
    BUNDLE_CODE: BUNDLE_CODE,
    init: init
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, false);
  else init();

})(window);
