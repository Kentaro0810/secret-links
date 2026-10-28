const CACHE_NAME = "secretlinks-pwa-v241";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css?v=241",
  "./script.js?v=241",
  "./manifest.webmanifest?v=241",
  "./offline.html",
  "./icons/icon-192.png?v=241",
  "./icons/icon-512.png?v=241"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const results = await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
      results.forEach((result, index) => {
        if (result.status === "rejected") console.warn("Precache failed:", APP_SHELL[index]);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("secretlinks-pwa-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy)));
        }
        return response;
      }).catch(async () => (
        await caches.match("./index.html") || await caches.match("./offline.html")
      ))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
