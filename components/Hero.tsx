"use client";

import { useCallback } from "react";
import { MailingAddressModal } from "@/components/MailingAddressModal";

const toolPages = [
  {
    title: "간호간병 통합서비스 병원 찾기",
    url: "/tools/care-hospitals.html",
    icon: "🏥",
  },
  {
    title: "전국 상급종합병원 지도",
    url: "/tools/tertiary-hospitals.html",
    icon: "🗺️",
  },
  {
    title: "종수술분류표",
    url: "/tools/op-surgery-codes.html",
    icon: "🔬",
  },
  {
    title: "실손의료비 변천사",
    url: "/tools/history.html",
    icon: "📊",
  },
];

function openPopup(url: string, w = 980, h = 720) {
  const y = Math.max(
    0,
    (typeof window !== "undefined" ? window.outerHeight : 720) - h
  );
  const x = Math.max(
    0,
    (typeof window !== "undefined" ? window.outerWidth : 980) - w
  );
  window.open(
    url,
    "_blank",
    `popup=yes,scrollbars=yes,resizable=yes,width=${w},height=${h},left=${x},top=${y}`
  );
}

export function Hero({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  const handleOpSurgery = useCallback(
    () => openPopup("/tools/op-surgery-codes.html", 980, 720),
    []
  );
  const handleTertiary = useCallback(
    () => openPopup("/tools/tertiary-hospitals.html", 980, 720),
    []
  );
  const handleHistory = useCallback(
    () => openPopup("/tools/history.html", 1200, 820),
    []
  );
  const handleCareHospitals = useCallback(
    () => openPopup("/tools/care-hospitals.html", 1200, 820),
    []
  );

  return (
    <section className="maxw px-5 pt-2 pb-4">
      <h1 className="text-3xl sm:text-4xl font-black leading-tight text-center">
        보험금 청구 링크,
        <span
          style={{
            background:
              "linear-gradient(90deg,#d946ef,#7c3aed,#06b6d4)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          한 곳에서 바로
        </span>
      </h1>
      <p className="mt-2 text-slate-700 text-center">
        전산 접속 · 필요서류 ·{" "}
        <span className="font-semibold">보험금 청구서 PDF</span> ·{" "}
        <span className="font-semibold">치과치료확인서</span> · 고객센터 · 인콜
        모니터링 · 보험금청구 FAX
      </p>

      <div className="hero-search">
        <div className="search-card">
          <div className="search-title">검색</div>
          <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
            <input
              id="q"
              type="search"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5"
              placeholder="회사명·키워드 (예: 삼성, 고객센터, PDF)"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              id="clear"
              type="button"
              className="btn btn-ghost"
              onClick={() => setSearchQuery("")}
            >
              지우기
            </button>
            <a href="#loss" className="btn btn-ghost">
              손해부터 보기
            </a>
          </div>
          <div className="mt-2 text-xs text-slate-600">
            단축키: <span className="chip">/</span> 검색 포커스,{" "}
            <span className="chip">Esc</span> 지우기 ·{" "}
            <span className="chip">Enter</span> 첫 번째 결과로 이동
          </div>

          <div className="search-actions">
            <a href="#age" className="mini-btn mini-purple">
              보험나이 계산기
            </a>
            <a href="#medcalc" className="mini-btn mini-cyan">
              실손의료비 계산기
            </a>
            <a
              href="https://www.e-insmarket.or.kr/mins/minsInsCal.knia"
              target="_blank"
              rel="noopener noreferrer"
              className="mini-btn mini-amber"
            >
              실손 계약전환 간편계산기
            </a>
            <button
              type="button"
              onClick={handleOpSurgery}
              className="mini-btn mini-slate"
            >
              종수술분류표
            </button>
            <button
              type="button"
              onClick={handleTertiary}
              className="mini-btn mini-pink"
            >
              전국 상급종합병원 리스트
            </button>
            <button
              type="button"
              onClick={handleHistory}
              className="mini-btn mini-lime"
            >
              실손의료비 변천사
            </button>
            <button
              type="button"
              onClick={handleCareHospitals}
              className="mini-btn mini-purple"
            >
              간호간병 통합서비스 병원
            </button>
            <MailingAddressModal />
          </div>
        </div>
      </div>
    </section>
  );
}
