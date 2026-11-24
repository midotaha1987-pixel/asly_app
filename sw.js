/* علم ينتفع به service worker — cache-first for the app shell only.
   API calls (AlQuran Cloud / jsDelivr / Pollinations / Gemini / YouTube) are never cached. */
const CACHE = 'dar-quran-v6'; // BUMP ON EVERY SHELL RELEASE — browsers only reinstall the SW when sw.js itself changes; a stale CACHE serves the old app forever.
const SHELL = ['index.html', 'style.css', 'app.js', 'quran.js', 'journey.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'logo-a.webp', 'logo-b.webp', 'sponsors.json', 'data/manners.json'];

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
  const isApi = url.hostname.includes('alquran.cloud') || url.hostname.includes('islamic.network')
    || url.hostname.includes('jsdelivr.net') || url.hostname.includes('pollinations.ai')
    || url.hostname.includes('googleapis.com') || url.hostname.includes('youtube')
    || url.hostname.includes('googlevideo.com') || url.hostname.includes('fonts.g');
  if (isApi || e.request.method !== 'GET') return; // network only for APIs
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
