/* Lux Automations — Stripe Payment Link buttons (staging wiring).
   No API keys anywhere: Payment Links are plain URLs from ../config/payment-links.json.
   A slot with url:null renders the honest not-yet-open state — never a dead button. */
(function () {
  function renderButton(slot, product) {
    var wrap = document.createElement("div");
    wrap.className = "lux-pay";
    wrap.setAttribute("data-lux-pay-slot", slot);
    if (product.url) {
      var a = document.createElement("a");
      a.className = "lux-pay-btn";
      a.href = product.url;
      a.textContent = "Pay with Stripe — " + product.label;
      a.setAttribute("rel", "noopener");
      wrap.appendChild(a);
      var note = document.createElement("p");
      note.className = "lux-pay-note";
      note.textContent = "Secure checkout by Stripe — cards, Google Pay and Apple Pay accepted.";
      wrap.appendChild(note);
    } else {
      var b = document.createElement("button");
      b.className = "lux-pay-btn lux-pay-soon";
      b.disabled = true;
      b.textContent = "Opens December 1 — Lux Automations";
      wrap.appendChild(b);
      var note2 = document.createElement("p");
      note2.className = "lux-pay-note";
      note2.textContent = product.price_display || "";
      wrap.appendChild(note2);
    }
    return wrap;
  }

  function mount() {
    fetch("../config/payment-links.json")
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        document.querySelectorAll("[data-lux-pay]").forEach(function (el) {
          var path = el.getAttribute("data-lux-pay").split(".");
          var list = cfg[path[0]];
          if (Array.isArray(list)) {
            var product = list.filter(function (p) { return p.id === path[1]; })[0];
            if (product) el.appendChild(renderButton(path.join("."), product));
          }
        });
      });
  }
  document.addEventListener("DOMContentLoaded", mount);
})();
