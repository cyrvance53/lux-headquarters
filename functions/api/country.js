// Country Switch — country read (Vance's design, 2026-11-18; built 2026-11-19).
// Returns the visitor's country as Cloudflare sees it, the same rails the
// language switch rides. The display layer (assets/country-switch.js) uses it
// to show the visitor their price in their dollars. No data is stored.
export async function onRequest(context) {
  const cf = context.request.cf || {};
  const country =
    cf.country || context.request.headers.get("CF-IPCountry") || "";
  return new Response(JSON.stringify({ country: country }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
