const CACHE_NAME = 'orbit-khemet-v3';
const OFFLINE_URL = '/offline';
const STATIC_ASSETS = [
  '/',
  '/hub',
  '/brain',
  '/forge',
  '/pricing',
  '/khemet-logo.png',
  '/manifest.json',
  '/offline',
  '/thoren.png','/ramet.png','/nexar.png','/lyra.png','/kairo.png','/nefra.png','/horusen.png',
];

// Install — cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS.filter(url => !url.endsWith('.png') || url === '/khemet-logo.png')))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — network first for API/auth, cache first for static
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin requests
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // API routes — always network, never cache
  if (url.pathname.startsWith('/api/')) return;

  // Auth routes — always network
  if (url.pathname.startsWith('/auth')) return;

  // Static assets — cache first, fallback to network
  if (url.pathname.match(/\.(png|jpg|svg|ico|woff2|css|js)$/)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Navigation — network first, offline page fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL) || caches.match('/hub'))
    );
    return;
  }

  // Default — network first with cache fallback
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});

// Listen for skip-waiting message from client
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
