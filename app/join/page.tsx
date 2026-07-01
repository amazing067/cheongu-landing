"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import "./join.css";

/* ─── 설정: 실제 값으로 바꾸면 됨 ─────────────────────────── */
const KAKAO_CHAT = "https://pf.kakao.com/_mSxkxgn/chat";
const PHONE = "02-2038-4379";
const PHONE_TEL = "0220384379";
const PRIME_SITE = "https://primeasset.kr"; // 프라임에셋 공식 (필요 시 어메이징 전용으로 교체)
const AMAZING_SITE = "https://프라임에셋.com"; // 어메이징사업부 공식 사이트
/* 신청 폼은 /api/apply 로 전송 → EMAIL_* 설정 시 induo@naver.com 으로 메일 발송.
   설정이 없거나 실패하면 카카오 상담으로 자동 폴백됩니다. */
/* ────────────────────────────────────────────────────────── */

type Pillar = {
  acc: string;
  no: string;
  title: string;
  desc: string;
  items: string[];
  live?: string;
  here?: boolean;
};

const PILLARS: Pillar[] = [
  {
    acc: "#2563EB",
    no: "PILLAR 01",
    title: "AI 보장분석 컨설팅룸",
    live: "LIVE",
    desc: "증권 한 장을 넣으면 보장 부족·중복이 몇 분 만에 표로 정리됩니다.",
    items: [
      "AI 자동 분석 · 원문에 없는 값은 걸러내는 검증",
      "보장 비교 · 청구 누락 · 고지 리포트를 PDF로",
      "중단한 상담 이어하기(고객별 프로젝트 저장)",
    ],
  },
  {
    acc: "#39a2b8",
    no: "PILLAR 02",
    title: "통합 보험·진료 조회",
    live: "LIVE",
    desc: "간편인증 한 번으로 고객의 전 보험사 가입내역·진료이력을 한 화면에.",
    items: [
      "내보험찾기 — 실손·정액·저축·자동차까지 통합 조회",
      "진료내역 AI 3줄 요약 + KCD 진단명 용어집",
      "실손 미청구 발굴(홈택스 의료비 × 실손24 병원 매칭)",
    ],
  },
  {
    acc: "#e0342a",
    no: "PILLAR 03",
    title: "청구닷컴 허브",
    here: true,
    desc: "32개 보험사 청구 링크를 한 곳에서 바로 — 지금 보고 계신 이 시스템입니다.",
    items: [
      "전산 접속 · 필요서류 · 보험금 청구서 PDF",
      "보험나이·실손 계산기 · 상급종합·간호간병 병원 찾기",
      "고객에게 청구 링크 원클릭 공유",
    ],
  },
  {
    acc: "#7c3aed",
    no: "PILLAR 04",
    title: "고객 CRM · 공유 브리핑",
    live: "LIVE",
    desc: "고객 원장 360 + 로그인 없이 열리는 리포트 링크로 상담을 마무리합니다.",
    items: [
      "계약·가족관계·이체일까지 한 사람 단위로 관리",
      "만기 D-60 고객은 갱신 안내 할 일 자동 생성",
      "공유 브리핑 링크(7일 만료 · 조회수 추적)",
    ],
  },
];

const PROOF = [
  { em: "📊", t: "실적 랭킹 자동 집계" },
  { em: "🎯", t: "영업 DB 자동 배정" },
  { em: "🔄", t: "EMR 리드 라운드로빈" },
  { em: "💬", t: "카카오 알림톡 발송" },
  { em: "📄", t: "개인화 전단지·카드뉴스" },
  { em: "🧭", t: "인사이트 보드(2벌 본문)" },
];

const BENEFITS = [
  { k: "SUPPORT 01", h: "DB 전액 지원", p: "설계사가 DB를 사지 않습니다. 본부가 전액 부담하고 상담에만 집중.", stat: "월 100건+" },
  { k: "SUPPORT 02", h: "시스템 무료 이용", p: "청구닷컴·보장분석 AI·통합조회까지 입사 첫날 전부 무료.", stat: "Day 1 오픈" },
  { k: "SUPPORT 03", h: "교육비 0원", p: "10일 신입 부트캠프 + 주1회 1:1 현장 OJT + 월 리프레시.", stat: "10일 · 상시" },
  { k: "SUPPORT 04", h: "규정대로 자동 승격", p: "FC → 팀장 → 지사장 → 본부장. 규정집 숫자만 채우면 자동 승격.", stat: "본부장까지" },
  { k: "SUPPORT 05", h: "자유로운 영업 환경", p: "불필요한 간섭 없이 자율적으로. 당신의 스타일 존중.", stat: "자율·존중" },
  { k: "SUPPORT 06", h: "투명한 오픈 구조", p: "생·손보 32개사 · DB 분배와 승격 기준을 규정집으로 공개.", stat: "32개 제휴사" },
];

