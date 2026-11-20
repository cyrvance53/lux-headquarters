/* The Country Switch (Vance's design, 2026-11-18; built 2026-11-19).
   A visitor lands; the site reads their country from their connection —
   the same rails the language switch rides — and shows them the price in
   THEIR dollars, up front. US visitors keep the US face untouched.
   The buy buttons never change: every purchase still routes to the one
   US-dollar checkout, whose page prints the US total plainly.
   Rates live in /assets/rates.json, refreshed daily by machine from
   published sources (average of the going rates, set a little below),
   fenced by the Rate Guard — never hand-typed.
   A visitor can also pick their country/currency by hand (the pill in
   the topbar): the pick is stored on their device and overrides the
   auto-read — the correction door for a misread connection.
   Two corrections ride on top (Vance's orders, 2026-11-20): the picker
   leads with Canada and the United States, the two doors this house's
   visitors reach for first, with Automatic right behind them; and the
   last-seen rate is cached on the visitor's own device, so a return
   visit converts INSTANTLY from the cache while the fresh rate corrects
   it quietly in the background — no more prices painting in US dollars
   and flipping to another currency seconds later. */
(function () {
  "use strict";
  if (window.__luxCountrySwitch) return;
  window.__luxCountrySwitch = true;

  // Country -> currency. Only countries whose currency the daily rates
  // table carries can switch; everyone else keeps the US face.
  var COUNTRY_CURRENCY = {
    CA: "CAD", GB: "GBP", AU: "AUD", NZ: "NZD", JP: "JPY", CH: "CHF",
    CN: "CNY", IN: "INR", BR: "BRL", MX: "MXN", ZA: "ZAR", AE: "AED",
    SA: "SAR", SG: "SGD", HK: "HKD", KR: "KRW", SE: "SEK", NO: "NOK",
    DK: "DKK", PL: "PLN", TH: "THB", ID: "IDR", PH: "PHP", MY: "MYR",
    VN: "VND", TW: "TWD", TR: "TRY", IL: "ILS", EG: "EGP", NG: "NGN",
    KE: "KES", GH: "GHS", PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR",
    AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", UY: "UYU", CZ: "CZK",
    HU: "HUF", RO: "RON", BG: "BGN", HR: "EUR", IS: "ISK", QA: "QAR",
    KW: "KWD", OM: "OMR", BH: "BHR", JO: "JOD", LB: "LBP", MA: "MAD",
    DZ: "DZD", TN: "TND", UA: "UAH", RS: "RSD", BA: "BAM", AL: "ALL",
    MK: "MKD", GE: "GEL", AM: "AMD", AZ: "AZN", KZ: "KZT", UZ: "UZS",
    MM: "MMK", KH: "KHR", LA: "LAK", BN: "BND", FJ: "FJD", PG: "PGK",
    JM: "JMD", TT: "TTD", BB: "BBD", BS: "BSD", BZ: "BZD", GY: "GYD",
    SR: "SRD", PY: "PYG", BO: "BOB", EC: "USD", GT: "GTQ", HN: "HNL",
    NI: "NIO", CR: "CRC", PA: "USD", DO: "DOP", HT: "HTG",
    SV: "USD", VE: "VES", AO: "AOA", MZ: "MZN", TZ: "TZS", UG: "UGX",
    ZM: "ZMW", ZW: "ZWL", ET: "ETB", CI: "XOF", SN: "XOF", ML: "XOF",
    CM: "XAF", GA: "XAF", MG: "MGA", MU: "MUR", SC: "SCR", BW: "BWP",
    NA: "NAD", SZ: "SZL", LS: "LSL", MW: "MWK", RW: "RWF",
    // Eurozone — one currency, every member country switches to it.
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
    AT: "EUR", IE: "EUR", PT: "EUR", FI: "EUR", GR: "EUR", LU: "EUR",
    MT: "EUR", CY: "EUR", EE: "EUR", LV: "EUR", LT: "EUR", SK: "EUR",
    SI: "EUR", AD: "EUR", MC: "EUR", SM: "EUR", VA: "EUR", ME: "EUR",
    XK: "EUR"
  };

  function fmt(amount, currency) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol"
      }).format(amount);
    } catch (e) {
      return currency + " " + amount.toFixed(2);
    }
  }

  function currencyName(currency) {
    try {
      var parts = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        currencyDisplay: "name"
      }).formatToParts(2);
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === "currency") return parts[i].value;
      }
    } catch (e) {}
    return currency;
  }

  var PRICE_RE = /US\$(\d[\d,]*\.\d{2})/g;
  var NOTICE = "All prices are in US dollars";

  /* Pure conversion: ORIGINAL US-dollar text in, converted text out.
     Refresh and revert passes always start from the original text —
     converted text no longer contains "US$" for a second pass to find. */
  function convertText(text, rate, currency) {
    if (text.indexOf(NOTICE) !== -1) {
      return (
        "Prices are shown in " + currencyName(currency) +
        " at today's Lux rate — a little below the average going rate. " +
        "Your card is charged in US dollars, and the checkout shows the " +
        "US total plainly before you pay."
      );
    }
    return text.replace(PRICE_RE, function (m, num) {
      var usd = parseFloat(num.replace(/,/g, ""));
      if (!isFinite(usd)) return m;
      return fmt(usd * rate, currency);
    });
  }

  /* Every node the first pass changes is recorded with its original
     text, so the background refresh can recompute it at a fresh rate
     and a revert can restore the US face verbatim. */
  var snapshots = [];
  var applied = null; // { currency, rate } currently showing on the page

  function applyConversion(rate, currency) {
    if (snapshots.length) {
      snapshots.forEach(function (s) {
        s.node.nodeValue = convertText(s.original, rate, currency);
      });
    } else {
      var walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            var p = node.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            var tag = p.tagName;
            if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA")
              return NodeFilter.FILTER_REJECT;
            if (p.closest && p.closest("[data-no-switch]"))
              return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      var nodes = [];
      var n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (node) {
        var text = node.nodeValue;
        if (!text) return;
        if (text.indexOf(NOTICE) === -1 && text.indexOf("US$") === -1) return;
        var next = convertText(text, rate, currency);
        if (next !== text) {
          snapshots.push({ node: node, original: text });
          node.nodeValue = next;
        }
      });
    }
    applied = { currency: currency, rate: rate };
    return snapshots.length;
  }

  function revertToUS() {
    snapshots.forEach(function (s) {
      s.node.nodeValue = s.original;
    });
    applied = null;
  }

  /* ---------- The rate cache (Vance's order, 2026-11-20) ----------
     The last rate a visitor actually saw, kept on their own device.
     A return visit applies it the moment the page is ready — zero
     network waits — and the fresh rate then corrects it behind the
     scenes. The cache is cleared when the visitor picks the United
     States, returns to Automatic, or a fresh auto-read lands on the
     US face, so a stale cache can never outlive the face it made. */
  var CACHE_KEY = "luxCurrencyCache";

  function readCache() {
    try {
      var raw = window.localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (!c || !c.currency || !isFinite(c.rate) || c.rate <= 0) return null;
      return c;
    } catch (e) {
      return null;
    }
  }

  function writeCache(currency, rate, source) {
    try {
      window.localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ currency: currency, rate: rate, source: source })
      );
    } catch (e) {}
  }

  function clearCache() {
    try { window.localStorage.removeItem(CACHE_KEY); } catch (e) {}
  }

  function fetchRate(currency) {
    return fetch("/assets/rates.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (table) {
        var rate = table && table.rates && table.rates[currency];
        if (!rate || !isFinite(rate) || rate <= 0) return null;
        return rate;
      });
  }

  function convertWith(currency, source) {
    return fetchRate(currency).then(function (rate) {
      if (rate === null) return;
      applyConversion(rate, currency);
      writeCache(currency, rate, source);
    });
  }

  /* Background correction after an instant cached apply: re-apply
     only if the fresh rate actually moved, then refresh the cache. */
  function refreshRate(currency, source) {
    return fetchRate(currency)
      .then(function (rate) {
        if (rate === null) return;
        if (!applied || applied.currency !== currency || applied.rate !== rate) {
          applyConversion(rate, currency);
        }
        writeCache(currency, rate, source);
      })
      .catch(function () { /* The cached face stands. */ });
  }

  /* ---------- The manual pick (Vance's order, 2026-11-20) ----------
     The auto-read stands or falls on the connection's geolocation, and
     a visitor it misreads (Vance, in Edmonton, read as Poland) had no
     way to correct it. This control is that way: a small pill in the
     topbar, in the Doors design language. The pick is stored on the
     visitor's own device and overrides the auto-read on every page and
     every later visit; "Automatic" hands the wheel back to detection.
     A United States pick shows the untouched US face.
     List order is Vance's word: Canada first, United States second,
     Automatic third, then every other currency in its standing order —
     the two doors this house's visitors use most sit at the top where
     a thumb can reach them, not buried thirty rows down. The three
     named countries carry short labels ("Canada — CAD") so the closed
     pill never truncates the pick it is showing. */
  var PICK_KEY = "luxCurrencyPick";
  var PICK_ORDER = [
    "USD", "CAD", "PLN", "EUR", "GBP", "AUD", "NZD", "CHF", "JPY",
    "CNY", "INR", "BRL", "MXN", "ZAR", "SGD", "HKD", "KRW", "SEK",
    "NOK", "DKK", "CZK", "HUF", "RON", "ISK", "THB", "IDR", "PHP",
    "MYR", "TRY", "ILS"
  ];
  var PICK_FIRST = ["CAD", "USD"];
  var PICK_COUNTRY = { USD: "United States", CAD: "Canada", PLN: "Poland" };

  function buildPicker(pick) {
    if (document.getElementById("luxcurr")) return;
    var bar =
      document.querySelector(".topbar .luxmenus") ||
      document.querySelector(".topbar") ||
      document.querySelector(".luxbar");
    if (!bar) return; // No topbar on this page; the stored pick still rules.
    if (!document.getElementById("luxcurr-css")) {
      var style = document.createElement("style");
      style.id = "luxcurr-css";
      style.textContent =
        ".luxcurr{display:inline-flex;align-items:center;gap:8px}" +
        ".luxcurr label{font:700 13px/1.1 Inter,system-ui,'Segoe UI',Helvetica,Arial,sans-serif;color:#14100a;letter-spacing:.02em;white-space:nowrap}" +
        ".luxcurr select{min-height:44px;padding:8px 14px;border:1px solid #9db8da;border-radius:999px;background:#B9CCE6;color:#14100a;font:700 15px/1.1 Inter,system-ui,'Segoe UI',Helvetica,Arial,sans-serif;letter-spacing:.02em;cursor:pointer;max-width:340px;box-shadow:0 2px 10px rgba(0,0,0,.18)}" +
        ".luxcurr select:hover{background:#CFE0F2}" +
        ".luxcurr select:focus-visible{outline:3px solid #7fd4ff;outline-offset:2px}";
      document.head.appendChild(style);
    }
    var wrap = document.createElement("div");
    wrap.className = "luxcurr";
    wrap.id = "luxcurr";
    var label = document.createElement("label");
    label.setAttribute("for", "luxcurr-select");
    label.textContent = "Country / currency";
    var select = document.createElement("select");
    select.id = "luxcurr-select";
    select.setAttribute("aria-label", "Country / currency");
    function optionFor(code) {
      var opt = document.createElement("option");
      opt.value = code;
      var name = currencyName(code);
      opt.textContent = PICK_COUNTRY[code]
        ? PICK_COUNTRY[code] + " — " + code
        : name + " (" + code + ")";
      return opt;
    }
    PICK_FIRST.forEach(function (code) {
      select.appendChild(optionFor(code));
    });
    var auto = document.createElement("option");
    auto.value = "";
    auto.textContent = "Automatic (detected)";
    select.appendChild(auto);
    PICK_ORDER.forEach(function (code) {
      if (PICK_FIRST.indexOf(code) !== -1) return;
      select.appendChild(optionFor(code));
    });
    select.value = pick || "";
    select.addEventListener("change", function () {
      try {
        if (select.value) window.localStorage.setItem(PICK_KEY, select.value);
        else window.localStorage.removeItem(PICK_KEY);
        // The US face and a fresh Automatic start carry no cache.
        if (!select.value || select.value === "USD") clearCache();
      } catch (e) {}
      window.location.reload();
    });
    wrap.appendChild(label);
    wrap.appendChild(select);
    bar.appendChild(wrap);
  }

  function run() {
    var pick = null;
    try { pick = window.localStorage.getItem(PICK_KEY); } catch (e) {}
    buildPicker(pick);
    if (pick) {
      if (pick === "USD") {
        clearCache();
        return; // The untouched US face, by the visitor's word.
      }
      var pc = readCache();
      if (pc && pc.currency === pick) {
        applyConversion(pc.rate, pick); // Instant — no network waited on.
        refreshRate(pick, "pick"); // The fresh rate corrects it quietly.
      } else {
        convertWith(pick, "pick").catch(function () { /* The US face stands. */ });
      }
      return;
    }
    var ac = readCache();
    if (ac && ac.source === "auto" && ac.currency !== "USD") {
      applyConversion(ac.rate, ac.currency); // Instant — no network waited on.
    }
    fetch("/api/country", { headers: { accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (info) {
        var country = (info && info.country) || "";
        var currency = COUNTRY_CURRENCY[country];
        if (!currency || currency === "USD") {
          // US face: undo any cached conversion and drop the cache.
          if (applied) revertToUS();
          clearCache();
          return;
        }
        return fetchRate(currency).then(function (rate) {
          if (rate === null) return; // The cached face (if any) stands.
          if (!applied || applied.currency !== currency || applied.rate !== rate) {
            applyConversion(rate, currency);
          }
          writeCache(currency, rate, "auto");
        });
      })
      .catch(function () { /* Any failure: the showing face stands. */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
