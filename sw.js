const CACHE_NAME = "cham-cong-v2-4-6-1";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./CHAM_CONG_ICON_V2_4_6_180.png",
  "./CHAM_CONG_ICON_V2_4_6_192.png",
  "./CHAM_CONG_ICON_V2_4_6_512.png"
];

self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_FILES))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {

  // HTML launcher ưu tiên lấy bản mới từ mạng
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, copy));

          return response;
        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
