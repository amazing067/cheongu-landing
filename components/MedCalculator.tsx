"use client";

import { useMemo, useState } from "react";

const KRW = new Intl.NumberFormat("ko-KR");
function fmtKRW(n: number) {
  return KRW.format(Math.max(0, Math.round(n)));
}
function toNumber(text: string) {
  return Number((text || "").replace(/[^0-9]/g, "") || 0);
}

type Facility = "clinic" | "hospital" | "sh";
type NonType = "중증" | "비중증";
type GenKey = "5th-basic" | "4th-basic" | "3rd-standard" | "2nd-legacy";

type Preset = {
  label: string;
  /** 계산 방식: combined = 급여+비급여 합산 단일공제(2·3세대), split = 급여/비급여 분리(4·5세대) */
  mode: "combined" | "split";
  covMin: { clinic: number; hospital: number; sh: number };
  /** split 전용 */
  covPct?: number;
  nonFixed?: number;
  nonPct?: number;
  /** combined 전용: 급여·비급여 정률 */
  combinedCovPct?: number;
  combinedNonPct?: number;
  /** 5세대 비급여 이원화 */
  dualNon?: { 중증: { fixed: number; pct: number }; 비중증: { fixed: number; pct: number } };
  note?: string;
};

// 출처: 금융위 4·5세대 보도자료, 손보협회 공시 (통원/외래 기준)
const presets: Record<GenKey, Preset> = {
  "5th-basic": {
    label: "5세대(현행)",
    mode: "split",
    covPct: 0.2, // 급여 자기부담 최소 20% (실제 외래 급여는 건강보험 본인부담률 연동)
    covMin: { clinic: 10000, hospital: 10000, sh: 20000 },
    dualNon: {
      중증: { fixed: 30000, pct: 0.3 }, // 중증 비급여: max(3만, 30%)
      비중증: { fixed: 50000, pct: 0.5 }, // 비중증 비급여: max(5만, 50%)
    },
    note: "※ 5세대 외래 급여는 건강보험 본인부담률에 연동되어 실제 자기부담이 표시보다 클 수 있습니다. 비중증 비급여는 연 1,000만원 한도이며, 도수·체외충격파·증식치료 등은 보장 제외(면책)입니다.",
  },
  "4th-basic": {
    label: "4세대",
    mode: "split",
    covPct: 0.2, // 급여 max(정액, 20%)
    nonFixed: 30000, // 비급여 max(3만, 30%)
    nonPct: 0.3,
    covMin: { clinic: 10000, hospital: 10000, sh: 20000 }, // 병·의원 1만 / 상급·종합 2만
  },
  "3rd-standard": {
    label: "3세대(착한실손)",
    mode: "combined",
    combinedCovPct: 0.1, // 급여 10%
    combinedNonPct: 0.2, // 비급여 20%
    covMin: { clinic: 10000, hospital: 15000, sh: 20000 },
    note: "※ 3세대는 통원 시 급여·비급여를 합산해 max(정액공제, 급여10%+비급여20%)를 한 번만 공제합니다. 도수·비급여주사·MRI는 별도 특약(자기부담 30%)입니다.",
  },
  "2nd-legacy": {
    label: "2세대(표준화)",
    mode: "combined",
    covMin: { clinic: 10000, hospital: 15000, sh: 20000 }, // 통원 정액공제만
    note: "※ 2세대는 상품(표준형/선택형)별로 차이가 큽니다. 여기서는 통원 정액공제(의원 1만 / 종합 1.5만 / 상급 2만)만 반영한 근사치입니다.",
  },
};

const FACILITY_KO: Record<Facility, string> = {
  clinic: "의원",
  hospital: "병원",
  sh: "상급/종합병원",
};

/** 순수 계산 함수 — calc()와 예시 입력이 공유 */
function computePayout(
  gen: GenKey,
  facility: Facility,
  covered: number,
  nonCov: number,
  nonType: NonType
): { result: number; lines: string[] } {
  const p = presets[gen];
  const lines: string[] = [];
  const covMin = p.covMin[facility];
  const facLabel = FACILITY_KO[facility];

  if (p.mode === "combined") {
    const total = covered + nonCov;
    const pctDed = Math.floor(
      covered * (p.combinedCovPct ?? 0) + nonCov * (p.combinedNonPct ?? 0)
    );
    const ded = Math.max(covMin, pctDed);
    const result = Math.max(0, total - ded);
    lines.push(`급여 ${fmtKRW(covered)} + 비급여 ${fmtKRW(nonCov)} = 총 ${fmtKRW(total)}원`);
    if (pctDed > 0) {
      lines.push(
        `통원 공제(${facLabel}): 정액 ${fmtKRW(covMin)} vs 정률 ${fmtKRW(pctDed)} → 적용 ${fmtKRW(ded)}원`
      );
    } else {
      lines.push(`통원 공제(${facLabel} 정액): ${fmtKRW(ded)}원`);
    }
    lines.push(`예상 보상: ${fmtKRW(result)}원`);
    return { result, lines };
  }

  // split (4·5세대): 급여 / 비급여 분리
  const covPct = p.covPct ?? 0;
  const covPctKRW = Math.floor(covered * covPct);
  const covDed = Math.max(covMin, covPctKRW);
  const covPay = Math.max(0, covered - covDed);
  lines.push(
    `급여 공제(${facLabel}): 정액 ${fmtKRW(covMin)} vs ${Math.round(covPct * 100)}% ${fmtKRW(covPctKRW)} → 적용 ${fmtKRW(covDed)}원`
  );
  lines.push(`급여 보상: ${fmtKRW(covPay)}원`);

  let nonFixed = p.nonFixed ?? 0;
  let nonPct = p.nonPct ?? 0;
  let nonPrefix = "";
  if (p.dualNon) {
    const t = p.dualNon[nonType];
    nonFixed = t.fixed;
    nonPct = t.pct;
    nonPrefix = `${nonType} `;
  }
  const nonPctKRW = Math.floor(nonCov * nonPct);
  const nonDed = Math.max(nonFixed, nonPctKRW);
  const nonPay = Math.max(0, nonCov - nonDed);
  lines.push(
    `${nonPrefix}비급여 공제: 정액 ${fmtKRW(nonFixed)} vs ${Math.round(nonPct * 100)}% ${fmtKRW(nonPctKRW)} → 적용 ${fmtKRW(nonDed)}원`
  );
  lines.push(`${nonPrefix}비급여 보상: ${fmtKRW(nonPay)}원`);

  return { result: covPay + nonPay, lines };
}

