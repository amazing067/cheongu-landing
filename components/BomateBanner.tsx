"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * 보메이트 체험단 모집 안내 — 홈 상단 띠(top)와 푸터 위 얇은 카드(slim).
 *
 * 대상은 보험설계사만이다(일반인 불가). 신청은 /bomate 로 보낸다.
 * 상단 띠는 보메이트 카드뉴스와 같은 남색·연두를 쓴다(2026-11-16 사장님이 B2 로 정함).
 * 청구닷컴 기본 규칙(어두운 배경 금지)의 예외다.
 *
 * 남은 날은 방문한 날짜(한국 시간)로 자동 계산한다(2026-11-18 사장님 1안).
 * 마감일(11월 27일)이 지나면 두 컴포넌트는 스스로 사라진다. 코드를 지우는 건 그 뒤에 해도 된다.
 * "12일"은 체험 기간(11월 16일~27일) 전체 길이라 고정이다.
 */
const END_DATE = "2026-11-27"; // 이 날 끝까지 신청 가능(한국 시간)
const END_LABEL = "11월 27일까지";

/** 한국 시간 기준 오늘부터 마감일까지 남은 날. 오늘이 마감일이면 0, 지났으면 음수 */
function daysLeft(): number {
  const kst = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
  const day = 24 * 3600 * 1000;
  return Math.round((Date.parse(END_DATE) - Date.parse(kst)) / day);
}

/** 서버 렌더와 어긋나지 않게 화면이 뜬 뒤에 계산한다. null 이면 아직 계산 전 */
function useDaysLeft(): number | null {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => setN(daysLeft()), []);
  return n;
}

function leftText(n: number | null): string {
  if (n === null) return END_LABEL;
  if (n === 0) return `${END_LABEL} · 오늘 마감`;
  return `${END_LABEL} · ${n}일 남음`;
}

export function BomateBar() {
  const n = useDaysLeft();
  if (n !== null && n < 0) return null;
  return (
    <section className="maxw bm-bar" aria-label="보메이트 체험단 모집">
      <div className="bm-bar-in">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/bomate/icon.png" alt="보메이트 앱 아이콘" width={38} height={38} />
        <span className="bm-bar-tx">
          <span className="a">보험설계사 대상</span>
          <em>보메이트 12일 무료 체험단 모집</em>
        </span>
        <span className="bm-bar-dt">{leftText(n)}</span>
        <Link href="/bomate?from=bar" className="bm-bar-btn">
          체험단 신청
        </Link>
      </div>
    </section>
  );
}

export function BomateSlim() {
  const n = useDaysLeft();
  if (n !== null && n < 0) return null;
  return (
    <section className="maxw" aria-label="보메이트 체험단 신청 안내">
      <div className="bm-slim">
        <div className="bm-slim-l">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/bomate/icon.png" alt="" width={36} height={36} />
          <div className="t">
            써보고, 불편한 점을 알려주세요
            <span className="s">
              보험설계사 대상 12일 무료 체험
              <br className="sm-only" /> 11월 16일부터 11월 27일
              {n !== null && n >= 0 && <b> · {n === 0 ? "오늘 마감" : `${n}일 남음`}</b>}
            </span>
          </div>
        </div>
        <Link href="/bomate?from=slim" className="bm-slim-btn">
          체험단 신청
        </Link>
      </div>
    </section>
  );
}
