// The Sniff Test v1 — behaviour scoring at the door of ailux.ca.
// Design note: ~/workspace/home-base/sniff-test-design-2026-11-20.md
// (Vance's build order, 2026-11-20; warning before the zap; stealth mode.)
//
// Doctrine, in code:
//  - Defence only, on our own ground. The zap closes OUR door; nothing
//    reaches back into anyone else's systems.
//  - Behaviour only. The score reads how a knock behaves — never religion,
//    nationality, language, or identity. No list of peoples or places.
//  - Warning before the zap: the grey zone (45–79) is told it has been seen
//    and scored, and a person is given a door through. Clear attackers
//    (payloads, trap doors, doors that do not exist) go straight to the zap.
//  - Stealth mode: watch-tier and tarpit responses carry no special header
//    and no special words. A decoy looks like any dead end.
//  - Fail OPEN: any error in this file returns the untouched site. A broken
//    guard must never become a closed door for a real visitor.

const TRAP_PREFIX = "/trap-door";

// Doors this site does not have. A knock on any of them is a scanner's
// checklist, never a lost visitor. (/.well-known/ is exempted before this
// list is consulted — researchers and platforms knock there honestly.)
const PROBE_MARKERS = [
  "/.env", "/.git", "/.aws", "/.svn", "/.hg", "/.ds_store", "/.bash_history",
  "/wp-admin", "/wp-login", "/wp-content", "/wp-includes", "/xmlrpc.php",
  "/phpmyadmin", "/pma/", "/myadmin", "/admin.php", "/config.php",
  "/configuration.php", "/actuator", "/vendor/phpunit", "/phpinfo",
  "/info.php", "/shell.php", "/cmd.php", "/eval.php", "/id_rsa",
  "/server-status", "/solr/", "/console/", "/manager/html", "/owa/",
  "/autodiscover", "/.dockerenv", "/docker-compose", "/backup.zip",
  "/backup.tar", "/backup.sql", "/db.sql", "/dump.sql",
];

const EXPLOIT_PATTERNS = [
  /\.\.[\/\\]/,                 // ../ or ..\ traversal
  /\/etc\/passwd/,              // unix password file
  /\/proc\/self/,               // proc self-read
  /union[\s+%]+select/,         // SQL injection shape
  /<\s*script/,                 // script tag in the knock itself
  /;\s*(cat|ls|wget|curl|bash|sh)\b/, // shell command tail
  /\$\{[^}]*\}/,                // template-injection shape
  /%00/,                        // null byte
];

const SCANNER_UA = [
  "sqlmap", "nikto", "masscan", "zgrab", "nmap", "hydra", "dirbuster",
  "gobuster", "wfuzz", "nuclei", "acunetix", "nessus", "openvas",
  "wpscan", "joomscan", "havij",
];

const SCRIPT_UA = [
  "curl/", "wget/", "python-requests", "python-urllib", "go-http-client",
  "libwww-perl", "okhttp", "axios/", "node-fetch", "java/",
];

const WARN_AT = 45;
const ZAP_AT = 80;
const TARPIT_MS = 9000;
const ZAP_DELAY_MS = 1500;
const PASS_PARAM = "lux-watch-pass";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scoreKnock(request, url) {
  const signals = [];
  let score = 0;
  const path = url.pathname.toLowerCase();
  const rawTarget = (url.pathname + url.search).toLowerCase();
  let decodedTarget = rawTarget;
  try {
    decodedTarget = decodeURIComponent(rawTarget);
  } catch (e) {
    /* malformed encoding is itself a shape; the raw checks still apply */
  }
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const method = request.method.toUpperCase();

  // The trap door: exists only to be knocked on wrongly.
  if (path.startsWith(TRAP_PREFIX)) {
    signals.push("honeypot");
    score += 100;
  }

  // Probe paths — skipped for the honest /.well-known/ corridor.
  if (!path.startsWith("/.well-known/")) {
    for (const marker of PROBE_MARKERS) {
      if (path.includes(marker)) {
        signals.push("probe-path");
        score += 85;
        break;
      }
    }
  }

  // Exploit payloads, read on both the raw and decoded knock.
  for (const pattern of EXPLOIT_PATTERNS) {
    if (pattern.test(rawTarget) || pattern.test(decodedTarget)) {
      signals.push("exploit-pattern");
      score += 90;
      break;
    }
  }

  if (ua) {
    for (const tool of SCANNER_UA) {
      if (ua.includes(tool)) {
        signals.push("scanner-ua");
        score += 40;
        break;
      }
    }
    if (score === 0 || !signals.includes("scanner-ua")) {
      for (const client of SCRIPT_UA) {
        if (ua.includes(client)) {
          signals.push("script-client");
          score += 10;
          break;
        }
      }
    }
  } else {
    signals.push("no-user-agent");
    score += 15;
  }

  // Real visitors read pages; they do not POST to them. The house's own
  // /api/ roads take POSTs by design and are exempt from this signal.
  if (
    method !== "GET" &&
    method !== "HEAD" &&
    method !== "OPTIONS" &&
    !path.startsWith("/api/")
  ) {
    signals.push("write-to-static");
    score += 25;
  }

  if (url.search.length > 2000) {
    signals.push("long-query");
    score += 20;
  }

  return { score, signals };
}

