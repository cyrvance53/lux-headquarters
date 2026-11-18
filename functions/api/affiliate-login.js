// ailux.ca — the affiliate door (dashboard sign-in)
// Route: POST /api/affiliate-login  (JSON or form fields: email, key)
//
// An approved affiliate opens their dashboard with the email they applied
// with and the personal key the house issued them. The key is never stored
// in plain text — the record holds only its SHA-256 hash, and the check is
// a hash against a hash. Every failure — unknown email, wrong key, no
// approval, a revoked key — answers with the SAME plain words, so the door
// tells a stranger nothing about who holds a key. After 5 failed tries for
// one email the door rests for an hour (counter in KV, per submitted email,
// real or not). A pass mints a session token: 32 random bytes, only its
// hash stored in KV with a 7-day TTL; the dashboard trades the token at
// /api/affiliate-me.

const SESSION_TTL_SECONDS = 7 * 24 * 3600;
const FAIL_LIMIT = 5;
const FAIL_WINDOW_SECONDS = 3600;
const REFUSAL = "That email and key do not open this door.";

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

function b64url(bytes) {
  let s = "";
  for (const byte of bytes) s += String.fromCharCode(byte);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function onRequestPost(context) {
  const env = context.env || {};
  if (!env.JOIN_LIST) return json({ ok: false, error: "the door is not set up yet" }, 502);

  let email = "", key = "";
  const ct = context.request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await context.request.json();
      email = b.email || ""; key = b.key || "";
    } else {
      const f = await context.request.formData();
      email = f.get("email") || ""; key = f.get("key") || "";
    }
  } catch (e) {
    return json({ ok: false, error: "unreadable form" }, 400);
  }
  email = String(email).trim().toLowerCase().slice(0, 120);
  key = String(key).trim().toUpperCase().slice(0, 64);
  if (!email || !key) return json({ ok: false, error: REFUSAL }, 401);

  const failKey = "affiliate-login-fail:" + email;
  let fails = 0;
  try { fails = parseInt((await env.JOIN_LIST.get(failKey)) || "0", 10) || 0; } catch (e) { /* read failure: proceed */ }
  if (fails >= FAIL_LIMIT) {
    return json({ ok: false, error: "Too many tries — this door is resting for a while. Try again in an hour." }, 429);
  }

  const refuse = async () => {
    try {
      await env.JOIN_LIST.put(failKey, String(fails + 1), { expirationTtl: FAIL_WINDOW_SECONDS });
    } catch (e) { /* counter is best-effort */ }
    return json({ ok: false, error: REFUSAL }, 401);
  };

  const affId = await env.JOIN_LIST.get("affiliate-index:by-email:" + email);
  if (!affId) return refuse();
  const raw = await env.JOIN_LIST.get("affiliate-record:" + affId);
  if (!raw) return refuse();
  let rec;
  try { rec = JSON.parse(raw); } catch (e) { return refuse(); }
  if (rec.status !== "approved") return refuse();
  if (!sameHash(await sha256hex(key), rec.keyHash || "")) return refuse();

  // Pass. Clear the failure counter and mint the session.
  try { await env.JOIN_LIST.delete(failKey); } catch (e) { /* best-effort */ }
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = b64url(tokenBytes);
  const expires = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();
  await env.JOIN_LIST.put("affiliate-session:" + (await sha256hex(token)),
    JSON.stringify({ affId: affId, issuedAt: new Date().toISOString(), expires: expires }),
    { expirationTtl: SESSION_TTL_SECONDS });

  return json({ ok: true, token: token, affId: affId, name: rec.name, expires: expires });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "POST only" }, 405);
}