export function MedCalculator() {
  const [gen, setGen] = useState<GenKey>("5th-basic");
  const [facility, setFacility] = useState<Facility>("clinic");
  const [nonType, setNonType] = useState<NonType>("중증");
  const [coveredCo, setCoveredCo] = useState("");
  const [nonCovered, setNonCovered] = useState("");
  const [payout, setPayout] = useState("0원");
  const [explain, setExplain] = useState<string[]>([]);

  const isDualNon = gen === "5th-basic";
  const note = useMemo(() => presets[gen].note, [gen]);

  const runCalc = (covered: number, nonCov: number) => {
    const { result, lines } = computePayout(gen, facility, covered, nonCov, nonType);
    setPayout(fmtKRW(result) + "원");
    setExplain(lines);
  };

  const calc = () => {
    const covered = toNumber(coveredCo);
    const nonCov = toNumber(nonCovered);
    if (covered === 0 && nonCov === 0) {
      alert("급여 또는 비급여 금액을 입력하세요");
      return;
    }
    runCalc(covered, nonCov);
  };

  const reset = () => {
    setCoveredCo("");
    setNonCovered("");
    setGen("5th-basic");
    setFacility("clinic");
    setNonType("중증");
    setPayout("0원");
    setExplain([]);
  };

  const example = () => {
    setCoveredCo("30,000");
    setNonCovered("70,000");
    runCalc(30000, 70000);
  };

  return (
    <section id="medcalc" className="panel">
      <div className="section-head">
        <h3 className="section-title">실손의료비 간편 계산기</h3>
        <p className="section-sub">
          통원(외래) 기준. 환자부담총액(실제 납부액)만 입력하면 세대·의료기관
          공제를 자동 반영합니다.
        </p>
      </div>
      <div className="panel-card">
        <section className="bg-white rounded-xl shadow p-4 border border-slate-200">
          <div className="grid gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-800">
                세대 선택
              </label>
              <select
                value={gen}
                onChange={(e) => setGen(e.target.value as GenKey)}
                className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="5th-basic">5세대(현행)</option>
                <option value="4th-basic">4세대</option>
                <option value="3rd-standard">3세대(착한실손)</option>
                <option value="2nd-legacy">2세대(표준화)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-800">
                의료기관 유형
              </label>
              <select
                value={facility}
                onChange={(e) => setFacility(e.target.value as Facility)}
                className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="clinic">의원</option>
                <option value="hospital">병원</option>
                <option value="sh">상급/종합병원</option>
              </select>
            </div>
            {isDualNon && (
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-800">
                  비급여 유형 (5세대)
                </label>
                <select
                  value={nonType}
                  onChange={(e) => setNonType(e.target.value as NonType)}
                  className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                >
                  <option value="중증">중증 비급여 (자기부담 30%)</option>
                  <option value="비중증">비중증 비급여 (자기부담 50%)</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-800">
                환자부담총액 - 급여(원)
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="예: 30,000"
                value={coveredCo}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setCoveredCo(v ? KRW.format(Number(v)) : "");
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-800">
                환자부담총액 - 비급여(원)
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="예: 70,000"
                value={nonCovered}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setNonCovered(v ? KRW.format(Number(v)) : "");
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={calc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-white bg-blue-500 hover:bg-blue-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              계산하기
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-white bg-slate-500 hover:bg-slate-600 transition"
            >
              초기화
            </button>
            <button
              onClick={example}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 transition"
            >
              예시 입력
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-slate-700 text-xs">예상 수령액</div>
            <div className="mt-1 text-2xl font-extrabold text-blue-500">
              {payout}
            </div>
            {explain.length > 0 && (
              <ul className="mt-2 text-slate-700 text-[13px] space-y-0.5">
                {explain.map((t, i) => (
                  <li key={i}>• {t}</li>
                ))}
              </ul>
            )}
          </div>
          {note && (
            <p className="mt-2 text-[11px] text-amber-700 leading-relaxed">
              {note}
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">
            ※ 통원(외래) 기준 참고용 계산입니다. 입원·특약(도수 등)·연간 한도는
            미반영이며, 실제 지급은 약관·심사에 따라 달라질 수 있습니다.
          </p>
        </section>
      </div>
    </section>
  );
}