function evidence(request, url, scored, action) {
  const cf = request.cf || {};
  const record = {
    ts: new Date().toISOString(),
    colo: cf.colo || "",
    country: cf.country || "",
    asn: cf.asn || 0,
    method: request.method.toUpperCase(),
    path: url.pathname,
    score: scored.score,
    signals: scored.signals,
    action: action,
    ua: (request.headers.get("user-agent") || "").slice(0, 120),
  };
  // The full query is evidence only when the knock carried a payload to
  // the zap tier; a grey-zone person's odd link is not ours to keep.
  if (action === "zap-block" || action === "zap-tarpit") {
    record.query = url.search.slice(0, 500);
  }
  console.log("SNIFF " + JSON.stringify(record));
}

function warningPage(url) {
  const clean = new URL(url.toString());
  clean.searchParams.set(PASS_PARAM, "1");
  const html =
    "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>This door is watched — Lux Automations</title></head>" +
    "<body style=\"font-family:Georgia,serif;background:#f7f3ea;color:#22301f;" +
    "margin:0;padding:3rem 1.25rem;\"><main style=\"max-width:34rem;margin:0 auto;\">" +
    "<h1 style=\"font-size:1.6rem;\">This door is watched.</h1>" +
    "<p>Your knock has been seen and scored — nothing personal. The watch " +
    "reads behaviour, not people, and this knock behaved unusually.</p>" +
    "<p>If you're a person, come on through:</p>" +
    "<p><a href=\"" + clean.toString() + "\" style=\"display:inline-block;" +
    "background:#22301f;color:#f7f3ea;padding:.8rem 1.4rem;border-radius:.6rem;" +
    "text-decoration:none;\">Continue to the page you asked for &rarr;</a></p>" +
    "<p>If you're a machine, you already know.</p>" +
    "<p style=\"color:#5a6a58;\">— Lux Automations · Edmonton</p>" +
    "</main></body></html>";
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function onRequest(context) {
  try {
    const request = context.request;
    const url = new URL(request.url);
    const scored = scoreKnock(request, url);

    if (scored.score === 0) {
      return context.next();
    }

    const isTrapOrProbe =
      scored.signals.includes("honeypot") ||
      scored.signals.includes("probe-path");

    // Stealth tarpit: a trap or a door that does not exist answers slowly
    // and ordinarily — a dull 404, no header, nothing learned.
    if (isTrapOrProbe) {
      evidence(request, url, scored, "zap-tarpit");
      await sleep(TARPIT_MS);
      return new Response("404 Not Found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (scored.score >= ZAP_AT) {
      evidence(request, url, scored, "zap-block");
      await sleep(ZAP_DELAY_MS);
      return new Response("403 — This door is closed.", {
        status: 403,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "x-lux-sniff": "zap;score=" + scored.score,
        },
      });
    }

    // The one-time pass from a warning page: honoured below the zap tier,
    // and logged like everything else.
    if (url.searchParams.get(PASS_PARAM) === "1") {
      evidence(request, url, scored, "warn-pass");
      return context.next();
    }

    if (scored.score >= WARN_AT) {
      const downstream = await context.next();
      if (downstream.status === 404) {
        // A fake path gets an ordinary 404 — we do not teach the map.
        evidence(request, url, scored, "watch-404");
        return downstream;
      }
      evidence(request, url, scored, "warn");
      const page = warningPage(url);
      page.headers.set("x-lux-sniff", "warn;score=" + scored.score);
      return page;
    }

    // Watch tier: passes through, silently logged. Stealth — the response
    // is the site's own, untouched.
    evidence(request, url, scored, "watch");
    return context.next();
  } catch (err) {
    // Fail open. A broken guard never becomes a closed door.
    try {
      return await context.next();
    } catch (err2) {
      return new Response("Service unavailable", { status: 503 });
    }
  }
}
