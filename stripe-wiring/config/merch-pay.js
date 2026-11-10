/* Lux Visuals — merch store buttons (staging wiring).
   Reads ../config/payment-links.json, section "merch_store".
   Same honesty law as stripe-pay.js: a slot with url:null renders the
   honest not-yet-open state — never a dead or fake button.
   Mugs carry price_variants (price differs by size): each size gets its
   own link slot named <product-id>--<size-key> in the product's
   "variant_urls" map once created in the Stripe dashboard. */
(function () {
  function fmt(n) { return "US$" + Number(n).toFixed(2); }

  function liveButton(href, text) {
    var a = document.createElement("a");
    a.className = "lux-pay-btn";
    a.href = href;
    a.textContent = text;
    a.setAttribute("rel", "noopener");
    return a;
  }
  function note(text) {
    var p = document.createElement("p");
    p.className = "lux-pay-note";
    p.textContent = text;
    return p;
  }

  function render(product) {
    var wrap = document.createElement("div");
    wrap.className = "lux-pay";
    wrap.setAttribute("data-lux-pay-slot", "merch_store." + product.id);

    if (product.price_variants) {
      // one button per priced size; a size with no link yet shows the honest state
      var keys = Object.keys(product.price_variants);
      var anyLive = false;
      keys.forEach(function (k) {
        var url = product.variant_urls && product.variant_urls[k.replace(/\s/g, "-")];
        if (url) {
          anyLive = true;
          wrap.appendChild(liveButton(url, "Buy — " + k + " · " + fmt(product.price_variants[k])));
        } else {
          var b = document.createElement("button");
          b.className = "lux-pay-btn lux-pay-soon";
          b.disabled = true;
          b.textContent = k + " · " + fmt(product.price_variants[k]) + " — opens December 1";
          wrap.appendChild(b);
        }
      });
      wrap.appendChild(note(anyLive
        ? "Secure checkout by Stripe — cards, Google Pay and Apple Pay accepted. Printed and shipped by our print partner; made to order."
        : "Checkout opens with the store on December 1 — Lux Automations."));
      return wrap;
    }

    if (product.url) {
      wrap.appendChild(liveButton(product.url, "Buy — " + fmt(product.price)));
      var bits = [];
      if (product.variants) {
        if (product.variants.sizes) bits.push("Sizes: " + product.variants.sizes.join(", "));
        if (product.variants.colours) bits.push("Colours: " + product.variants.colours.join(", "));
      }
      if (bits.length) wrap.appendChild(note(bits.join(" · ") + " — tell us yours at checkout."));
      wrap.appendChild(note("Secure checkout by Stripe — cards, Google Pay and Apple Pay accepted. Printed and shipped by our print partner; made to order."));
    } else {
      var b2 = document.createElement("button");
      b2.className = "lux-pay-btn lux-pay-soon";
      b2.disabled = true;
      b2.textContent = "Opens December 1 — " + fmt(product.price);
      wrap.appendChild(b2);
      wrap.appendChild(note(product.price_display || ""));
    }
    return wrap;
  }

  function mount() {
    fetch("../config/payment-links.json")
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        var list = cfg.merch_store || [];
        var byId = {};
        list.forEach(function (p) { byId[p.id] = p; });
        document.querySelectorAll("[data-lux-merch]").forEach(function (el) {
          var product = byId[el.getAttribute("data-lux-merch")];
          if (product) el.appendChild(render(product));
        });
      });
  }
  document.addEventListener("DOMContentLoaded", mount);
})();
