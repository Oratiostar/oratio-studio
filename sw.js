/* Oratio Place – Service Worker (Offline-Funktion). Bei Änderungen VERSION erhöhen. */
const VERSION = 'oratio-52';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'logo-place.png', '404.html',
  'werkzeuge/glass.css', 'werkzeuge/glass.js', 'werkzeuge/wz.css', 'werkzeuge/wz.js', 'werkzeuge/fr.js',
  'fonts/Inter-Regular.woff', 'fonts/Inter-SemiBold.woff', 'fonts/Inter-Bold.woff', 'fonts/Poppins-Bold.woff'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  const statisch = /\.(png|jpe?g|webp|gif|svg|woff2?|wasm|ico|mp3|ogg)$/i.test(u.pathname) || u.pathname.includes('/lib/');
  if (statisch) {
    e.respondWith(caches.match(r).then(c => c || fetch(r).then(n => {
      if (n.ok) { const k = n.clone(); caches.open(VERSION).then(x => x.put(r, k)); }
      return n;
    })));
  } else {
    e.respondWith(fetch(r).then(n => {
      if (n.ok) { const k = n.clone(); caches.open(VERSION).then(x => x.put(r, k)); }
      return n;
    }).catch(() => caches.match(r, {ignoreSearch: false}).then(c => c || caches.match(r, {ignoreSearch: true})).then(c => c || (r.mode === 'navigate' ? caches.match('404.html') : Response.error()))));
  }
});
