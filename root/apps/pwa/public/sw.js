const CACHE_NAME = "krishi-hedge-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first strategy for API calls, cache-first for static assets
  if (event.request.url.includes('/api/') || event.request.url.includes('/_next/data/')) {
    // Always fetch fresh for API and data requests
    event.respondWith(fetch(event.request));
  } else if (event.request.destination === 'image' || event.request.destination === 'style' || event.request.destination === 'script') {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(response => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  } else {
    // Network-first for everything else
    event.respondWith(fetch(event.request));
  }
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Krishi Hedge";
  const options = {
    body: data.body || data.message || "You have a new notification",
    icon: "/icon.png",
    badge: "/icon.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "notification",
    requireInteraction: data.requireInteraction || false,
    data: {
      url: data.url || "/notifications",
      ...data.metadata
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || "/notifications";
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
