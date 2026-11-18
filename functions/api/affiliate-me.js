// ailux.ca — the affiliate dashboard data door
// Route: /api/affiliate-me
//   GET  (Authorization: Bearer <session token>)  -> the affiliate's own record
//   POST { action: "logout" } (same header)       -> close the session
//
// The session token was minted by /api/affiliate-login; only its SHA-256
// hash is a KV key, so a stolen list of sessions hands out nothing usable.
// The answer is built ONLY from the signed-in affiliate's own records:
// their affiliate record, their stats record (true zeros until real sales
// exist — figures are read, never dressed up), and the spin deals recorded
// under their own email. No other affiliate's data is ever read into it.

const ARTICLES = {
  "patch": ["The Patch", "The stranger who was not a stranger"],
  "seamguard": ["SeamGuard", "The leak was in the join"],
  "school-in-a-box": ["School in a Box", "The school the wires never reached"],
  "spending-power": ["Spending Power", "A company card in a machine’s hand"],
  "verified-payments": ["Verified Payments", "The invoice that looked exactly right"],
  "receipt-book": ["Receipt Book", "Show me exactly what happened"],
  "identity-gate": ["Identity Gate", "Which agent did this"],
  "behaviour-watch": ["Behaviour Watch", "Your own agent, at three in the morning"],
  "chargeback-packs": ["Chargeback Packs", "The goods are gone, then the money goes too"],
  "front-door": ["Front Door", "Let the good agents in"],
  "caller-identity": ["Caller Identity", "The key that never dies"],
  "fleet-identity": ["Fleet Identity", "A broadcast is not a proof"],
  "verified-escrow": ["Verified Escrow", "Strangers hiring strangers"],
  "customer-id-card": ["Customer ID Card", "The card on the counter"],
  "ward-door": ["WardDoor", "The ward full of strangers"],
  "home-ward": ["HomeWard", "The reading that travelled alone"],
  "steady-home": ["SteadyHome", "When the pendant calls"],
  "steady-hand": ["SteadyHand", "One login for the crown-jewel machine"],
  "play-check": ["PlayCheck", "The toy that answers to a parent"],
  "machine-book": ["MachineBook", "Who touched this machine"],
  "line-seam": ["LineSeam", "Who told this cell to do that?"],
  "aisle-cross": ["AisleCross", "Five makers in one warehouse"],
  "field-door": ["FieldDoor", "The record the farmer can hold"],
  "tap-check": ["TapCheck", "A door worthy of the water supply"],
  "tower-check": ["TowerCheck", "Your building obeys anyone who asks"],
  "depot-check": ["DepotCheck", "The depot where every name is known"],
  "ground-door": ["GroundDoor", "The modem that learned to say no"],
  "plug-check": ["PlugCheck", "Give yours a name at birth"],
  "fleet-door": ["FleetDoor", "The attacks arrive at the crossings"]
};

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

async function sessionAffiliate(context) {
  const env = context.env || {};
  if (!env.JOIN_LIST) return { error: json({ ok: false, error: "the door is not set up yet" }, 502) };
  const auth = context.request.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { error: json({ ok: false, error: "no session — open the door first" }, 401) };
  const sessionKey = "affiliate-session:" + (await sha256hex(token));
  const rawSession = await env.JOIN_LIST.get(sessionKey);
  if (!rawSession) return { error: json({ ok: false, error: "that session has closed — open the door again" }, 401) };
  let session;
  try { session = JSON.parse(rawSession); } catch (e) { return { error: json({ ok: false, error: "that session has closed — open the door again" }, 401) }; }
  const raw = await env.JOIN_LIST.get("affiliate-record:" + session.affId);
  if (!raw) return { error: json({ ok: false, error: "that session has closed — open the door again" }, 401) };
  const rec = JSON.parse(raw);
  if (rec.status !== "approved") return { error: json({ ok: false, error: "this door is closed — write to patch@ailux.ca and we will sort it out" }, 403) };
  return { env: env, sessionKey: sessionKey, rec: rec };
}

export async function onRequestGet(context) {
  const s = await sessionAffiliate(context);
  if (s.error) return s.error;
  const env = s.env, rec = s.rec;

  let stats = { clicks: 0, referrals: 0, salesCount: 0, earnedCents: 0, currency: "US$", sales: [] };
  try {
    const rawStats = await env.JOIN_LIST.get("affiliate-stats:" + rec.id);
    if (rawStats) stats = Object.assign(stats, JSON.parse(rawStats));
  } catch (e) { /* zeros stand */ }

  const deals = [];
  try {
    const listed = await env.JOIN_LIST.list({ prefix: "spin:deal:", limit: 1000 });
    for (const k of listed.keys) {
      const raw = await env.JOIN_LIST.get(k.name);
      if (!raw) continue;
      try {
        const d = JSON.parse(raw);
        if (String(d.email || "").toLowerCase() !== rec.email) continue;
        const meta = ARTICLES[d.slug] || [d.slug, ""];
        deals.push({
          slug: d.slug, product: meta[0], story: meta[1],
          position: d.position, round: d.round, when: d.when,
          articleUrl: "https://ailux.ca/articles/" + d.slug + "/",
          kitUrl: "https://ailux.ca/affiliates/kit/" + d.slug + "/",
        });
      } catch (e) { /* skip unreadable */ }
    }
  } catch (e) { /* deals list is best-effort */ }
  deals.sort((a, b) => (a.when < b.when ? 1 : -1));

  return json({
    ok: true,
    affiliate: {
      id: rec.id, keyId: rec.keyId, name: rec.name, email: rec.email,
      issuedAt: rec.issuedAt, refCode: rec.refCode, refLink: rec.refLink,
    },
    terms: "20% of the profit on every settled payment your customers make — for as long as they stay.",
    stats: stats,
    deals: deals,
  });
}

export async function onRequestPost(context) {
  let b = {};
  try { b = await context.request.json(); } catch (e) { /* empty body is fine for GET-shaped calls */ }
  if (b && b.action === "logout") {
    const env = context.env || {};
    const auth = context.request.headers.get("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (token && env.JOIN_LIST) {
      try { await env.JOIN_LIST.delete("affiliate-session:" + (await sha256hex(token))); } catch (e) { /* best-effort */ }
    }
    return json({ ok: true, loggedOut: true });
  }
  return onRequestGet(context);
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ ok: false, error: "GET or POST" }, 405);
}
