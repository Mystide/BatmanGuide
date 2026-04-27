const APP_VERSION = "2026.04.26-1";
const CACHE = `batman-guide-cache-${APP_VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./list.js",
  "./manifest.webmanifest",
  "./batman-logo.png",
  "./assets/lettering/batmanletters1.png",
];

const NETWORK_FIRST_PATHS = new Set(["/", "/index.html", "/app.js", "/list.js", "/manifest.webmanifest", "/sw.js"]);
const SCOPE_PATH = (() => {
  try {
    const scopeUrl = self.registration && self.registration.scope ? new URL(self.registration.scope) : null;
    if (!scopeUrl) return "/";
    return scopeUrl.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "/";
  }
})();


self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(event) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(event.request);
    if (response && response.ok) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    if (event.request.mode === "navigate") {
      const fallback = await cache.match("./index.html");
      if (fallback) return fallback;
    }
    return Response.error();
  }
}

function isNetworkFirstPath(url) {
  if (url.origin !== self.location.origin) return false;

  const pathname = url.pathname;
  if (SCOPE_PATH === "/") return NETWORK_FIRST_PATHS.has(pathname);
  if (pathname === SCOPE_PATH || pathname === `${SCOPE_PATH}/`) return true;
  if (!pathname.startsWith(`${SCOPE_PATH}/`)) return false;
  const withinScope = pathname.slice(SCOPE_PATH.length);
  return NETWORK_FIRST_PATHS.has(withinScope);
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const useNetworkFirst = isNetworkFirstPath(url);

  if (useNetworkFirst) {
    event.respondWith(networkFirst(event));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          if (isSameOrigin) {
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          event.request.mode === "navigate" ? caches.match("./index.html") : Response.error()
        );
    })
  );
});
