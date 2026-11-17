"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrowserFrame, PhoneFrame } from "@/components/DeviceFrame";
import "./bomate.css";

/* 카카오 상담 채널과 전화는 /join 과 같은 것을 쓴다 */
const KAKAO_CHAT = "https://pf.kakao.com/_mSxkxgn/chat";
const PHONE = "02-2038-4379";
const PHONE_TEL = "0220384379";

const APP = "/assets/bomate/app";

/* 기능 소개 — 화면은 보메이트 앱의 예시 고객 화면(익명 처리본)이다. 보험금 청구 화면은 11월 10일에 찍은 것 */
const ROWS = [
  {
    k: "진료내역",
    t: "고객에게 병원 서류를 안 받아도 5년 진료내역이 정리됩니다",
    d: "진단별로 묶고, 가입 전 알릴 의무에 걸리는 진료를 표시합니다. 가입 가능 여부는 판정하지 않습니다.",
    shot: { kind: "pc", src: `${APP}/medical-pc.webp`, alt: "진료내역 화면" },
  },
  {
    k: "실손 미청구",
    t: "청구 기록이 없는 진료와 돌려받을 금액을 보여 줍니다",
    d: "홈택스 의료비와 실손 수령 기록을 맞댑니다. 예상 금액은 추정치입니다.",
    shot: { kind: "pc", src: `${APP}/unclaimed-pc.webp`, alt: "실손 미청구 화면" },
  },
  {
    k: "보장분석",
    t: "정리 전과 후를 한 표로 비교합니다",
    d: "보장분석 PDF를 올리면 계약과 보장을 정리하고 보험료와 보장을 나란히 보여 줍니다.",
    shot: { kind: "pc", src: `${APP}/coverage-pc.webp`, alt: "보장분석 전후 비교표" },
  },
  {
    k: "건강검진",
    t: "검진 결과 최대 10년의 흐름을 한눈에 봅니다",
    d: "항목별 수치와 지난 검진과 달라진 점을 보여 줍니다.",
    shot: { kind: "phone", src: `${APP}/checkup-phone.webp`, alt: "건강검진 화면" },
  },
  {
    k: "보험금 청구",
    isNew: true,
    t: "청구도, 보험 질문도 앱 안에서 합니다",
    d: "상담 중 막히는 질문은 AI 질문방에 바로 묻고, 보험금 청구는 앱 안에서 진행합니다.",
    shot: { kind: "combo", src: `${APP}/qa-pc.webp`, src2: `${APP}/claim-phone.webp`, alt: "AI 보험 질문방과 보험금 청구 화면" },
  },
] as const;

const STEPS = [
  "설계사가 고객에게 카카오톡·문자·링크 복사로 조회 링크를 보냅니다.",
  "고객이 동의하고 간편인증을 합니다. 설계사가 대신 인증하지 않습니다.",
  "결과가 설계사 화면에 도착하고, 고객관리에 저장해 다시 볼 수 있습니다.",
];

function fmtPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return d.replace(/(\d{3})(\d+)/, "$1-$2");
  return d.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
}

