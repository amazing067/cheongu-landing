// 킬스위치 서비스워커.
//
// 2025-11-03 ~ 11-04 사이에 캐시 우선(cache-first) 방식의 sw.js 를 잠깐 올렸다가 지웠다.
// 파일을 지워도 이미 브라우저에 등록된 워커는 사라지지 않는다. 그 워커는 같은 오리진의
// 모든 GET(HTML 문서 포함)을 영구 캐시에 넣고 캐시부터 내주기 때문에, 그때 방문했던
// 사용자는 배포를 해도 계속 옛 화면을 본다 (강력 새로고침 Ctrl+Shift+R 로만 갱신됨).
//
// 그래서 "아무것도 안 하고 스스로를 해제하는" 워커를 같은 경로에 다시 올린다.
// 브라우저는 방문할 때 sw.js 갱신 여부를 확인하는데, 그때 이 파일로 교체되고
// 아래 activate 에서 캐시를 전부 지운 뒤 스스로 등록을 해제한다.
//
// ⚠️ 지우지 말 것. 지우면 남아 있는 옛 워커가 다시 되살아나는 게 아니라,
//    아직 정리되지 않은 사용자가 영원히 옛 화면에 갇힌다.
// ⚠️ fetch 핸들러를 넣지 말 것. 없어야 브라우저가 네트워크로 직접 간다.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // 옛 워커가 쌓아둔 캐시를 전부 삭제
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      // 등록 해제
      await self.registration.unregister();

      // 열려 있는 탭을 새로고침해서 바로 최신 화면으로
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url);
    })()
  );
});
