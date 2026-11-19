// ailux.ca — affiliate article spinner endpoint (Cloudflare Pages Function)
// Route: POST /api/spin  (JSON or form fields: name, email; honeypot: company)
//
// The wheel deals Lucian's 29 articles in rotation. The counter lives in the
// same KV namespace as the guest book (binding JOIN_LIST), so consecutive
// spins deal consecutive articles — no two affiliates in the same round of 29
// are dealt the same story. Every deal is also written to KV as its own
// record (spin:deal:...) so the house can read who holds which article.
// Affiliates never write: the share words returned here are Lucian's, verbatim.

const ARTICLES = [
 {
  "slug": "patch",
  "product": "Amos",
  "story": "The stranger who was not a stranger",
  "share": "Agents are already buying, selling and settling payments while their owners sleep — and nobody on the other side can prove who they are dealing with. Lucian wrote the story, and the one question Amos answers at the door."
 },
 {
  "slug": "seamguard",
  "product": "SeamGuard",
  "story": "The leak was in the join",
  "share": "The leak was not in either agent. It was in the join between them. Lucian wrote how it happens — and the guard that now stands at every seam."
 },
 {
  "slug": "school-in-a-box",
  "product": "School in a Box",
  "story": "The school the wires never reached",
  "share": "Some classrooms are still waiting for the wires that never came. Lucian wrote about the school that travels in a box instead — no signal required."
 },
 {
  "slug": "spending-power",
  "product": "Spending Power",
  "story": "A company card in a machine’s hand",
  "share": "A company card, in a machine's hand. Lucian wrote about spending power with limits an owner can actually set — and prove."
 },
 {
  "slug": "verified-payments",
  "product": "Verified Payments",
  "story": "The invoice that looked exactly right",
  "share": "The invoice looked exactly right. It was not. Lucian wrote the story every bookkeeper should read before the next payment run."
 },
 {
  "slug": "receipt-book",
  "product": "Receipt Book",
  "story": "Show me exactly what happened",
  "share": "“Show me exactly what happened.” Lucian wrote about the receipt book that can answer that — for every action an agent takes."
 },
 {
  "slug": "identity-gate",
  "product": "Identity Gate",
  "story": "Which agent did this",
  "share": "Which agent did this? If nobody can answer, nobody is in charge. Lucian wrote about the gate where every agent's identity is on the record."
 },
 {
  "slug": "behaviour-watch",
  "product": "Behaviour Watch",
  "story": "Your own agent, at three in the morning",
  "share": "Your own agent, at three in the morning. Lucian wrote about watching what it actually does — and the switch that stops it."
 },
 {
  "slug": "chargeback-packs",
  "product": "Chargeback Packs",
  "story": "The goods are gone, then the money goes too",
  "share": "The goods are gone, then the money goes too. Lucian wrote about packing the evidence before a chargeback can take both."
 },
 {
  "slug": "front-door",
  "product": "Front Door",
  "story": "Let the good agents in",
  "share": "Let the good agents in — and only the good ones. Lucian wrote about the front door that checks who is knocking."
 },
 {
  "slug": "caller-identity",
  "product": "Caller Identity",
  "story": "The key that never dies",
  "share": "API keys get copied, leaked and live forever. Lucian wrote about caller identity that cannot be stolen out of a file."
 },
 {
  "slug": "fleet-identity",
  "product": "Fleet Identity",
  "story": "A broadcast is not a proof",
  "share": "A broadcast is not a proof. Lucian wrote about giving every machine in a fleet an identity of its own."
 },
 {
  "slug": "verified-escrow",
  "product": "Verified Escrow",
  "story": "Strangers hiring strangers",
  "share": "Strangers hiring strangers is the new normal. Lucian wrote about escrow that verifies both sides before money moves."
 },
 {
  "slug": "customer-id-card",
  "product": "Customer ID Card",
  "story": "The card on the counter",
  "share": "The card on the counter — proof a customer is who they say they are, in a form any shop can check. Lucian wrote the story."
 },
 {
  "slug": "ward-door",
  "product": "WardDoor",
  "story": "The ward full of strangers",
  "share": "A hospital ward is full of strangers — staff, systems and now agents. Lucian wrote about the door that checks every one of them."
 },
 {
  "slug": "home-ward",
  "product": "HomeWard",
  "story": "The reading that travelled alone",
  "share": "One reading, travelling alone from a home to a clinic. Lucian wrote about the guard that travels with it."
 },
 {
  "slug": "steady-home",
  "product": "SteadyHome",
  "story": "When the pendant calls",
  "share": "When the pendant calls, somebody has to be sure it is real. Lucian wrote about the home that answers carefully."
 },
 {
  "slug": "steady-hand",
  "product": "SteadyHand",
  "story": "One login for the crown-jewel machine",
  "share": "One login for the crown-jewel machine — the one that must never be borrowed. Lucian wrote about the hand that keeps it steady."
 },
 {
  "slug": "play-check",
  "product": "PlayCheck",
  "story": "The toy that answers to a parent",
  "share": "The toy that answers to a parent. Lucian wrote about connected toys that prove who they are talking to."
 },
 {
  "slug": "machine-book",
  "product": "MachineBook",
  "story": "Who touched this machine",
  "share": "Who touched this machine? Lucian wrote about the book that remembers every hand — and why Europe's new machinery law makes it urgent."
 },
 {
  "slug": "line-seam",
  "product": "LineSeam",
  "story": "Who told this cell to do that?",
  "share": "Who told this cell to do that? Lucian wrote about tracing every instruction on the line back to its source."
 },
 {
  "slug": "aisle-cross",
  "product": "AisleCross",
  "story": "Five makers in one warehouse",
  "share": "Five makers, one warehouse, machines talking across the aisle. Lucian wrote about keeping those crossings checked."
 },
 {
  "slug": "field-door",
  "product": "FieldDoor",
  "story": "The record the farmer can hold",
  "share": "The record the farmer can hold. Lucian wrote about farm machines whose work can be proven in the field, offline."
 },
 {
  "slug": "tap-check",
  "product": "TapCheck",
  "story": "A door worthy of the water supply",
  "share": "A door worthy of the water supply. Lucian wrote about checking every tap, valve and controller a city depends on."
 },
 {
  "slug": "tower-check",
  "product": "TowerCheck",
  "story": "Your building obeys anyone who asks",
  "share": "Your building obeys anyone who asks. Lucian wrote about the check that makes it ask for proof first."
 },
 {
  "slug": "depot-check",
  "product": "DepotCheck",
  "story": "The depot where every name is known",
  "share": "The depot where every name is known. Lucian wrote about fleets that check in — and strangers that cannot."
 },
 {
  "slug": "ground-door",
  "product": "GroundDoor",
  "story": "The modem that learned to say no",
  "share": "The modem that learned to say no. Lucian wrote about the ground door that refuses what it cannot verify."
 },
 {
  "slug": "plug-check",
  "product": "PlugCheck",
  "story": "Give yours a name at birth",
  "share": "Give yours a name at birth. Lucian wrote about devices that carry their identity from the factory — before Europe's cyber law asks for it."
 },
 {
  "slug": "fleet-door",
  "product": "FleetDoor",
  "story": "The attacks arrive at the crossings",
  "share": "The attacks arrive at the crossings. Lucian wrote about the door every vehicle in a fleet passes through — checked."
 }
];

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env || {};
  let name = "", email = "", trap = "";
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await req.json();
      name = b.name || ""; email = b.email || ""; trap = b.company || "";
    } else {
      const f = await req.formData();
      name = f.get("name") || ""; email = f.get("email") || ""; trap = f.get("company") || "";
    }
  } catch (e) {
    return json({ ok: false, error: "unreadable form" }, 400);
  }

  if (trap) return json({ ok: true }); // bot trap — pretend success, deal nothing

  name = String(name).trim().slice(0, 80);
  email = String(email).trim().slice(0, 120);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "your name and a valid email are required" }, 400);
  }

  if (!env.JOIN_LIST) {
    return json({ ok: false, error: "the wheel is not set up yet — write to patch@ailux.ca and we will deal you an article personally" }, 502);
  }

  let counter = 0;
  try {
    const raw = await env.JOIN_LIST.get("spin:counter");
    counter = raw ? (parseInt(raw, 10) || 0) : 0;
  } catch (e) {
    return json({ ok: false, error: "the wheel could not be read just now — try again in a moment" }, 502);
  }

  const idx = counter % ARTICLES.length;
  const a = ARTICLES[idx];
  const when = new Date().toISOString();
  const deal = {
    slug: a.slug, product: a.product, story: a.story, share: a.share,
    articleUrl: "https://ailux.ca/articles/" + a.slug + "/",
    kitUrl: "https://ailux.ca/affiliates/kit/" + a.slug + "/",
    position: idx + 1, total: ARTICLES.length, round: Math.floor(counter / ARTICLES.length) + 1,
  };
  try {
    await env.JOIN_LIST.put("spin:counter", String(counter + 1));
    await env.JOIN_LIST.put("spin:deal:" + when + ":" + email,
      JSON.stringify({ kind: "spin-deal", name: name, email: email, slug: a.slug, position: idx + 1, round: deal.round, when: when }));
  } catch (e) {
    return json({ ok: false, error: "your deal could not be recorded — try again in a moment" }, 502);
  }
  return json({ ok: true, deal: deal });
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ ok: false, error: "POST only" }, 405);
}
