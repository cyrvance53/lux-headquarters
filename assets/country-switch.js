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
   auto-read — the correction door for a misread connection. */
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

  function switchPrices(rate, currency) {
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
    var changed = 0;
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      if (!text) return;
      if (text.indexOf("All prices are in US dollars") !== -1) {
        node.nodeValue =
          "Prices are shown in " + currencyName(currency) +
          " at today's Lux rate — a little below the average going rate. " +
          "Your card is charged in US dollars, and the checkout shows the " +
          "US total plainly before you pay.";
        changed++;
        return;
      }
      if (text.indexOf("US$") === -1) return;
      var next = text.replace(PRICE_RE, function (m, num) {
        var usd = parseFloat(num.replace(/,/g, ""));
        if (!isFinite(usd)) return m;
        return fmt(usd * rate, currency);
      });
      if (next !== text) {
        node.nodeValue = next;
        changed++;
      }
    });
    return changed;
  }

  function convertWith(currency) {
    return fetch("/assets/rates.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (table) {
        var rate = table && table.rates && table.rates[currency];
        if (!rate || !isFinite(rate) || rate <= 0) return;
        switchPrices(rate, currency);
      });
  }

  /* ---------- The manual pick (Vance's order, 2026-11-20) ----------
     The auto-read stands or falls on the connection's geolocation, and
     a visitor it misreads (Vance, in Edmonton, read as Poland) had no
     way to correct it. This control is that way: a small pill in the
     topbar, in the Doors design language. The pick is stored on the
     visitor's own device and overrides the auto-read on every page and
     every later visit; "Automatic" hands the wheel back to detection.
     A United States pick shows the untouched US face. */
  var PICK_KEY = "luxCurrencyPick";
  var PICK_ORDER = [
    "USD", "CAD", "PLN", "EUR", "GBP", "AUD", "NZD", "CHF", "JPY",
    "CNY", "INR", "BRL", "MXN", "ZAR", "SGD", "HKD", "KRW", "SEK",
    "NOK", "DKK", "CZK", "HUF", "RON", "ISK", "THB", "IDR", "PHP",
    "MYR", "TRY", "ILS"
  ];
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
        ".luxcurr select{min-height:44px;padding:8px 14px;border:1px solid #9db8da;border-radius:999px;background:#B9CCE6;color:#14100a;font:700 15px/1.1 Inter,system-ui,'Segoe UI',Helvetica,Arial,sans-serif;letter-spacing:.02em;cursor:pointer;max-width:250px;box-shadow:0 2px 10px rgba(0,0,0,.18)}" +
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
    var auto = document.createElement("option");
    auto.value = "";
    auto.textContent = "Automatic (detected)";
    select.appendChild(auto);
    PICK_ORDER.forEach(function (code) {
      var opt = document.createElement("option");
      opt.value = code;
      var name = currencyName(code);
      opt.textContent = PICK_COUNTRY[code]
        ? PICK_COUNTRY[code] + " — " + name
        : name + " (" + code + ")";
      select.appendChild(opt);
    });
    select.value = pick || "";
    select.addEventListener("change", function () {
      try {
        if (select.value) window.localStorage.setItem(PICK_KEY, select.value);
        else window.localStorage.removeItem(PICK_KEY);
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
      if (pick === "USD") return; // The untouched US face, by the visitor's word.
      convertWith(pick).catch(function () { /* The US face stands. */ });
      return;
    }
    fetch("/api/country", { headers: { accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (info) {
        var country = (info && info.country) || "";
        var currency = COUNTRY_CURRENCY[country];
        if (!currency || currency === "USD") return; // US face untouched.
        return convertWith(currency);
      })
      .catch(function () { /* Any failure: the US face stands. */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
