/* World Cup 2026 PWA service worker */
const VERSION = 'wc26-v5';
const STATIC = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // API calls: network only — the app has its own error handling and we
  // never want to serve stale scores from a cache.
  if (url.hostname.endsWith('espn.com')) return;

  // App shell (same-origin): network-first so updates land immediately,
  // cache fallback so the shell opens offline. cache:'no-cache' forces
  // revalidation past the HTTP cache (GitHub Pages max-age=600), otherwise
  // "network-first" can still serve a stale shell for up to 10 minutes.
  // Cross-origin subresources (team flags on espncdn) must NOT revalidate —
  // default HTTP caching keeps them instant.
  const sameOrigin = url.origin === self.location.origin;
  e.respondWith(
    fetch(e.request, sameOrigin ? { cache: 'no-cache' } : undefined)
      .then(res => {
        if (res.ok && url.origin === self.location.origin) {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then(hit => hit ||
          (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
      )
  );
});
