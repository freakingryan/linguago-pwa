const CACHE_NAME = 'linguago-cache-v1';
const urlsToCache = [
    '/linguago-pwa/',
    '/linguago-pwa/index.html',
    '/linguago-pwa/manifest.json',
    '/linguago-pwa/icons/icon-192x192.png',
    '/linguago-pwa/icons/icon-512x512.png',
    '/linguago-pwa/assets/index.css',
    '/linguago-pwa/assets/index.js',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache).catch(error => {
                    console.error('Cache addAll error:', error);
                    return Promise.resolve();
                });
            })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                const fetchRequest = event.request.clone();
                return fetch(fetchRequest)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    })
                    .catch(() => {
                        console.log('Fetch failed for:', event.request.url);
                        return new Response('离线模式');
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/linguago-pwa/icons/icon-192x192.png',
            badge: '/linguago-pwa/icons/icon-192x192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
}); 