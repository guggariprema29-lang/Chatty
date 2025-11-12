// Service worker previously handled push events. The push/notification feature
// was removed; this file intentionally left as a no-op placeholder so older
// clients won't 404 when attempting to fetch /sw.js.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
