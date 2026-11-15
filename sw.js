/* Guarda los archivos de la app para que abra rápido y funcione sin internet.
   Para publicar una versión nueva, basta con cambiar el número de VERSION. */
var VERSION = 'v1';
var CACHE = 'horario-dental-' + VERSION;
var ARCHIVOS = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icono-192.png', 'icono-512.png', 'icono-mascara-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Archivos de la app: primero la red (para recibir mejoras) y, sin conexión, la copia guardada.
   Los datos del horario no pasan por aquí: los maneja la app. */
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).then(function (r) {
    var copia = r.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copia); });
    return r;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
  }));
});
