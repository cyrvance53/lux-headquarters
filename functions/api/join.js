// ailux.ca — "Join our adventure" guest-book endpoint (Cloudflare Pages Function)
// Route: POST /api/join  (form fields: name, email, choice=Films|Automation|Both)
//
// FIX (2026-11-05): the original version sent through MailChannels' free
// Cloudflare integration. MailChannels ended that free service on 2024-06-30
// (their own end-of-life notice), so the unauthenticated send API now refuses
// every call — that was the "guest book wouldn't open" failure. No DNS record
// revives it; sending through MailChannels now requires their paid account.
//
// This version stays inside our own Cloudflare account, in two legs:
//   1. DURABLE (the list is ours): every signup is written first to a KV
//      namespace bound as JOIN_LIST. If mail ever fails, the signup is still
//      captured and recoverable from KV — nothing is lost.
//   2. NOTIFY: the ping is sent with Cloudflare Email Service's send_email
//      binding (env.EMAIL) — no third party, no API key. ailux.ca has Email
//      Routing configured, and Cloudflare's Email Service limits doc states
//      sends to verified destination addresses are free on any plan "including
//      when only Email Routing is configured", sending only from routing
//      domains. FROM is on our routing domain; TO is the account's verified
//      destination inbox — the exact inbox hello@ailux.ca routes to, so the
//      ping lands where hello@ delivers.
// Required Pages bindings (project Settings -> Bindings, then redeploy):
//   KV namespace:  JOIN_LIST  -> namespace "lux-join-list"
//   Send email:    EMAIL      -> destination cyrvance53@gmail.com
// The endpoint answers ok:true when the signup is captured by either leg,
// and 502 only when both legs failed (the page then offers the fallback).
// Honeypot: the hidden "company" field must stay empty.

const TO = "cyrvance53@gmail.com"; // verified destination = the inbox hello@ailux.ca routes to
const FROM = { email: "guestbook@ailux.ca", name: "ailux.ca guest book" };
const CHOICES = ["Films", "Automation", "Both"];

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
  let list = "", place = "", country = "", about = "";
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await req.json();
      name = b.name || ""; email = b.email || ""; choice = b.choice || ""; trap = b.company || "";
      list = b.list || ""; place = b.place || ""; country = b.country || ""; about = b.about || "";
    } else {
      const f = await req.formData();
      name = f.get("name") || ""; email = f.get("email") || ""; choice = f.get("choice") || ""; trap = f.get("company") || "";
      list = f.get("list") || ""; place = f.get("place") || ""; country = f.get("country") || ""; about = f.get("about") || "";
    }
  } catch (e) {
    return json({ ok: false, error: "unreadable form" }, 400);
  }

  if (trap) return json({ ok: true }); // bot trap — pretend success, store nothing

  name = String(name).trim().slice(0, 80);
  email = String(email).trim().slice(0, 120);
  choice = CHOICES.includes(choice) ? choice : "Both";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "name and a valid email are required" }, 400);
  }

  // Host list (School in a Box): a place asking to receive a box.
  const isHost = String(list).trim().toLowerCase() === "host";
  place = String(place).trim().slice(0, 120);
  country = String(country).trim().slice(0, 120);
  about = String(about).trim().slice(0, 500);
  if (isHost && !place) {
    return json({ ok: false, error: "the school or community name is required" }, 400);
  }

  const when = new Date().toISOString();
  const record = isHost
    ? { kind: "host", name: name, email: email, place: place, country: country, about: about, when: when, mailed: false }
    : { name: name, email: email, choice: choice, when: when, mailed: false };
  const key = (isHost ? "host:" : "signup:") + when + ":" + email;
  const text = isHost
    ? "A place joined the School in a Box HOST LIST at ailux.ca\n\n" +
      "Contact: " + name + "\n" +
      "Email:   " + email + "\n" +
      "School / community: " + place + "\n" +
      "Country / area: " + (country || "(not given)") + "\n" +
      "About:   " + (about || "(not given)") + "\n" +
      "When:    " + when + "\n"
    : "A new guest joined the adventure at ailux.ca\n\n" +
      "Name:   " + name + "\n" +
      "Email:  " + email + "\n" +
      "Here for: " + choice + "\n" +
      "When:   " + when + "\n";

  // Leg 1 — durable store in our own KV (the list we own).
  let stored = false;
  if (env.JOIN_LIST) {
    try {
      await env.JOIN_LIST.put(key, JSON.stringify(record));
      stored = true;
    } catch (e) {
      console.error("join: KV put failed", e);
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
        subject: isHost ? "Host list — " + place : "Join our adventure — " + name + " (" + choice + ")",
        text: text,
      });
      mailed = true;
    } catch (e) {
      console.error("join: email send failed", e);
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
