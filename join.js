// ailux.ca — "Join our adventure" guest-book endpoint (Cloudflare Pages Function)
// Route: POST /api/join  (form fields: name, email, choice=Films|Automation|Both)
// Each signup is emailed to hello@ailux.ca (Cloudflare Email Routing forwards it
// to the house inbox — the inbox is the list we own). Sending uses MailChannels'
// free-for-Cloudflare-Pages integration. If MailChannels ever refuses the send,
// this endpoint returns 502 and the page offers the hello@ailux.ca fallback.
// Honeypot: the hidden "company" field must stay empty.

const TO = "hello@ailux.ca";
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

  if (trap) return json({ ok: true }); // bot trap — pretend success, send nothing

  name = String(name).trim().slice(0, 80);
  email = String(email).trim().slice(0, 120);
  choice = CHOICES.includes(choice) ? choice : "Both";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "name and a valid email are required" }, 400);
  }

  const when = new Date().toISOString();
  const text =
    "A new guest joined the adventure at ailux.ca\n\n" +
    "Name:   " + name + "\n" +
    "Email:  " + email + "\n" +
    "Here for: " + choice + "\n" +
    "When:   " + when + "\n";

  const mc = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: TO }], reply_to: { email: email, name: name } }],
      from: FROM,
      subject: "Join our adventure — " + name + " (" + choice + ")",
      content: [{ type: "text/plain", value: text }],
    }),
  });

  if (!mc.ok) {
    return json({ ok: false, error: "mail send failed", status: mc.status }, 502);
  }
  return json({ ok: true });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "POST only" }, 405);
}
