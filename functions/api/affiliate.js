// ailux.ca — affiliate application endpoint (Cloudflare Pages Function)
// Route: POST /api/affiliate  (fields: name, email, where, note; honeypot: company)
//
// Built on the same pattern as /api/join (the guest book): two legs, both
// inside our own Cloudflare account.
//   1. DURABLE: every application is written first to the KV namespace bound
//      as JOIN_LIST, under an "affiliate:" key — the house reads applications
//      from KV. If mail ever fails, the application is still captured.
//   2. NOTIFY: a ping is sent with Cloudflare Email Service's send_email
//      binding (env.EMAIL) to the verified destination inbox.
// Required Pages bindings (already in place for /api/join):
//   KV namespace:  JOIN_LIST  -> namespace "lux-join-list"
//   Send email:    EMAIL      -> destination cyrvance53@gmail.com
// The endpoint answers ok:true when the application is captured by either
// leg, and 502 only when both legs failed (the page then offers email).
// Honeypot: the hidden "company" field must stay empty.

const TO = "cyrvance53@gmail.com"; // verified destination = the inbox hello@ailux.ca routes to
const FROM = { email: "guestbook@ailux.ca", name: "ailux.ca affiliates" };

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env || {};
  let name = "", email = "", where = "", note = "", trap = "";
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await req.json();
      name = b.name || ""; email = b.email || ""; where = b.where || ""; note = b.note || ""; trap = b.company || "";
    } else {
      const f = await req.formData();
      name = f.get("name") || ""; email = f.get("email") || ""; where = f.get("where") || ""; note = f.get("note") || ""; trap = f.get("company") || "";
    }
  } catch (e) {
    return json({ ok: false, error: "unreadable form" }, 400);
  }

  if (trap) return json({ ok: true }); // bot trap — pretend success, store nothing

  name = String(name).trim().slice(0, 80);
  email = String(email).trim().slice(0, 120);
  where = String(where).trim().slice(0, 300);
  note = String(note).trim().slice(0, 500);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "your name and a valid email are required" }, 400);
  }
  if (!where) {
    return json({ ok: false, error: "tell us where you will share — your pages, groups, channel or newsletter" }, 400);
  }

  const when = new Date().toISOString();
  const record = { kind: "affiliate", name: name, email: email, where: where, note: note, when: when, mailed: false };
  const key = "affiliate:" + when + ":" + email;
  const text =
    "A new affiliate application at ailux.ca\n\n" +
    "Name:   " + name + "\n" +
    "Email:  " + email + "\n" +
    "Where they will share: " + where + "\n" +
    "Note:   " + (note || "(none)") + "\n" +
    "When:   " + when + "\n";

  // Leg 1 — durable store in our own KV (the list we own).
  let stored = false;
  if (env.JOIN_LIST) {
    try {
      await env.JOIN_LIST.put(key, JSON.stringify(record));
      stored = true;
    } catch (e) {
      console.error("affiliate: KV put failed", e);
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
        subject: "Affiliate application — " + name,
        text: text,
      });
      mailed = true;
    } catch (e) {
      console.error("affiliate: email send failed", e);
    }
  }
  if (mailed && stored) {
    record.mailed = true;
    try { await env.JOIN_LIST.put(key, JSON.stringify(record)); } catch (e) { /* stamp is best-effort */ }
  }

  if (!stored && !mailed) {
    return json({ ok: false, error: "your application could not be captured just now", stored: stored, mailed: mailed }, 502);
  }
  return json({ ok: true, stored: stored, mailed: mailed });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "POST only" }, 405);
}
