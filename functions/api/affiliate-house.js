// ailux.ca — affiliate HOUSE desk (approval + key issuance)
// Route: POST /api/affiliate-house  (JSON: { code, action, ... })
//
// This is the house side of the affiliate door — NOT a public page and not
// linked from the site. Every call must carry the house issuance code; only
// its SHA-256 hash lives in KV ("house:affiliate-gate"). The code itself is
// kept in the house's own access file, never in this repo.
//
// Actions:
//   seed    — one-time: set the gate from the first code presented. Refused
//             forever once a gate exists. (Bootstrap: the crew seeds within
//             moments of deploy; after that this action is inert.)
//   list    — every affiliate application on record, with approval status.
//   approve — { email } approve the latest application for that email: mint
//             the affiliate number (AFF-####) and a personal door key in the
//             house pattern (key id KEY-AFF-####; the key itself is 20
//             characters from an unambiguous alphabet, ~99 bits, stored ONLY
//             as a SHA-256 hash), open their stats record at true zeros, and
//             return the ready-to-send issuance note. NOTHING is sent — the
//             house delivers the note personally, as the affiliates page
//             promises.
//   revoke  — { affId } close an affiliate's door (record kept, key dead).
//   rotate  — { newCode } replace the house issuance code.
//
// KV layout (namespace bound as JOIN_LIST, shared with join/affiliate/spin):
//   affiliate:<when>:<email>            applications (written by /api/affiliate)
//   affiliate-record:<AFF-ID>           the approved affiliate's record
//   affiliate-index:by-email:<email>    -> AFF-ID
//   affiliate-index:by-ref:<refcode>    -> AFF-ID
//   affiliate-stats:<AFF-ID>            clicks / referrals / sales / earnings
//   affiliate:counter                   next affiliate number
//   house:affiliate-gate                SHA-256 hex of the issuance code

const KEY_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no I, L, O, 0, 1

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json" },
  });
}

async function sha256hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function sameHash(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function mintKey() {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < 20; i++) {
    if (i > 0 && i % 5 === 0) out += "-";
    out += KEY_ALPHABET[bytes[i] % KEY_ALPHABET.length];
  }
  return out;
}

function pad4(n) { return String(n).padStart(4, "0"); }

function issuanceNote(rec, key) {
  return (
    "Subject: Your affiliate key and link — Lux Automations\n\n" +
    "Hello " + rec.name + ",\n\n" +
    "Good news — your affiliate application is approved, and your door is ready.\n\n" +
    "Your affiliate number: " + rec.id + "\n" +
    "Your key: " + key + "\n" +
    "Your door: https://ailux.ca/affiliates/dashboard/\n" +
    "Your link: " + rec.refLink + "\n\n" +
    "Open your door with the email you applied with (" + rec.email + ") and your key. " +
    "Keep the key private — it opens your dashboard, and your dashboard shows only your own record.\n\n" +
    "Your link works site-wide: the same code rides on any page, so " +
    "https://ailux.ca/patch/?ref=" + rec.refCode + " sends your people straight to the Patch with your mark on it. " +
    "Your dashboard holds your link, the articles the spinner has dealt you, and your numbers: " +
    "you earn 20% of the profit on every payment your customers make, on settled payments, for as long as they stay. " +
    "Every sale under your link is recorded by receipt. Earnings begin when the doors open on January 1, 2027.\n\n" +
    "Welcome aboard.\n\n" +
    "— Lucian, for Lux Automations\n"
  );
}

