const VERSION = "v3";
const SHELL_CACHE = `w2w-shell-${VERSION}`;
const IMAGE_CACHE = `w2w-images-${VERSION}`;
const PUBLIC_DATA_CACHE = `w2w-public-data-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const MAX_IMAGE_ENTRIES = 160;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll([
      OFFLINE_URL,
      "/manifest.json",
      "/icon.svg",
      "/icon-192x192.png",
      "/icon-512x512.png",
    ])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  const currentCaches = new Set([SHELL_CACHE, IMAGE_CACHE, PUBLIC_DATA_CACHE]);
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name.startsWith("w2w-") && !currentCaches.has(name)).map((name) => caches.delete(name)),
    )).then(() => self.clients.claim()),
  );
});

async function fetchWithTimeout(request, timeout = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(request, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
  return response;
}

async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > limit) {
    await Promise.all(keys.slice(0, keys.length - limit).map((key) => cache.delete(key)));
  }
}

async function networkFirst(request, cacheName, fallbackUrl = null) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetchWithTimeout(request);
    if (response.ok && (response.type === "basic" || response.type === "cors")) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) return (await cache.match(fallbackUrl)) || Response.error();
    return Response.json({ error: "Offline and no cached copy is available" }, { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName, event) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetchWithTimeout(request).then(async (response) => {
    if (response.ok && (response.type === "basic" || response.type === "cors")) {
      await cache.put(request, response.clone());
    }
    return response;
  });
  if (cached) {
    event.waitUntil(refresh.catch(() => {}));
    return cached;
  }
  return refresh;
}

function isPublicMovieData(requestUrl) {
  const path = requestUrl.searchParams.get("path") || "";
  return requestUrl.searchParams.get("collection") !== "1"
    ? /^movies\/[^/]+(?:\/(?:localizations|providers)\/[^/]+)?$/.test(path)
    : path === "movies" || /^movies\/[^/]+\/(?:localizations|providers)$/.test(path);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname === "/api/data" && isPublicMovieData(url)) {
    event.respondWith(staleWhileRevalidate(request, PUBLIC_DATA_CACHE, event));
    return;
  }

  if (url.hostname === "image.tmdb.org") {
    event.respondWith(cacheFirst(request, IMAGE_CACHE).then((response) => {
      void trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES);
      return response;
    }));
    return;
  }

  if (url.hostname === "api.themoviedb.org") {
    event.respondWith(staleWhileRevalidate(request, PUBLIC_DATA_CACHE, event));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/manifest.json" || url.pathname.startsWith("/icon-")) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL_CACHE, OFFLINE_URL));
  }
});
