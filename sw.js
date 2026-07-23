/* World Cup 2026 PWA service worker */
const VERSION = 'wc26-v24';
const STATIC = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './data/scoreboard.json',
  './data/standings.json',
  './data/pens.json',
  './data/meta.json',
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

  // Live ESPN: network only — app falls back to ./data/* on failure.
  if (url.hostname.endsWith('espn.com')) return;

  // Same-origin (shell + archived data): network-first, cache fallback for offline.
  // cache:'no-cache' revalidates past GitHub Pages max-age so updates land quickly.
  // Cross-origin subresources (team flags on espncdn) keep default HTTP caching.
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
