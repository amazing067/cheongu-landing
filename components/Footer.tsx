"use client";

import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { BrandCredit } from "@/components/BrandCredit";

export function Footer() {
  const [showContact, setShowContact] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const FOUNDED = 2020; // 청구닷컴 제작 연도
  const year = `${FOUNDED}`;
  const privacyDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <footer className="border-t border-slate-200 bg-white">
        <div className="maxw px-5 py-6 text-sm text-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>© {year} 청구닷컴</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowContact(true)}
                className="btn btn-ghost"
              >
                문의
              </button>
              <button
                onClick={() => setShowPrivacy(true)}
                className="btn btn-ghost"
              >
                개인정보처리방침
              </button>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col items-center gap-2.5">
            <BrandMark variant="full" height={40} />
            <p className="text-center text-[11px] text-slate-500 font-medium leading-relaxed">
              <a
                href="https://xn--h32b21du9cf7grcy2k20f.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-700 font-bold hover:text-slate-900 underline-offset-2 hover:underline"
              >
                프라임에셋 어메이징사업부
              </a>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="text-slate-500 font-semibold">김성민</span>
              <br />
              <span className="text-slate-400">
                이 서비스는 어메이징사업부가 기획·개발했습니다.
              </span>
              <br />
              <a
                href="https://xn--oi2b19pfvd21bx33a.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline"
              >
                함께할 보험설계사를 찾습니다 — 리쿠르팅 안내 →
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* 문의 모달 */}
      {showContact && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-5"
          onClick={() => setShowContact(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[500px] w-full max-h-[90vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-xl font-extrabold text-slate-900">
                문의하기
              </h3>
              <button
                onClick={() => setShowContact(false)}
                className="text-3xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <p className="text-slate-600 mb-5">
                궁금한 점이나 건의사항을 남겨주세요. 빠르게 답변드리겠습니다.
              </p>
              <a
                href="https://pf.kakao.com/_mSxkxgn/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center gap-2 w-full py-4 px-5 bg-[#FEE500] text-[#3C1E1E] rounded-xl font-bold text-[15px] hover:bg-[#FDD835] transition mb-6"
              >
                카카오톡으로 빠른 문의
                <span className="absolute top-2 right-3 bg-[#3C1E1E] text-[#FEE500] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  실시간 응답
                </span>
              </a>
              <p className="text-center text-slate-400 text-sm mb-4">
                또는 본 사이트 문의 양식 이용
              </p>
              <BrandCredit />
            </div>
          </div>
        </div>
      )}

      {/* 개인정보처리방침 모달 */}
      {showPrivacy && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-5"
          onClick={() => setShowPrivacy(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-[700px] w-full max-h-[90vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-xl font-extrabold text-slate-900">
                개인정보처리방침
              </h3>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-3xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] text-sm text-slate-700 leading-relaxed">
              <p className="text-slate-500 text-[13px] mb-6 pb-4 border-b border-slate-200">
                최종 수정일: {privacyDate}
              </p>
              <section className="mb-7">
                <h4 className="text-base font-bold text-slate-900 mb-3">
                  1. 개인정보의 처리 목적
                </h4>
                <p className="mb-2">
                  청구닷컴(이하 &apos;본 사이트&apos;)은 다음의 목적을 위하여
                  개인정보를 처리합니다.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>웹사이트 방문 통계 및 분석</li>
                  <li>서비스 개선 및 최적화</li>
                  <li>문의 사항 응대 및 고객 지원</li>
                </ul>
              </section>
              <section className="mb-7">
                <h4 className="text-base font-bold text-slate-900 mb-3">
                  2. 수집하는 개인정보의 항목
                </h4>
                <p className="mb-2">
                  본 사이트는 기본적으로 개인정보를 수집하지 않습니다.
                </p>
              </section>
              <section className="mb-7">
                <h4 className="text-base font-bold text-slate-900 mb-3">
                  3. 개인정보 보호책임자
                </h4>
                <p>
                  <strong>책임자:</strong> 청구닷컴 운영팀 ·{" "}
                  <strong>문의:</strong> 본 사이트 문의 양식 이용
                </p>
              </section>
              <BrandCredit />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
