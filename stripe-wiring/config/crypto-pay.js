/* Lux Automations — crypto payment option (staging wiring).
   Renders a "Pay with crypto" panel from ../config/payment-links.json
   (the "crypto" section) into any element carrying data-lux-crypto.
   Only ENABLED chains are offered — a disabled chain never renders as
   payable (XLM: its Stellar account must hold a ~1 XLM reserve before
   it can receive, and it is not funded yet; XRP: no address on file
   yet, awaiting collection + its 1 XRP base reserve + a test receipt).
   Addresses are read from the config at runtime; none are written in
   page code. Honest by design: the panel says plainly that crypto
   confirmation is manual / watch-based, not automatic like Stripe. */
(function () {
  var STYLE_ID = "lux-crypto-style";
  var CSS =
    ".lux-crypto{border:1px solid #4a3a1e;border-radius:12px;padding:16px 18px;background:#14100b;max-width:560px;}" +
    ".lux-crypto h3{margin:0 0 6px;color:#e8c476;font-size:18px;}" +
    ".lux-crypto p{margin:6px 0;font-size:14.5px;line-height:1.5;}" +
    ".lux-crypto select{width:100%;padding:10px;border-radius:8px;border:1px solid #4a3a1e;background:#0d0b08;color:#f3ead8;font-size:15px;margin:8px 0;}" +
    ".lux-crypto .lux-crypto-addr{display:block;word-break:break-all;background:#0d0b08;border:1px dashed #6b5320;border-radius:8px;padding:10px 12px;font-size:13.5px;color:#ffe9b8;}" +
    ".lux-crypto .lux-crypto-assets{color:#bfae8d;font-size:13px;}" +
    ".lux-crypto .lux-crypto-copy{margin-top:8px;background:#e8c476;color:#171310;border:0;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;font-size:14px;}" +
    ".lux-crypto .lux-crypto-note{color:#bfae8d;font-size:13px;}";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function renderPanel(crypto, mount) {
    var chains = (crypto.chains || []).filter(function (c) { return c.enabled; });
    if (!chains.length) return;

    var wrap = document.createElement("div");
    wrap.className = "lux-crypto";

    var h = document.createElement("h3");
    h.textContent = "Pay with crypto";
    wrap.appendChild(h);

    var intro = document.createElement("p");
    intro.textContent =
      "Prefer crypto? Every price here can be paid on-chain instead of by card. " +
      "Pick your chain, and send to the address shown.";
    wrap.appendChild(intro);

    var sel = document.createElement("select");
    sel.setAttribute("aria-label", "Choose the chain you will pay on");
    chains.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.chain + " — " + c.assets;
      sel.appendChild(o);
    });
    wrap.appendChild(sel);

    var addr = document.createElement("code");
    addr.className = "lux-crypto-addr";
    wrap.appendChild(addr);

    var assets = document.createElement("p");
    assets.className = "lux-crypto-assets";
    wrap.appendChild(assets);

    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "lux-crypto-copy";
    copy.textContent = "Copy address";
    wrap.appendChild(copy);

    var how = document.createElement("p");
    how.innerHTML =
      "<strong>How it works:</strong> prices are in Canadian dollars — the desk confirms the " +
      "exact crypto amount with you <em>before</em> you send (never guess an amount). " +
      "After sending, give the desk your transaction hash. Crypto payments are confirmed " +
      "by hand once the payment is seen on-chain, then your order or project starts — " +
      "the same payment-first rule as cards, just confirmed by watching the chain " +
      "instead of automatically.";
    wrap.appendChild(how);

    var note = document.createElement("p");
    note.className = "lux-crypto-note";
    note.textContent =
      "Send only on the chain you picked — an address cannot recover coins sent on the wrong network.";
    wrap.appendChild(note);

    function show(chain) {
      addr.textContent = chain.address;
      assets.textContent = chain.networks + ". Accepts: " + chain.assets + ".";
      copy.onclick = function () {
        var done = function () { copy.textContent = "Copied ✓"; setTimeout(function () { copy.textContent = "Copy address"; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(chain.address).then(done, done);
        } else { done(); }
      };
    }
    sel.addEventListener("change", function () {
      var c = chains.filter(function (x) { return x.id === sel.value; })[0];
      if (c) show(c);
    });
    show(chains[0]);

    mount.appendChild(wrap);
  }

  function mount() {
    injectStyle();
    fetch("../config/payment-links.json")
      .then(function (r) { return r.json(); })
      .then(function (cfg) {
        if (!cfg.crypto) return;
        document.querySelectorAll("[data-lux-crypto]").forEach(function (el) {
          renderPanel(cfg.crypto, el);
        });
      });
  }
  document.addEventListener("DOMContentLoaded", mount);
})();