export default function JoinPage() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "설계사 채용 · 어메이징사업부 | 청구닷컴";
  }, []);

  function fmtPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.replace(/(\d{3})(\d+)/, "$1-$2");
    return d.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (data._gotcha) return; // 허니팟(스팸 방지)

    setBusy(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        // 메일 설정 없음/실패 → 카카오 상담으로 폴백
        window.open(KAKAO_CHAT, "_blank", "noopener");
      }
    } catch {
      window.open(KAKAO_CHAT, "_blank", "noopener");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="joinpage">
      {/* NAV */}
      <nav className="nav">
        <div className="wrap row">
          <a className="brand" href="/">
            <span className="ci">청구닷컴</span>
            <BrandMark variant="mark" height={26} />
            <span className="bx">
              <span className="amz">AMAZING</span>
              <span className="sub">프라임에셋 어메이징사업부</span>
            </span>
          </a>
          <div className="sp">
            <a className="back" href="/">← 청구닷컴 홈</a>
            <a className="apply" href="#apply">지금 지원</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <span className="grid-bg" />
        <div className="wrap in">
          <span className="eyebrow">PRIME ASSET · 어메이징사업부 · 경력 설계사 영입</span>
          <h1>
            영업은 <span className="serif">시스템</span>이다
          </h1>
          <p className="lead">
            보장분석 · 통합조회 · 청구 자동화까지 — 직접 만든 시스템이 설계사의 시간을{" "}
            <b>영업으로</b> 되돌려 드립니다.
            <span className="since">직접 개발·운영 · since 2019</span>
          </p>
          <div className="btns">
            <a className="btn btn-ghost" href={AMAZING_SITE} target="_blank" rel="noopener noreferrer">
              어메이징사업부 바로가기
            </a>
            <a className="btn btn-primary" href="#apply">1분 지원하기</a>
            <a className="btn btn-kakao" href={KAKAO_CHAT} target="_blank" rel="noopener noreferrer">
              카톡으로 먼저 상담
            </a>
          </div>
          <div className="ticker">
            <span className="st"><b className="mono">32</b>개 제휴 보험사</span>
            <span className="st"><b className="mono">16</b>개 자체 시스템</span>
            <span className="st">업무 <b className="mono">40%</b> 자동화</span>
            <span className="st"><b className="mono">10</b>일 온보딩</span>
            <span className="st">AI 보장분석 <b className="mono">1:1</b> 지원</span>
          </div>
        </div>
      </header>

      {/* PILLARS */}
      <section className="sec" id="system">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">01 — The System</span>
            <h2>설계사는 상담만. <span className="serif">나머지는 시스템이.</span></h2>
            <p className="sub">
              타사가 외주로 빌려 쓰는 걸 우리는 내부에서 직접 개발·운영합니다. 아래 네 가지는 모두
              현재 실제로 운영 중인 시스템입니다.
            </p>
          </div>
          <div className="pillars">
            {PILLARS.map((p) => (
              <article className="card" key={p.no} style={{ "--acc": p.acc } as React.CSSProperties}>
                <div className="no mono">{p.no}</div>
                <h3>
                  {p.title}
                  {p.here ? <span className="here">지금 이 시스템</span> : <span className="live">{p.live}</span>}
                </h3>
                <p className="desc">{p.desc}</p>
                <ul>
                  {p.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="sec alt">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">02 — Proof</span>
            <h2>말이 아니라, <span className="serif">실제로 씁니다.</span></h2>
            <p className="sub">어메이징사업부 설계사가 매일 쓰는 자체 도구 — 합류하면 첫날부터 사용합니다.</p>
          </div>
          <div className="proof">
            {PROOF.map((p) => (
              <span className="p" key={p.t}>
                <span className="em">{p.em}</span>
                {p.t}
              </span>
            ))}
          </div>
          <p className="proofnote">현장 피드백이 곧 다음 업데이트로 반영됩니다 — 시스템은 계속 늘어납니다.</p>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">03 — Support</span>
            <h2>우리가 주는 건 <span className="serif">돈만이 아닙니다.</span></h2>
            <p className="sub">설계사가 혼자 사 모아야 할 것들을 본부가 대신 갖춥니다.</p>
          </div>
          <div className="bens">
            {BENEFITS.map((b) => (
              <div className="ben" key={b.k}>
                <span className="k">{b.k}</span>
                <h4>{b.h}</h4>
                <p>{b.p}</p>
                <span className="stat">{b.stat}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="fullaccess">
              <h2>이 모든 시스템, <span className="serif">입사 첫날 전부 오픈됩니다.</span></h2>
              <p>32개사 통합 청구·AI 보장분석·통합 조회·고객 CRM까지 ID 하나로. 부담 없이 시작하세요.</p>
              <div className="mini">추가 결제 없음 · 리스 없음 · 월 이용료 ₩0</div>
            </div>
          </div>

          <div className="prime">
            <img className="prime-logo" src="/primeasset-ci.png" alt="프라임에셋" />
            <div className="tx">
              <b>프라임에셋 어메이징사업부</b>
              <p>대형 GA 프라임에셋 소속으로 생·손보 32개사(생보 19 · 손보 13) 상품을 함께 다룹니다. 안정된 소속 위에서 자유롭게 영업하세요.</p>
            </div>
            <div className="prime-links">
              <a className="link" href={PRIME_SITE} target="_blank" rel="noopener noreferrer">
                프라임에셋 공식 사이트 ›
              </a>
              <a className="link" href={AMAZING_SITE} target="_blank" rel="noopener noreferrer">
                어메이징사업부 공식 사이트 ›
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* APPLY */}
      <section className="sec alt" id="apply">
        <div className="wrap">
          <div className="apply">
            <div className="left">
              <span className="eyebrow">04 — Apply</span>
              <h2>연락처만 <span className="serif">남겨주세요.</span></h2>
              <p>경력·소속은 편하게. 지금 상황과 고민만 알려주셔도 됩니다. 모든 문의는 비밀이 보장됩니다.</p>
              <ul>
                <li><span>✓&nbsp;</span>지원 즉시 24시간 내 1:1 연락</li>
                <li><span>✓&nbsp;</span>비밀 보장 · 원치 않으면 추가 연락 없음</li>
              </ul>
            </div>
            <div className="right">
              {sent ? (
                <div className="thanks">
                  <div className="big">✅</div>
                  <h3>지원이 접수되었습니다</h3>
                  <p>24시간 내에 직접 연락드리겠습니다. 감사합니다.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit}>
                  <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
                  <div className="field">
                    <label>이름</label>
                    <input name="name" required placeholder="홍길동" />
                  </div>
                  <div className="field">
                    <label>연락처</label>
                    <input
                      name="phone"
                      required
                      inputMode="numeric"
                      placeholder="010-0000-0000"
                      onChange={(e) => {
                        e.target.value = fmtPhone(e.target.value);
                      }}
                    />
                  </div>
                  <div className="field">
                    <label>이메일 <span className="opt">(선택)</span></label>
                    <input name="email" type="email" placeholder="name@email.com" />
                  </div>
                  <div className="field">
                    <label>경력 <span className="opt">(선택)</span></label>
                    <select name="career" defaultValue="">
                      <option value="" disabled>선택해주세요</option>
                      <option>신입 · 무경력</option>
                      <option>1~3년</option>
                      <option>3~5년</option>
                      <option>5~10년</option>
                      <option>10년 이상</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>남기실 말 <span className="opt">(선택)</span></label>
                    <textarea name="motive" rows={2} placeholder="현 소속·고민 등 편하게 남겨주세요" />
                  </div>
                  <label className="agree">
                    <input type="checkbox" required />
                    <span>상담을 위한 개인정보 수집·이용에 동의합니다. (수집: 이름·연락처 등 / 목적: 채용 상담)</span>
                  </label>
                  <button className="submit" type="submit" disabled={busy}>
                    {busy ? "보내는 중…" : "신청 보내기"}
                  </button>
                  <div className="or">— 또는 —</div>
                  <a className="kakaofull" href={KAKAO_CHAT} target="_blank" rel="noopener noreferrer">
                    💬 카카오톡으로 1:1 상담
                  </a>
                  <div className="callrow">
                    전화 상담 · <a href={`tel:${PHONE_TEL}`}>{PHONE}</a>
                  </div>
                  <div className="secure">🔒 남겨주신 정보는 상담 목적 외 사용되지 않습니다.</div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ft">
        <div className="wrap">
          <div className="row">
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BrandMark variant="mark" height={24} />
              <span><span className="amz">AMAZING</span> · 프라임에셋 어메이징사업부</span>
            </span>
            <div className="links">
              <a href="/">청구닷컴 홈</a>
              <a href={PRIME_SITE} target="_blank" rel="noopener noreferrer">프라임에셋</a>
            </div>
          </div>
          <div className="cr">프라임에셋 어메이징사업부 · 김성민 © 2020</div>
        </div>
      </footer>
    </div>
  );
}
