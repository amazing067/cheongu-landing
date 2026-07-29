"use client";

import { useCallback, useState } from "react";
import { MailingAddressModal } from "@/components/MailingAddressModal";

function openPopup(url: string, w = 980, h = 720) {
  const y = Math.max(
    0,
    (typeof window !== "undefined" ? window.outerHeight : 720) - h
  );
  const x = Math.max(
    0,
    (typeof window !== "undefined" ? window.outerWidth : 980) - w
  );
  return window.open(
    url,
    "_blank",
    `popup=yes,scrollbars=yes,resizable=yes,width=${w},height=${h},left=${x},top=${y}`
  );
}

// 도구 페이지는 원래 <button onClick={window.open}> 이었는데, 그러면 크롤러가 따라갈
// 링크가 없어서 검색엔진이 도구 페이지들을 홈과 연결하지 못했다.
// 실제 <a href> 로 두고 평범한 좌클릭만 가로채 팝업으로 띄운다 —
// 사용자 경험은 그대로, 크롤러·새탭열기·링크복사는 정상 동작.
function usePopupLink(url: string, w?: number, h?: number) {
  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // 새 탭/새 창 열기(Ctrl·Cmd·Shift·중클릭)는 브라우저 기본 동작에 맡긴다.
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }
      const win = openPopup(url, w, h);
      // 팝업이 차단되면 막지 않고 그냥 링크로 이동시킨다.
      if (win) e.preventDefault();
    },
    [url, w, h]
  );
}

export function Hero({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  const [toolsOpen, setToolsOpen] = useState(false);

  const handleOpSurgery = usePopupLink("/tools/op-surgery-codes.html", 980, 720);
  const handleTertiary = usePopupLink(
    "/tools/tertiary-hospitals.html",
    980,
    720
  );
  const handleHistory = usePopupLink("/tools/history.html", 1200, 820);
  const handleCareHospitals = usePopupLink(
    "/tools/care-hospitals.html",
    1200,
    820
  );
  const scrollToCarriers = useCallback(() => {
    document
      .getElementById("loss")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="hero-wrap">
      <section className="maxw hero-mobile pt-8 pb-6 text-center">
        <h1 className="hero-h1">
          보험사별 청구 정보, <span className="bl">한 곳에 다 모았어요</span> 🩺
        </h1>
        <p className="hero-p">
          전산·서류·청구서 PDF·고객센터·인콜·FAX까지 — 클릭 없이 한눈에.
        </p>

        <div className="searchbar">
          <span className="ic" aria-hidden>
            🔍
          </span>
          <input
            id="q"
            type="search"
            placeholder="보험사명·키워드 검색 (예: 삼성, 현대, PDF)"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") scrollToCarriers();
            }}
          />
          <button type="button" className="sb-btn" onClick={scrollToCarriers}>
            검색
          </button>
        </div>

        {/* 모바일: 종수술분류표·실손 계산기·실손 변천사만 노출, 나머지는 더보기 */}
        <div className={`tools ${toolsOpen ? "open" : ""}`}>
          <a
            href="/tools/op-surgery-codes.html"
            onClick={handleOpSurgery}
            className="tool-pill"
          >
            <span className="em" aria-hidden>
              🔬
            </span>
            종수술분류표
          </a>
          <a href="#medcalc" className="tool-pill">
            <span className="em" aria-hidden>
              🧮
            </span>
            실손 계산기
          </a>
          <a
            href="/tools/history.html"
            onClick={handleHistory}
            className="tool-pill"
            title="실손보험 1세대~5세대 세대별 비교표"
          >
            <span className="em" aria-hidden>
              📊
            </span>
            실손 변천사
            <span className="tool-badge-new">5세대</span>
          </a>
          <a href="#calc-panels" className="tool-pill tool-extra">
            <span className="em" aria-hidden>
              🎂
            </span>
            보험나이 계산기
          </a>
          <a
            href="https://www.e-insmarket.or.kr/mins/minsInsCal.knia"
            target="_blank"
            rel="noopener noreferrer"
            className="tool-pill tool-extra"
          >
            <span className="em" aria-hidden>
              🔁
            </span>
            계약전환 간편계산기
          </a>
          <a
            href="/tools/tertiary-hospitals.html"
            onClick={handleTertiary}
            className="tool-pill tool-extra"
          >
            <span className="em" aria-hidden>
              🏥
            </span>
            상급종합병원
          </a>
          <a
            href="/tools/care-hospitals.html"
            onClick={handleCareHospitals}
            className="tool-pill tool-extra"
          >
            <span className="em" aria-hidden>
              🏨
            </span>
            간호간병 병원
          </a>
          <MailingAddressModal className="tool-extra" />
          <button
            type="button"
            className="tool-pill tool-more"
            onClick={() => setToolsOpen((v) => !v)}
          >
            <span className="em" aria-hidden>
              {toolsOpen ? "➖" : "➕"}
            </span>
            {toolsOpen ? "접기" : "더보기"}
          </button>
        </div>
      </section>
    </div>
  );
}
