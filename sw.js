/* BATCOMPUTER simple offline cache */
const CACHE = "batcomputer-cache-v2";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon.svg","./sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : Promise.resolve())));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match("./index.html");
      try {
        const fresh = await fetch(req);
        cache.put("./index.html", fresh.clone());
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (req.method === "GET" && new URL(req.url).origin === self.location.origin) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});
