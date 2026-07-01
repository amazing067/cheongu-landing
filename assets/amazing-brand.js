/**
 * 어메이징사업부 공통 브랜딩 주입 스크립트
 * ------------------------------------------------------------
 * 청구닷컴 도구 페이지(tools/*.html)에 미니 헤더 + 하단 크레딧을
 * 자동으로 그려 넣는다. 각 페이지엔 아래 한 줄만 추가하면 된다:
 *   <script src="/assets/amazing-brand.js" defer></script>
 *
 * - 스타일은 amzb- 접두사로 격리되어 페이지 기존 CSS와 충돌하지 않는다.
 * - 상단 고정 헤더를 넣고, body에 그만큼 여백을 준다.
 * - 페이지에 이미 있던 "상단 고정 바"(예: 검색바)는 헤더 높이만큼
 *   자동으로 아래로 밀어준다. (전체화면 모달 오버레이는 건드리지 않음)
 * 문구/로고/색을 바꾸려면 이 파일만 고치면 8곳 전부 반영된다.
 */
(function () {
  "use strict";
  if (window.__amzbInjected) return;
  window.__amzbInjected = true;

  var HOME = "/"; // 헤더 로고 클릭 → 청구닷컴 홈 (추후 회사 소개 페이지로 변경 가능)
  var MARK = "/icons/amazing-mark.png";
  var FOUNDED = 2020; // 청구닷컴 제작 연도 (저작권 표기 연도)

  // 저작권 연도: 창립연도(2020)만 표기
  function copyrightYears() {
    return String(FOUNDED);
  }

  function cleanTitle() {
    var t = (document.title || "").trim();
    // " - 청구닷컴", " | 청구닷컴" 등 접미사 정리
    t = t.replace(/\s*[|\-·]\s*청구닷컴.*$/i, "").trim();
    // 제목 끝의 개발용 괄호 주석 정리 (예: "... (links.json 연동)")
    t = t.replace(/\s*\([^)]*\)\s*$/, "").trim();
    return t || "청구닷컴";
  }

  function injectStyle() {
    var css =
      "" +
      ".amzb-header,.amzb-footer{font-family:'Pretendard',system-ui,-apple-system,'Segoe UI','Noto Sans KR',sans-serif;box-sizing:border-box}" +
      ".amzb-header{position:fixed;top:0;left:0;right:0;z-index:2147483000;display:flex;align-items:center;gap:8px;" +
      "padding:7px 16px;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);" +
      "border-bottom:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(2,6,23,.04)}" +
      ".amzb-brand{display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit}" +
      ".amzb-brand img{height:22px;width:auto;display:block}" +
      ".amzb-word{font-size:13px;font-weight:900;letter-spacing:.02em;color:#e0342a}" +
      ".amzb-sub{font-size:11px;font-weight:700;color:#94a3b8;border-left:1px solid #e2e8f0;padding-left:8px}" +
      ".amzb-tool{margin-left:auto;font-size:12px;font-weight:700;color:#94a3b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}" +
      ".amzb-footer{position:fixed;left:0;right:0;bottom:0;z-index:2147482999;" +
      "display:flex;align-items:center;justify-content:center;gap:7px;padding:8px 16px;" +
      "background:rgba(250,251,252,.97);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);" +
      "border-top:1px solid #e2e8f0}" +
      ".amzb-footer img{height:15px;width:auto;opacity:.85;display:block}" +
      ".amzb-footer span{font-size:11px;font-weight:700;color:#64748b}" +
      "@media(max-width:640px){.amzb-sub{display:none}.amzb-tool{max-width:38%}}";
    var s = document.createElement("style");
    s.id = "amzb-style";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function buildHeader() {
    var h = document.createElement("div");
    h.className = "amzb-header";
    h.innerHTML =
      '<a class="amzb-brand" href="' +
      HOME +
      '" title="청구닷컴 홈 · 제작 프라임에셋 어메이징사업부">' +
      '<img src="' +
      MARK +
      '" alt="AMAZING">' +
      '<span class="amzb-word">AMAZING</span>' +
      '<span class="amzb-sub">프라임에셋 어메이징사업부</span>' +
      "</a>" +
      '<span class="amzb-tool"></span>';
    h.querySelector(".amzb-tool").textContent = cleanTitle();
    return h;
  }

  function buildFooter() {
    var f = document.createElement("div");
    f.className = "amzb-footer";
    f.innerHTML =
      '<img src="' + MARK + '" alt="">' +
      "<span>프라임에셋 어메이징사업부 · 청구닷컴 © " + copyrightYears() + "</span>";
    return f;
  }

  /** 페이지에 원래 있던 상단 고정 바를 헤더 높이만큼 아래로 민다. */
  function pushDownExistingFixedBars(offset) {
    var all = document.body.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.classList && el.classList.contains("amzb-header")) continue;
      var cs = window.getComputedStyle(el);
      if (cs.position !== "fixed") continue;
      var top = cs.top;
      var bottom = cs.bottom;
      // 상단(top:0 근처)에 붙은 "바"만 대상. 전체화면 오버레이(bottom도 0)는 제외.
      var topPx = parseFloat(top);
      if (isNaN(topPx) || topPx > 4) continue;
      if (bottom !== "auto" && parseFloat(bottom) <= 4) continue; // inset:0 모달 제외
      el.style.top = offset + "px";
    }
  }

  function run() {
    injectStyle();
    var header = buildHeader();
    var footer = buildFooter();
    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(footer);

    // 레이아웃 반영 후 높이 측정 → 상·하단 고정바 높이만큼 body 여백 확보
    // (헤더·푸터 모두 fixed라 body가 flex/grid든 무관하게 항상 제자리)
    requestAnimationFrame(function () {
      var ht = header.offsetHeight || 40;
      var ft = footer.offsetHeight || 34;
      var cs = window.getComputedStyle(document.body);
      var top = parseFloat(cs.paddingTop) || 0;
      var bot = parseFloat(cs.paddingBottom) || 0;
      document.body.style.paddingTop = top + ht + "px";
      document.body.style.paddingBottom = bot + ft + "px";
      pushDownExistingFixedBars(ht);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
