const CACHE = 'oduu-v2';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // YouTube thumbnails — network first, cache fallback
  if (url.hostname.includes('ytimg.com')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // App shell — cache first
  if (SHELL.includes(url.pathname) || url.pathname.endsWith('.js') || url.pathname.endsWith('.json')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const net = fetch(e.request).then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        });
        return cached || net;
      })
    );
    return;
  }

  // Default network
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