export default function BomatePage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (data._gotcha) return; // 스팸 방지용 숨김칸
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type: "bomate",
          source: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (res.ok) setSent(true);
      else setFailed(true); // 메일 설정 없음·전송 실패 → 카카오 상담 안내
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main className="bm-page">
        <section className="bm-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/bomate/icon.png" alt="보메이트 앱 아이콘" width={56} height={56} />
          <p className="bm-eb">어메이징사업부가 개발한 보메이트</p>
          <h1>
            써보고, <span className="u">불편한 점을 알려주세요</span>
          </h1>
          <p className="bm-lead">
            보험설계사에게 12일간 무료로 열어드립니다. 막힌 단계부터 있었으면 하는 기능까지 말씀해 주세요.
          </p>
        </section>

        <section className="bm-facts" aria-label="체험단 안내">
          <div>
            <b>대상</b>
            <span>보험설계사</span>
          </div>
          <div>
            <b>기간</b>
            <span>11월 16일부터 11월 27일</span>
          </div>
          <div>
            <b>비용</b>
            <span>12일간 무료</span>
          </div>
        </section>

        <section className="bm-feat">
          <h2>12일간 써볼 수 있는 기능</h2>
          <p className="bm-sub">고객이 링크로 동의하고 인증하면, 상담 전에 필요한 자료가 설계사 화면에 정리됩니다.</p>

          <div className="bm-flag">
            <span className="bm-flag-tag">대표 기능</span>
            <h3>
              고객이 못 받은 실손,
              <br />
              <em>깜빡한 실손을 찾아 줍니다</em>
            </h3>
            <p>실손 지급내역을 진료와 맞대어 보고, 청구하지 않았거나 덜 받은 진료를 병원별로 짚어 줍니다.</p>
            <div className="bm-flag-shot">
              <BrowserFrame src={`${APP}/silson-match.webp`} alt="진료와 실손 지급 대조 화면" />
            </div>
          </div>

          {ROWS.map((r, i) => (
            <div key={r.k} className={`bm-row${i % 2 === 1 ? " rev" : ""}`}>
              <div className="bm-row-tx">
                <p className="k">
                  {r.k}
                  {"isNew" in r && r.isNew && <i>신규</i>}
                </p>
                <h3>{r.t}</h3>
                <p className="d">{r.d}</p>
              </div>
              <div className="bm-row-dev">
                {r.shot.kind === "pc" && <BrowserFrame src={r.shot.src} alt={r.shot.alt} />}
                {r.shot.kind === "phone" && <PhoneFrame src={r.shot.src} alt={r.shot.alt} />}
                {r.shot.kind === "combo" && (
                  <div className="bm-combo">
                    <BrowserFrame src={r.shot.src} alt="AI 보험 질문방" />
                    <div className="bm-combo-ph">
                      <PhoneFrame src={r.shot.src2} alt="보험금 청구 화면" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <h3 className="bm-h3">이렇게 씁니다</h3>
          <ol className="bm-steps">
            {STEPS.map((t, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                <p>{t}</p>
              </li>
            ))}
          </ol>
          <p className="bm-note">
            보메이트는 보험을 판매하거나 보험금 지급을 대행하는 서비스가 아니라, 설계사의 자료 정리와 상담 준비를 돕는 프로그램입니다. 화면은 예시 고객 자료이며, 가입 가능 여부를 판정하지 않습니다.
          </p>
        </section>

        <section className="bm-form" id="apply">
          <h2>체험단 신청</h2>
          <p className="bm-sub">이름과 연락처만 남겨주세요. 선정되면 연락드립니다.</p>
          {sent ? (
            <div className="bm-thanks">
              <h3>신청이 접수되었습니다</h3>
              <p>확인 후 남겨주신 연락처로 안내드리겠습니다. 감사합니다.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
              <div className="bm-field">
                <label htmlFor="bm-name">이름</label>
                <input id="bm-name" name="name" required placeholder="홍길동" autoComplete="name" />
              </div>
              <div className="bm-field">
                <label htmlFor="bm-phone">연락처</label>
                <input
                  id="bm-phone"
                  name="phone"
                  required
                  inputMode="numeric"
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                  onChange={(e) => {
                    e.target.value = fmtPhone(e.target.value);
                  }}
                />
              </div>
              <div className="bm-field">
                <label htmlFor="bm-company">
                  소속 <span className="opt">(선택)</span>
                </label>
                <input id="bm-company" name="company" placeholder="예: 소속 지점명" autoComplete="organization" />
              </div>
              <label className="bm-agree">
                <input type="checkbox" required />
                <span>체험단 안내를 위한 개인정보 수집·이용에 동의합니다. (수집: 이름·연락처·소속 / 목적: 체험단 선정 및 안내)</span>
              </label>
              <button className="bm-submit" type="submit" disabled={busy}>
                {busy ? "보내는 중" : "체험단 신청하기"}
              </button>
              {failed && (
                <p className="bm-fail" role="alert">
                  지금은 접수가 되지 않았습니다. 아래 카카오톡 상담으로 남겨주세요.
                </p>
              )}
            </form>
          )}
          <div className="bm-or">또는</div>
          <a className="bm-kakao" href={KAKAO_CHAT} target="_blank" rel="noopener noreferrer">
            카카오톡으로 1:1 상담
          </a>
          <p className="bm-call">
            전화 상담 <a href={`tel:${PHONE_TEL}`}>{PHONE}</a>
          </p>
          <p className="bm-secure">남겨주신 정보는 체험단 안내 외에 사용하지 않습니다. 이 모집은 보험설계사만 신청할 수 있습니다.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
