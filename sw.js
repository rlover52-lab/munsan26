// 학급 페이지 첫 화면을 휴대폰에 저장해 두어 켜자마자 바로 보이게 함
const CACHE = 'classpage-shell-v1';
const SHELL = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // 구글(학급 소식 내용)은 저장하지 않고 항상 새로 받음
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  // 저장해 둔 첫 화면을 바로 주고, 뒤에서 새 버전으로 바꿔 둠
  e.respondWith(
    caches.open(CACHE).then((cache) => {
      const key = req.mode === 'navigate' ? '/index.html' : req;
      return cache.match(key).then((cached) => {
        const fresh = fetch(req).then((res) => {
          if (res && res.ok) cache.put(key, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fresh;
      });
    })
  );
});
