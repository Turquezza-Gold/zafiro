/* Zafiro · service worker: guarda la app en el iPhone para que abra sin internet.
   Solo guarda los archivos de la app. Tus datos NO pasan por aquí: viven en localStorage. */
const CACHE = 'zafiro-v5';
const ARCHIVOS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-512.png',
  './ejemplo.json',
  './splash.jpg',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' = baja siempre la versión nueva, no una copia vieja del navegador
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Primero lo guardado (abre al instante y sin internet); se actualiza en segundo plano.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const guardado = await cache.match(req, { ignoreSearch: true }) ||
        (req.mode === 'navigate' ? await cache.match('./index.html') : undefined);
      const red = fetch(req)
        .then((resp) => {
          if (resp && resp.ok) cache.put(req, resp.clone());
          return resp;
        })
        .catch(() => guardado);
      if (guardado) {
        e.waitUntil(red.catch(() => {}));
        return guardado;
      }
      return red;
    })
  );
});
