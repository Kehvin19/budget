// Permet à l'app de fonctionner sans connexion.
// Quand tu modifies l'app, change le numéro de version ci-dessous
// (et le ?v= dans index.html).
const CACHE = 'budget-v8';
const FICHIERS = ['./', './index.html', './style.css', './app.js', './manifest.json',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour avoir la dernière version), sinon la copie hors ligne
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }) // toujours vérifier s'il y a une nouvelle version
      .then(res => {
        if (res.ok) { const copie = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copie)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(r => r || caches.match('./index.html')))
  );
});
