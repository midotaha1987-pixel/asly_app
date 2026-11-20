/* Lyra service worker — cache-first for the app shell only.
   API calls (Pollinations / Gemini) are never cached. */
const CACHE = 'lyra-v3';
const SHELL = ['index.html', 'style.css', 'app.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon.svg', 'featured.json', 'featured-1.jpg', 'featured-2.jpg', 'featured-3.jpg', 'sponsors.json', 'prompts.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isApi = url.hostname.includes('pollinations.ai') || url.hostname.includes('googleapis.com');
  if (isApi || e.request.method !== 'GET') return; // network only for APIs
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