export async function onRequestPost(context) {
  const env = context.env || {};
  if (!env.JOIN_LIST) return json({ ok: false, error: "the house desk is not set up yet" }, 502);

  let b;
  try { b = await context.request.json(); } catch (e) { return json({ ok: false, error: "unreadable request" }, 400); }
  const code = String(b.code || "");
  const action = String(b.action || "");
  const gate = await env.JOIN_LIST.get("house:affiliate-gate");

  // One-time bootstrap: the first code presented becomes the gate.
  if (action === "seed") {
    if (gate) return json({ ok: false, error: "the gate is already set" }, 409);
    if (code.length < 24) return json({ ok: false, error: "the house code must be at least 24 characters" }, 400);
    await env.JOIN_LIST.put("house:affiliate-gate", await sha256hex(code));
    return json({ ok: true, seeded: true });
  }

  if (!gate) return json({ ok: false, error: "the house desk is not open yet" }, 503);
  if (!sameHash(await sha256hex(code), gate)) return json({ ok: false, error: "that code does not open the house desk" }, 403);

  if (action === "rotate") {
    const next = String(b.newCode || "");
    if (next.length < 24) return json({ ok: false, error: "the new house code must be at least 24 characters" }, 400);
    await env.JOIN_LIST.put("house:affiliate-gate", await sha256hex(next));
    return json({ ok: true, rotated: true });
  }

  if (action === "list") {
    const listed = await env.JOIN_LIST.list({ prefix: "affiliate:", limit: 1000 });
    const apps = [];
    for (const k of listed.keys) {
      if (!/^affiliate:\d{4}-/.test(k.name)) continue; // applications only, not records/indexes
      const raw = await env.JOIN_LIST.get(k.name);
      if (!raw) continue;
      try {
        const r = JSON.parse(raw);
        if (r.kind !== "affiliate") continue;
        apps.push({ key: k.name, name: r.name, email: r.email, where: r.where, note: r.note || "", when: r.when, approved: r.approved || null });
      } catch (e) { /* skip unreadable */ }
    }
    apps.sort((x, y) => (x.when < y.when ? -1 : 1));
    return json({ ok: true, applications: apps });
  }

  if (action === "approve") {
    const email = String(b.email || "").trim().toLowerCase();
    if (!email) return json({ ok: false, error: "an email is required" }, 400);

    const existing = await env.JOIN_LIST.get("affiliate-index:by-email:" + email);
    if (existing) return json({ ok: false, error: "that email already holds " + existing, affId: existing }, 409);

    // Find the latest unapproved application for this email.
    const listed = await env.JOIN_LIST.list({ prefix: "affiliate:", limit: 1000 });
    let appKey = null, app = null;
    for (const k of listed.keys) {
      if (!/^affiliate:\d{4}-/.test(k.name)) continue;
      const raw = await env.JOIN_LIST.get(k.name);
      if (!raw) continue;
      try {
        const r = JSON.parse(raw);
        if (r.kind === "affiliate" && String(r.email || "").toLowerCase() === email && !r.approved) {
          if (!app || r.when > app.when) { app = r; appKey = k.name; }
        }
      } catch (e) { /* skip unreadable */ }
    }
    if (!app) return json({ ok: false, error: "no waiting application for that email" }, 404);

    const rawCounter = await env.JOIN_LIST.get("affiliate:counter");
    const n = (rawCounter ? (parseInt(rawCounter, 10) || 0) : 0) + 1;
    const affId = "AFF-" + pad4(n);
    const keyId = "KEY-AFF-" + pad4(n);
    const refCode = "aff" + pad4(n);
    const key = mintKey();
    const when = new Date().toISOString();
    const rec = {
      kind: "affiliate-record", id: affId, keyId: keyId,
      name: app.name, email: email, where: app.where || "",
      status: "approved", keyHash: await sha256hex(key),
      refCode: refCode, refLink: "https://ailux.ca/?ref=" + refCode,
      issuedAt: when, applicationKey: appKey,
    };
    await env.JOIN_LIST.put("affiliate:counter", String(n));
    await env.JOIN_LIST.put("affiliate-record:" + affId, JSON.stringify(rec));
    await env.JOIN_LIST.put("affiliate-index:by-email:" + email, affId);
    await env.JOIN_LIST.put("affiliate-index:by-ref:" + refCode, affId);
    await env.JOIN_LIST.put("affiliate-stats:" + affId, JSON.stringify({
      clicks: 0, referrals: 0, salesCount: 0, earnedCents: 0, currency: "US$", sales: [],
    }));
    app.approved = affId; app.approvedAt = when;
    await env.JOIN_LIST.put(appKey, JSON.stringify(app));

    return json({
      ok: true, affId: affId, keyId: keyId, key: key, refCode: refCode, refLink: rec.refLink,
      note: issuanceNote(rec, key),
      warning: "The key is shown ONCE, here. Deliver the note personally; it is not stored anywhere in plain text.",
    });
  }

  if (action === "revoke") {
    const affId = String(b.affId || "").trim().toUpperCase();
    const raw = affId ? await env.JOIN_LIST.get("affiliate-record:" + affId) : null;
    if (!raw) return json({ ok: false, error: "no such affiliate" }, 404);
    const rec = JSON.parse(raw);
    rec.status = "revoked"; rec.revokedAt = new Date().toISOString();
    await env.JOIN_LIST.put("affiliate-record:" + affId, JSON.stringify(rec));
    return json({ ok: true, revoked: affId });
  }

  return json({ ok: false, error: "unknown action" }, 400);
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "POST only" }, 405);
}
