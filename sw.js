const CACHE_NAME = 'kuran-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/print.min.js',
  '/Aqeeq-Bold.ttf',
  '/StackSansNotch-Bold.ttf',
  '/alshohadaa.ttf'
  // İstersen JSON dosyalarını veya CSS/ikonları da ekle
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
