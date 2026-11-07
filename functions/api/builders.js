// ailux.ca — AgentPay "Connect as a Builder" endpoint (Cloudflare Pages Function)
// Route: POST /api/builders  (form fields: name, email, choice=Wallet|PayPal|Builder API)
//
// This mirrors /api/join (functions/api/join.js) exactly in approach — the
// house join form's pattern, applied to builders who want to connect to
// AgentPay when it launches:
//   1. DURABLE: every signup is written first to the SAME KV namespace the
//      guest book uses, bound as JOIN_LIST, under a "builder:" key prefix —
//      the list stays ours and recoverable even if mail ever fails.
//   2. NOTIFY: the ping is sent with the SAME send_email binding (env.EMAIL)
//      to the same verified destination inbox hello@ailux.ca routes to.
// No new Pages bindings are required: JOIN_LIST and EMAIL are the bindings
// /api/join already needs (project Settings -> Bindings).
// The endpoint answers ok:true when the signup is captured by either leg,
// and 502 only when both legs failed (the page then offers the fallback).
// Honeypot: the hidden "company" field must stay empty.

const TO = "cyrvance53@gmail.com"; // verified destination = the inbox hello@ailux.ca routes to
const FROM = { email: "guestbook@ailux.ca", name: "ailux.ca agentpay builders" };
const CHOICES = ["Wallet", "PayPal", "Builder API"];

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env || {};
  let name = "", email = "", choice = "", trap = "";
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await req.json();
      name = b.name || ""; email = b.email || ""; choice = b.choice || ""; trap = b.company || "";
    } else {
      const f = await req.formData();
      name = f.get("name") || ""; email = f.get("email") || ""; choice = f.get("choice") || ""; trap = f.get("company") || "";
    }
  } catch (e) {
    return json({ ok: false, error: "unreadable form" }, 400);
  }

  if (trap) return json({ ok: true }); // bot trap — pretend success, store nothing

  name = String(name).trim().slice(0, 80);
  email = String(email).trim().slice(0, 120);
  choice = CHOICES.includes(choice) ? choice : "Builder API";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "name and a valid email are required" }, 400);
  }

  const when = new Date().toISOString();
  const record = { name: name, email: email, choice: choice, when: when, mailed: false, source: "agentpay-builder" };
  const key = "builder:" + when + ":" + email;
  const text =
    "A builder asked to connect to AgentPay at ailux.ca/agentpay\n\n" +
    "Name:   " + name + "\n" +
    "Email:  " + email + "\n" +
    "Connecting: " + choice + "\n" +
    "When:   " + when + "\n";

  // Leg 1 — durable store in our own KV (the list we own).
  let stored = false;
  if (env.JOIN_LIST) {
    try {
      await env.JOIN_LIST.put(key, JSON.stringify(record));
      stored = true;
    } catch (e) {
      console.error("builders: KV put failed", e);
    }
  }

  // Leg 2 — notify the house inbox via Cloudflare's send_email binding.
  let mailed = false;
  if (env.EMAIL) {
    try {
      await env.EMAIL.send({
        to: TO,
        from: FROM,
        replyTo: { email: email, name: name },
        subject: "AgentPay builder — " + name + " (" + choice + ")",
        text: text,
      });
      mailed = true;
    } catch (e) {
      console.error("builders: email send failed", e);
    }
  }
  if (mailed && stored) {
    record.mailed = true;
    try { await env.JOIN_LIST.put(key, JSON.stringify(record)); } catch (e) { /* stamp is best-effort */ }
  }

  if (!stored && !mailed) {
    return json({ ok: false, error: "signup could not be captured", stored: stored, mailed: mailed }, 502);
  }
  return json({ ok: true, stored: stored, mailed: mailed });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "POST only" }, 405);
}
