// service-worker.js - v8.1 (Smart Search + Mobile)
const CACHE_VERSION = 'cre8web-v8.1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  // HTML
  '/',
  '/index.html',
  '/ai.html',
  '/osint.html',
  '/projects.html',
  '/news.html',
  '/misc.html',
  '/offline.html',

  // CSS
  '/css/index-layout.css',
  '/css/index-theme.css',
  '/css/news.css',
  '/css/mobile.css',
  '/css/smart-search.css',

  // JavaScript
  '/js/helpers.js',
  '/js/favorites.js',
  '/js/tools.js',
  '/js/news.js',
  '/js/page-init.js',
  '/js/page-render.js',
  '/js/index.js',
  '/js/components.js',
  '/js/error-handler.js',
  '/js/smart-search.js',

  // Data - CRITICAL for offline mode!
  '/data/links_sections_index.json',
  '/data/links_sections_ai.json',
  '/data/links_sections_osint.json',
  '/data/links_sections_projects.json',
  '/data/links_sections_news.json',
  '/data/links_sections_misc.json',

  // Assets
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Max cache sizes
const MAX_DYNAMIC_ITEMS = 50;
const MAX_IMAGE_ITEMS = 100;

// ============================================
// Install Event
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// Activate Event
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys.filter(key => key !== STATIC_CACHE && 
                             key !== DYNAMIC_CACHE && 
                             key !== IMAGE_CACHE)
              .map(key => {
                console.log('[SW] Removing old cache:', key);
                return caches.delete(key);
              })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================
// Fetch Event - Intelligent Caching Strategy
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external API calls (except favicons)
  if (url.origin !== location.origin && !url.href.includes('favicons')) {
    return;
  }
  
  // Different strategies for different resource types
  if (request.destination === 'image' || url.href.includes('favicons')) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE, MAX_IMAGE_ITEMS));
  } else if (url.pathname.endsWith('.json')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
});

// ============================================
// Cache First Strategy
// ============================================
async function cacheFirstStrategy(request, cacheName, maxItems = null) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const clonedResponse = response.clone();
      cache.put(request, clonedResponse);
      
      // Limit cache size if specified
      if (maxItems) {
        limitCacheSize(cacheName, maxItems);
      }
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return caches.match('/offline.html') || new Response('Offline');
  }
}

// ============================================
// Network First Strategy
// ============================================
async function networkFirstStrategy(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      limitCacheSize(cacheName, MAX_DYNAMIC_ITEMS);
    }
    
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline');
    }
    
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// ============================================
// Limit Cache Size
// ============================================
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    // Remove oldest items
    const itemsToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(itemsToDelete.map(key => cache.delete(key)));
    console.log(`[SW] Trimmed ${cacheName} cache to ${maxItems} items`);
  }
}

// ============================================
// Background Sync
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncFavorites() {
  try {
    // Placeholder for future cloud sync
    console.log('[SW] Syncing favorites...');
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// ============================================
// Push Notifications
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Cre8Web OSINT Hub';
  const options = {
    body: data.body || 'Ny oppdatering tilgjengelig',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Åpne' },
      { action: 'close', title: 'Lukk' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================
// Notification Click
// ============================================
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  
  notification.close();
  
  if (action === 'open') {
    event.waitUntil(
      clients.openWindow(notification.data || '/')
    );
  }
});

// ============================================
// Message Handler
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys()
        .then(keys => Promise.all(keys.map(key => caches.delete(key))))
        .then(() => console.log('[SW] All caches cleared'))
    );
  }
});

console.log('[SW] Service Worker loaded successfully');