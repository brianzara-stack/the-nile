// ═══════════════════════════════════════════════
// THE NILE — Service Worker
// Caches shell for offline, network-first for data
// ═══════════════════════════════════════════════

const CACHE = 'nile-v1';
const SHELL = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600;1,700&family=IM+Fell+English:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css',
];

// Install — cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for shell, network-first for API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never intercept Supabase or Listen Notes API calls
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('listennotes.com') ||
      url.hostname.includes('googleapis.com') ||
      e.request.method !== 'GET') {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache fonts and static assets
        if (url.hostname.includes('gstatic.com') ||
            url.hostname.includes('jsdelivr.net') ||
            url.pathname.match(/\.(css|js|html|woff2?)$/)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback — return cached index
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
