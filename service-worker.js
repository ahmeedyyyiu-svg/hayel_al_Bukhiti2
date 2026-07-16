// عامل خدمة (Service Worker) بسيط: يخزّن ملفات التطبيق مؤقتًا حتى تعمل
// الواجهة بدون إنترنت بعد أول زيارة/تثبيت (تثبيت PWA من المتصفح، بانتظار
// بناء الـ APK الفعلي عبر Capacitor لاحقًا خارج Replit).
const CACHE_NAME = "sms-manager-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/storage.js",
  "/csvParser.js",
  "/smsBridge.js",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// استراتيجية: النسخة المخزّنة محليًا أولًا دائمًا (بدون أي محاولة اتصال
// بالإنترنت)، ولا نلجأ للشبكة إلا إذا كان الملف غير موجود في الذاكرة
// المؤقتة أصلًا (مثل أول تحميل قبل التثبيت).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
