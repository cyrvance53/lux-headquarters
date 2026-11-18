/* =====================================================================
   THE SHELF CAROUSEL — "rolling squares" (Vance's design, 2026-11-17)
   One reusable component: a compact strip of product squares that roll
   side to side, can be pulled along by hand, and open the product's
   page on a tap. Every square is a little living window — a real
   product video where one exists, the product's own page imagery
   elsewhere. Never generic footage dressed as a product at work.

   THE ONE CENTRAL LIST: LUX_PRODUCTS below is the component's single
   product list, mirroring the house registry
   (home-base/product-numbers-2026-11-17.md) in number order.
   To add a product: add ONE entry here (and one line in the registry)
   — its square appears everywhere this component runs, wearing the
   next number. To give a product a living tile later: set its `video`
   field to the file path — a one-line change per tile.

   Include pattern (product pages, one level deep):
     <link rel="stylesheet" href="../assets/shelf-carousel.css">
     <div data-luxsc data-base="../"></div>
     <script src="../assets/shelf-carousel.js" defer></script>
   (On the homepage, data-base is "" and the paths drop the "../".)
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- THE CENTRAL PRODUCT LIST (registry order, No. 1–29) ----------
     Fields: no (registry number), name, slug (page folder), line
     (the product's one-liner, verbatim from its page), glyph (the
     product's own hero mark from its page), img (still image path,
     site-root relative), video (MEDIA SLOT: a real product video
     path, or null — the tile falls back to img, then to glyph). */
  var LUX_PRODUCTS = [
    { no: 1,  name: "The Patch", slug: "patch",
      line: "Every AI agent shows ID at the door before it acts or pays. Rogues stop here.",
      img: "patch/assets/patch-hero-poster.jpg",
      video: "patch/assets/patch-hero-video-web.mp4" },
    { no: 2,  name: "SeamGuard", slug: "seamguard",
      line: "Guards every agent-to-agent crossing. Two keys must say yes, and every crossing leaves a receipt.",
      img: "seamguard/assets/seamguard-brain-aura.webp", video: null },
    { no: 3,  name: "School in a Box", slug: "school-in-a-box",
      line: "A whole school in one small box. Lessons that run even with no internet.",
      img: "school-in-a-box/assets/img-the-box.webp", video: null },
    { no: 4,  name: "Agent Spending Power", slug: "spending-power", glyph: "\u{1F4B3}",
      line: "Give an agent a spending limit with rules. It can only spend inside them.", video: null },
    { no: 5,  name: "Verified Payment Requests", slug: "verified-payments", glyph: "✅",
      line: "Checks a payment request is real before any money moves.", video: null },
    { no: 6,  name: "AI Receipt Book", slug: "receipt-book", glyph: "\u{1F9FE}",
      line: "A receipt for everything your agents do, kept in one book you can check.", video: null },
    { no: 7,  name: "Company Agent Identity Gate", slug: "identity-gate", glyph: "\u{1F511}",
      line: "One gate where a company's agents prove who they are.", video: null },
    { no: 8,  name: "Behaviour Watch + Kill Switch", slug: "behaviour-watch", glyph: "\u{1F441}️",
      line: "Watches how agents behave, flags trouble, and can stop one instantly.", video: null },
    { no: 9,  name: "Chargeback Evidence Packs", slug: "chargeback-packs", glyph: "\u{1F5C2}️",
      line: "Builds the evidence pack that wins chargeback fights.", video: null },
    { no: 10, name: "Good Agents Front Door", slug: "front-door", glyph: "\u{1F6AA}",
      line: "A checked front door where good agents are welcomed in.", video: null },
    { no: 11, name: "Caller Identity for APIs", slug: "caller-identity", glyph: "\u{1F4DE}",
      line: "Proves who is calling your systems before they get in.", video: null },
    { no: 12, name: "Fleet Identity", slug: "fleet-identity", glyph: "\u{1F916}",
      line: "ID cards for drone and robot fleets. Every machine checked.", video: null },
    { no: 13, name: "Verified Escrow", slug: "verified-escrow", glyph: "⚖️",
      line: "Holds money safe between strangers until the work is proven done.", video: null },
    { no: 14, name: "Customer ID Card", slug: "customer-id-card", glyph: "\u{1FAAA}",
      line: "A simple ID card local businesses can check at the counter.", video: null },
    { no: 15, name: "MachineBook", slug: "machine-book", glyph: "\u{1F3ED}",
      line: "The receipt book machines need for Europe's new machinery law.", video: null },
    { no: 16, name: "WardDoor", slug: "ward-door", glyph: "\u{1F3E5}",
      line: "Checks the devices on a hospital ward before they connect.", video: null },
    { no: 17, name: "TapCheck", slug: "tap-check", glyph: "\u{1F6B0}",
      line: "Checks the systems on a city's water network.", video: null },
    { no: 18, name: "FleetDoor", slug: "fleet-door", glyph: "\u{1F697}",
      line: "Connected vehicles checked, car by car.", video: null },
    { no: 19, name: "HomeWard", slug: "home-ward", glyph: "\u{1F3E0}",
      line: "Checks home medical devices, so the right equipment is the one that talks.", video: null },
    { no: 20, name: "TowerCheck", slug: "tower-check", glyph: "\u{1F3E2}",
      line: "Checks a building's lifts, doors, and controllers.", video: null },
    { no: 21, name: "LineSeam", slug: "line-seam", glyph: "⚙️",
      line: "Guards the joins on a factory line. Every crossing checked.", video: null },
    { no: 22, name: "AisleCross", slug: "aisle-cross", glyph: "\u{1F3EC}",
      line: "Warehouse robot fleets, checked at every crossing.", video: null },
    { no: 23, name: "PlugCheck", slug: "plug-check", glyph: "\u{1F50C}",
      line: "Connected products checked for Europe's Cyber Resilience Act.", video: null },
    { no: 24, name: "GroundDoor", slug: "ground-door", glyph: "\u{1F6F0}️",
      line: "Checks who talks to a satellite from the ground.", video: null },
    { no: 25, name: "SteadyHome", slug: "steady-home", glyph: "\u{1F932}",
      line: "Checked devices for elder care at home, with a calm record for family.", video: null },
    { no: 26, name: "PlayCheck", slug: "play-check", glyph: "\u{1F9F8}",
      line: "Checks children's connected toys and devices before they play.", video: null },
    { no: 27, name: "SteadyHand", slug: "steady-hand", glyph: "\u{1F9BE}",
      line: "Identity and receipts for surgical and lab robots.", video: null },
    { no: 28, name: "FieldDoor", slug: "field-door", glyph: "\u{1F69C}",
      line: "Farm machines checked before they work the field.", video: null },
    { no: 29, name: "DepotCheck", slug: "depot-check", glyph: "\u{1F68C}",
      line: "Checks the buses, trains, and systems in a transit depot.", video: null }
  ];

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function buildTile(p, base, hereSlug) {
    var a = el("a", "luxsc-tile");
    a.href = base + p.slug + "/";
    a.setAttribute("aria-label", "Product No. " + p.no + " — " + p.name + ": " + p.line);
    if (p.slug === hereSlug) {
      a.classList.add("is-here");
      a.setAttribute("aria-current", "page");
    }

    var media = el("span", "luxsc-media");
    if (p.video) {
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true;
      v.setAttribute("preload", "none");
      v.setAttribute("aria-hidden", "true");
      if (p.img) v.setAttribute("poster", base + p.img);
      var src = document.createElement("source");
      src.setAttribute("data-src", base + p.video);
      src.type = "video/mp4";
      v.appendChild(src);
      media.appendChild(v);
      a._luxVideo = v;
    } else if (p.img) {
      var im = document.createElement("img");
      im.src = base + p.img;
      im.alt = "";
      im.loading = "lazy";
      im.decoding = "async";
      media.appendChild(im);
    } else {
      var g = el("span", "luxsc-glyph", p.glyph || "");
      g.setAttribute("aria-hidden", "true");
      media.appendChild(g);
    }
    var chip = el("span", "luxsc-no", "No. " + p.no);
    media.appendChild(chip);
    if (p.slug === hereSlug) media.appendChild(el("span", "luxsc-here", "You're here"));
    a.appendChild(media);

    var body = el("span", "luxsc-body");
    body.appendChild(el("span", "luxsc-name", p.name));
    body.appendChild(el("span", "luxsc-line", p.line));
    a.appendChild(body);
    return a;
  }

  function init(mount) {
    var base = mount.getAttribute("data-base") || "";
    var hereSlug = (window.location.pathname.replace(/\/+$/, "").split("/").pop() || "");

    var root = el("section", "luxsc");
    root.setAttribute("role", "region");
    root.setAttribute("aria-roledescription", "carousel");
    root.setAttribute("aria-label", "Browse the shelf — all " + LUX_PRODUCTS.length + " products");

    var head = el("div", "luxsc-head");
    var htxt = el("div", "luxsc-htxt");
    htxt.appendChild(el("p", "luxsc-kicker", "Browse the shelf"));
    var h = el("h2", "luxsc-title", LUX_PRODUCTS.length + " products, one house");
    htxt.appendChild(h);
    htxt.appendChild(el("p", "luxsc-hint", "Pull the squares along — tap one to visit its page."));
    head.appendChild(htxt);
    var nav = el("div", "luxsc-nav");
    var prev = el("button", "luxsc-btn", "←");
    prev.type = "button"; prev.setAttribute("aria-label", "Scroll the shelf back");
    var next = el("button", "luxsc-btn", "→");
    next.type = "button"; next.setAttribute("aria-label", "Scroll the shelf forward");
    nav.appendChild(prev); nav.appendChild(next);
    head.appendChild(nav);
    root.appendChild(head);

    var track = el("div", "luxsc-track");
    track.tabIndex = 0;
    track.setAttribute("aria-label", "Products, in number order");
    var tiles = LUX_PRODUCTS.map(function (p) {
      var t = buildTile(p, base, hereSlug);
      track.appendChild(t);
      return t;
    });
    root.appendChild(track);
    mount.appendChild(root);

    /* ---------- gentle auto-roll, pausing for the visitor ---------- */
    var paused = false, userHold = false, raf = null, last = 0;
    var SPEED = 26; /* px per second — a slow drift, not a ride */
    function step(ts) {
      if (!last) last = ts;
      var dt = Math.min(64, ts - last); last = ts;
      if (!paused && !userHold && !document.hidden) {
        var max = track.scrollWidth - track.clientWidth;
        if (max > 0) {
          var x = track.scrollLeft + (SPEED * dt) / 1000;
          if (x >= max - 2) { x = 0; }
          track.scrollLeft = x;
        }
      }
      raf = requestAnimationFrame(step);
    }
    if (!reduced) raf = requestAnimationFrame(step);
    function hold() { userHold = true; }
    function release() { setTimeout(function () { userHold = false; }, 2600); }
    root.addEventListener("pointerenter", function () { paused = true; });
    root.addEventListener("pointerleave", function () { paused = false; });
    root.addEventListener("focusin", function () { paused = true; });
    root.addEventListener("focusout", function () { paused = false; });

    /* ---------- pull them along: pointer drag to scroll ---------- */
    var dragging = false, startX = 0, startL = 0, moved = 0;
    track.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true; moved = 0;
      startX = e.clientX; startL = track.scrollLeft;
      track.classList.add("dragging");
      hold();
    });
    track.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      track.scrollLeft = startL - dx;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("dragging");
      release();
    }
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    /* a real pull is not a tap: swallow the click that follows a drag */
    track.addEventListener("click", function (e) {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);
    /* keep drags from starting a native image drag */
    track.addEventListener("dragstart", function (e) { e.preventDefault(); });

    /* ---------- buttons + arrow keys ---------- */
    function page(dir) {
      hold();
      track.scrollBy({ left: dir * Math.max(320, track.clientWidth * 0.8), behavior: reduced ? "auto" : "smooth" });
      release();
    }
    prev.addEventListener("click", function () { page(-1); });
    next.addEventListener("click", function () { page(1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { page(1); e.preventDefault(); }
      if (e.key === "ArrowLeft") { page(-1); e.preventDefault(); }
    });

    /* ---------- living tiles: play a product's video only while seen ---------- */
    var videos = tiles.filter(function (t) { return t._luxVideo; }).map(function (t) { return t._luxVideo; });
    if (videos.length && "IntersectionObserver" in window && !reduced) {
      var seen = new WeakSet();
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) {
            if (!seen.has(v)) {
              seen.add(v);
              var s = v.querySelector("source[data-src]");
              if (s) { s.src = s.getAttribute("data-src"); v.load(); }
            }
            v.play().catch(function () {});
          } else {
            v.pause();
          }
        });
      }, { root: track, threshold: 0.35 });
      var stripSeen = false;
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          stripSeen = en.isIntersecting;
          videos.forEach(function (v) {
            if (stripSeen) vio.observe(v); else { vio.unobserve(v); v.pause(); }
          });
        });
      }, { threshold: 0.05 });
      sio.observe(root);
    }
  }

  function boot() {
    document.querySelectorAll("[data-luxsc]").forEach(init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
