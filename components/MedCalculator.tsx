"use client";

import { useState, useEffect } from "react";

const KRW = new Intl.NumberFormat("ko-KR");
function fmtKRW(n: number) {
  return KRW.format(Math.max(0, Math.round(n)));
}
function toNumber(text: string) {
  return Number((text || "").replace(/[^0-9]/g, "") || 0);
}

const presets: Record<
  string,
  {
    label: string;
    covPct?: number;
    nonFixed?: number;
    nonPct?: number;
    covMin: { clinic: number; hospital: number; sh: number };
  }
> = {
  "4th-basic": {
    label: "4세대(현행)",
    covPct: 0.2,
    nonFixed: 30000,
    nonPct: 0.3,
    covMin: { clinic: 10000, hospital: 0, sh: 20000 },
  },
  "3rd-standard": {
    label: "3세대(표준)",
    covPct: 0.1,
    nonFixed: 20000,
    nonPct: 0.2,
    covMin: { clinic: 10000, hospital: 15000, sh: 20000 },
  },
  "2nd-legacy": {
    label: "2세대",
    covMin: { clinic: 10000, hospital: 15000, sh: 20000 },
  },
};

export function MedCalculator() {
  const [gen, setGen] = useState<keyof typeof presets>("4th-basic");
  const [facility, setFacility] = useState<
    "clinic" | "hospital" | "sh"
  >("clinic");
  const [coveredCo, setCoveredCo] = useState("");
  const [nonCovered, setNonCovered] = useState("");
  const [payout, setPayout] = useState("0원");
  const [explain, setExplain] = useState<string[]>([]);
  const [showHospital, setShowHospital] = useState(true);

  useEffect(() => {
    setShowHospital(gen !== "4th-basic");
  }, [gen]);

  const calc = () => {
    const covered = toNumber(coveredCo);
    const nonCov = toNumber(nonCovered);
    const total = covered + nonCov;

    if (
      (gen === "2nd-legacy" && total === 0) ||
      (gen !== "2nd-legacy" && covered === 0 && nonCov === 0)
    ) {
      alert("금액을 입력하세요");
      return;
    }

    const p = presets[gen];
    let result = 0;
    const lines: string[] = [];

    if (gen === "2nd-legacy") {
      const minFixed =
        facility === "clinic" ? 10000 : facility === "hospital" ? 15000 : 20000;
      const twentyPct = Math.floor(total * 0.2);
      const appliedDed = Math.max(minFixed, twentyPct);
      result = Math.max(0, total - appliedDed);
      lines.push(`전체금액: ${fmtKRW(total)}원`);
      lines.push(
        `공제(2세대): 최소 ${fmtKRW(minFixed)}원 vs 20% ${fmtKRW(twentyPct)}원 → 적용 ${fmtKRW(appliedDed)}원`
      );
    } else if (p.covPct != null && p.nonFixed != null && p.nonPct != null) {
      if (gen === "4th-basic" && facility === "hospital") {
        setPayout("0원");
        setExplain(["4세대에서 \"병원\"은 적용되지 않습니다."]);
        return;
      }
      const covMin =
        facility === "clinic"
          ? p.covMin.clinic
          : facility === "hospital"
          ? p.covMin.hospital
          : p.covMin.sh;
      const covPctKRW = Math.floor(covered * p.covPct);
      const appliedCovDed = Math.max(covMin, covPctKRW);
      const covBase = Math.max(0, covered - appliedCovDed);
      const covPay = covBase * 1.0;

      const mapKo = {
        clinic: "의원",
        hospital: "병원",
        sh: "상급/종합병원",
      };
      lines.push(
        `급여 공제(${mapKo[facility]}): ${fmtKRW(covMin)}원 vs ${Math.round(p.covPct * 100)}% ${fmtKRW(covPctKRW)}원 → 적용 ${fmtKRW(appliedCovDed)}원`
      );
      lines.push(`급여 보상: ${fmtKRW(covPay)}원`);

      const nonPctKRW = Math.floor(nonCov * p.nonPct);
      const appliedNonDed = Math.max(p.nonFixed, nonPctKRW);
      const nonBase = Math.max(0, nonCov - appliedNonDed);
      const nonPay = nonBase * 1.0;
      result = covPay + nonPay;

      lines.push(
        `비급여 공제: ${fmtKRW(p.nonFixed)}원 vs ${Math.round(p.nonPct * 100)}% ${fmtKRW(nonPctKRW)}원 → 적용 ${fmtKRW(appliedNonDed)}원`
      );
      lines.push(`비급여 보상: ${fmtKRW(nonPay)}원`);
    }

    setPayout(fmtKRW(result) + "원");
    setExplain(lines);
  };

  const reset = () => {
    setCoveredCo("");
    setNonCovered("");
    setGen("4th-basic");
    setFacility("clinic");
    setPayout("0원");
    setExplain([]);
  };

  const example = () => {
    setCoveredCo("30,000");
    setNonCovered("70,000");
    setTimeout(() => {
      const covered = 30000;
      const nonCov = 70000;
      const p = presets[gen];
      if (gen === "2nd-legacy") {
        const minFixed = facility === "clinic" ? 10000 : facility === "hospital" ? 15000 : 20000;
        const twentyPct = Math.floor((covered + nonCov) * 0.2);
        const appliedDed = Math.max(minFixed, twentyPct);
        const result = Math.max(0, covered + nonCov - appliedDed);
        setPayout(fmtKRW(result) + "원");
        setExplain([`전체금액: ${fmtKRW(covered + nonCov)}원`, `공제 적용 후 보상: ${fmtKRW(result)}원`]);
      } else if ((gen !== "4th-basic" || facility !== "hospital") && p.covPct != null && p.nonFixed != null && p.nonPct != null) {
        const covMin = facility === "clinic" ? p.covMin.clinic : facility === "hospital" ? p.covMin.hospital : p.covMin.sh;
        const appliedCovDed = Math.max(covMin, Math.floor(covered * p.covPct));
        const covPay = Math.max(0, covered - appliedCovDed);
        const appliedNonDed = Math.max(p.nonFixed, Math.floor(nonCov * p.nonPct));
        const nonPay = Math.max(0, nonCov - appliedNonDed);
        setPayout(fmtKRW(covPay + nonPay) + "원");
        setExplain([`급여 보상: ${fmtKRW(covPay)}원`, `비급여 보상: ${fmtKRW(nonPay)}원`]);
      }
    }, 100);
  };

  return (
    <section id="medcalc" className="panel">
      <div className="section-head">
        <h3 className="section-title">실손의료비 간편 계산기</h3>
        <p className="section-sub">
          환자부담총액(실제 납부액)만 입력하세요. 세대/의료기관 공제를 자동
          반영합니다.
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
                onChange={(e) =>
                  setGen(e.target.value as keyof typeof presets)
                }
                className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="4th-basic">4세대(현행)</option>
                <option value="3rd-standard">3세대(표준)</option>
                <option value="2nd-legacy">2세대</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-800">
                의료기관 유형
              </label>
              <select
                value={facility}
                onChange={(e) =>
                  setFacility(e.target.value as "clinic" | "hospital" | "sh")
                }
                className="w-full h-9 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="clinic">의원</option>
                {showHospital && <option value="hospital">병원</option>}
                <option value="sh">상급/종합병원</option>
              </select>
            </div>
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
          <p className="mt-2 text-[11px] text-slate-500">
            ※ 참고용 계산 결과입니다. 실제 지급은 약관·심사에 따라 달라질 수
            있습니다.
          </p>
        </section>
      </div>
    </section>
  );
}
