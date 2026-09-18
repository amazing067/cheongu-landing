/**
 * 낡은 화면 자동 복구.
 *
 * 왜 필요한가
 *   서버는 모든 HTML 에 Cache-Control: max-age=0, must-revalidate 를 보낸다.
 *   "매번 서버에 물어보고 가져가라"는 뜻인데, 카카오톡·네이버 인앱 브라우저와
 *   오래된 안드로이드 웹뷰는 이 지시를 제대로 지키지 않는다. 그래서 배포를 해도
 *   "안 바뀌었다"는 문의가 계속 들어왔다. 서버 헤더로는 더 할 수 있는 게 없다.
 *
 * 어떻게 고치나
 *   페이지에는 만들어질 때의 버전이 새겨져 있다(window.__BUILD_V__).
 *   여기서 /data/version.json 을 캐시 무시하고 받아 서버의 최신 버전과 견준다.
 *   다르면 그 화면은 낡은 것이다.
 *
 *   1차 — 같은 주소를 fetch(cache:'reload') 로 한 번 받아 브라우저의 캐시
 *         항목 자체를 새 것으로 갈아끼운 뒤 새로고침한다. 주소는 건드리지 않는다.
 *         (처음엔 ?_v= 를 붙였는데 Next 하이드레이션이 주소를 되돌려 놓아
 *          주소창에 ?_v= 가 그대로 남았다.)
 *   2차 — 그래도 낡으면(캐시가 더 고집스러운 경우) 더 새로고침하지 않고
 *         위에 띠를 띄워 사용자가 직접 누르게 한다.
 *         띠의 버튼은 마지막 수단이라 ?_v= 를 붙여 확실히 비껴간다.
 *
 * ★ 무한 새로고침이 제일 무서운 사고다. sessionStorage 로 버전당 한 번만 돌게
 *   잠갔고, 실패하면 반드시 띠로 빠진다. 이 잠금을 풀지 말 것.
 */
(function () {
  "use strict";

  var BAKED = window.__BUILD_V__;
  // 자리표시자가 안 바뀐 채로 올라왔거나(빌드 누락) 값이 없으면 아무것도 하지 않는다
  if (!BAKED || BAKED === "%%BUILD_V%%") return;

  // 크롤러는 건드리지 않는다. 리다이렉트가 색인에 끼면 손해다
  if (/bot|crawl|spider|slurp|yeti|daum|facebookexternalhit/i.test(navigator.userAgent)) return;

  var KEY = "cheongu_reloaded_for";

  function ss(op, val) {
    try {
      return op === "get" ? sessionStorage.getItem(KEY) : sessionStorage.setItem(KEY, val);
    } catch (e) {
      return null; // 사생활 보호 모드 등
    }
  }

  function banner(serverV) {
    if (document.getElementById("fresh-banner")) return;
    var el = document.createElement("div");
    el.id = "fresh-banner";
    el.setAttribute("role", "status");
    el.innerHTML =
      '<span class="fb-t">새로운 정보가 있습니다. 지금 보시는 화면은 예전 것입니다.</span>' +
      '<button type="button" class="fb-b">새로고침</button>' +
      '<button type="button" class="fb-x" aria-label="닫기">&times;</button>';
    var css = document.createElement("style");
    css.textContent =
      "#fresh-banner{position:fixed;left:0;right:0;top:0;z-index:2147483000;display:flex;" +
      "align-items:center;gap:10px;padding:11px 14px;background:#fff7ec;" +
      "border-bottom:3px solid #f09018;box-shadow:0 2px 10px rgba(0,0,0,.08);" +
      "font-family:'Pretendard Variable',Pretendard,-apple-system,system-ui,sans-serif;" +
      "font-size:14px;color:#1c1917;animation:fb-in .25s ease-out}" +
      "@keyframes fb-in{from{transform:translateY(-100%)}to{transform:translateY(0)}}" +
      "#fresh-banner .fb-t{flex:1;min-width:0;font-weight:700;line-height:1.5}" +
      "#fresh-banner .fb-b{flex:none;border:0;border-radius:8px;background:#e0342a;color:#fff;" +
      "font-weight:800;font-size:13.5px;padding:9px 15px;cursor:pointer;font-family:inherit}" +
      "#fresh-banner .fb-x{flex:none;border:0;background:transparent;color:#a8a29e;" +
      "font-size:22px;line-height:1;padding:2px 6px;cursor:pointer}" +
      "@media(max-width:520px){#fresh-banner{font-size:13px;padding:10px 12px;gap:8px}" +
      "#fresh-banner .fb-b{padding:8px 12px;font-size:13px}}";
    document.head.appendChild(css);
    document.body.appendChild(el);

    el.querySelector(".fb-b").addEventListener("click", function () {
      ss("set", serverV); // 눌렀는데도 낡으면 다시 띠로 온다
      var u = new URL(location.href);
      u.searchParams.set("_v", serverV);
      location.replace(u.toString());
    });
    el.querySelector(".fb-x").addEventListener("click", function () {
      el.remove();
    });
  }

  /**
   * 주소를 그대로 두고 캐시만 갈아끼운다.
   * fetch(cache:'reload') 는 네트워크에서 새로 받아 HTTP 캐시 항목을 덮어쓴다.
   * 그 뒤 새로고침하면 브라우저가 방금 받은 새 것을 읽는다.
   */
  function hardReload() {
    var done = false;
    function go() {
      if (done) return;
      done = true;
      location.reload();
    }
    setTimeout(go, 2500); // 네트워크가 느려도 마냥 기다리지 않는다
    try {
      fetch(location.href, { cache: "reload", credentials: "same-origin" })
        .then(go)
        .catch(go);
    } catch (e) {
      go();
    }
  }

  function check() {
    fetch("/data/version.json", { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (j) {
        if (!j || !j.v || j.v === BAKED) return; // 최신이면 끝
        var serverV = String(j.v);

        // 이 버전으로 이미 한 번 다시 불렀는데도 낡다 = 캐시가 더 고집스럽다
        if (ss("get") === serverV) {
          banner(serverV);
          return;
        }
        ss("set", serverV);
        hardReload();
      })
      .catch(function () {
        /* 네트워크가 안 되면 그냥 둔다 */
      });
  }

  // 주소에 남은 ?_v= 는 지운다. 공유되거나 색인에 들어가면 안 된다
  try {
    var cur = new URL(location.href);
    if (cur.searchParams.has("_v")) {
      cur.searchParams.delete("_v");
      history.replaceState(null, "", cur.pathname + (cur.search || "") + cur.hash);
    }
  } catch (e) {}

  if (document.readyState === "complete") check();
  else window.addEventListener("load", check);
})();
