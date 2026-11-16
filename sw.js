/* Lux — service worker (stage 1, deliberately conservative).
 *
 * Rules it lives by:
 *  - NETWORK FIRST for everything. A cached copy is only ever served when
 *    the network itself fails (offline), never instead of a live page.
 *  - Only static assets (images, fonts, the manifest, icons) are kept in
 *    the cache. HTML pages are never stored, so the till, prices and copy
 *    can never be served stale from here.
 *  - Cross-origin requests (Stripe, GTranslate, CDNs) pass straight
 *    through and are never touched.
 * Bump SW_VERSION whenever this file changes so old caches are dropped.
 */
const SW_VERSION = "lux-sw-v1";
const STATIC_CACHE = SW_VERSION + "-static";
const STATIC_DESTINATIONS = ["image", "font", "manifest"];

self.addEventListener("install", (event) => {
  // Become active promptly; there is no precache to wait on.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin

  if (STATIC_DESTINATIONS.includes(request.destination)) {
    // Static asset: network first, cache as offline backup.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Everything else (pages, scripts, styles): straight to the network.
  // No respondWith — the browser handles it exactly as if we weren't here.
});
