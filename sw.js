// sw.js
const CACHE_NAME = 'cheongu-v2';
const ASSETS = [
  '/',                // 시작 페이지
  '/assets/site.css', // 실제 경로로 교체
  // 필요하면 JS도 추가: '/assets/app.js'
];

// 설치: 기본 자산 캐싱
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

// 활성화: 이전 캐시 정리
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// 요청 가로채기: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        // 동일 오리진 GET만 캐시
        if (new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      })
    )
  );
});
