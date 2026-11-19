/* The Country Switch (Vance's design, 2026-11-18; built 2026-11-19).
   A visitor lands; the site reads their country from their connection —
   the same rails the language switch rides — and shows them the price in
   THEIR dollars, up front. US visitors keep the US face untouched.
   The buy buttons never change: every purchase still routes to the one
   US-dollar checkout, whose page prints the US total plainly.
   Rates live in /assets/rates.json, refreshed daily by machine from
   published sources (average of the going rates, set a little below),
   fenced by the Rate Guard — never hand-typed. */
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

  function run() {
    fetch("/api/country", { headers: { accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (info) {
        var country = (info && info.country) || "";
        var currency = COUNTRY_CURRENCY[country];
        if (!currency || currency === "USD") return; // US face untouched.
        return fetch("/assets/rates.json", { cache: "no-cache" })
          .then(function (r) { return r.json(); })
          .then(function (table) {
            var rate = table && table.rates && table.rates[currency];
            if (!rate || !isFinite(rate) || rate <= 0) return;
            switchPrices(rate, currency);
          });
      })
      .catch(function () { /* Any failure: the US face stands. */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
