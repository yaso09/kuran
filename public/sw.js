self.addEventListener('push', function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            console.log('[Service Worker] Push Received:', data);

            const options = {
                body: data.body,
                icon: data.icon || '/icons/icon-192x192.png',
                badge: data.badge || '/icons/icon-192x192.png',
                vibrate: [100, 50, 100],
                data: {
                    url: data.url || '/',
                    dateOfArrival: Date.now(),
                    primaryKey: 1
                },
                actions: [
                    {
                        action: 'explore',
                        title: 'Görüntüle',
                    },
                ]
            };

            event.waitUntil(
                self.registration.showNotification(data.title, options)
                    .then(() => console.log('[Service Worker] Notification shown'))
                    .catch(err => console.error('[Service Worker] Notification error:', err))
            );
        } catch (err) {
            console.error('[Service Worker] Error processing push event:', err);
        }
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// Basic caching logic for PWA
const CACHE_NAME = 'quran-cache-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/offline',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline');
                }
            });
        })
    );
});
