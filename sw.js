/* علم ينتفع به service worker — cache-first للواجهة + ذاكرة بيانات للعمل بدون إنترنت.
   البيانات المحفوظة (نصوص القرآن والتلاوات والحديث والخطوط) ثابتة وموثوقة،
   فتُحفظ على الجهاز وتُقرأ منه عند غياب الشبكة — التطبيق يفتح ويعمل بدون إنترنت.
   شبكة فقط دائمًا: Pollinations / Gemini (googleapis.com) / YouTube / googlevideo. */
const CACHE = 'dar-quran-v17'; // BUMP ON EVERY SHELL RELEASE — browsers only reinstall the SW when sw.js itself changes; a stale CACHE serves the old app forever.
const DATA = 'dar-quran-data-v1'; // ذاكرة البيانات (قرآن/صوت/حديث/خطوط)
const SHELL = ['index.html', 'privacy.html', 'style.css', 'app.js', 'quran.js', 'journey.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'logo-a.webp', 'logo-b.webp', 'sponsors.json', 'data/manners.json', 'data/review.json'];
const DATA_HOSTS = ['api.alquran.cloud', 'cdn.islamic.network', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const NETWORK_ONLY = ['pollinations.ai', 'googleapis.com', 'youtube', 'googlevideo.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE && k !== DATA).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (NETWORK_ONLY.some(h => url.hostname.includes(h))) return; // network only
  if (DATA_HOSTS.some(h => url.hostname.includes(h))) {
    // بيانات ثابتة موثوقة: اقرأ من الذاكرة أولًا، وحدّثها في الخلفية من الشبكة
    e.respondWith(caches.open(DATA).then(c => c.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => { if (res && res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
