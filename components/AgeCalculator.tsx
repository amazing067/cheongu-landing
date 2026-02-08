"use client";

import { useState, useEffect } from "react";

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function addMonths(d: Date, m: number): Date {
  const x = new Date(d);
  const day = x.getDate();
  x.setMonth(x.getMonth() + m);
  if (x.getDate() !== day) x.setDate(0);
  return x;
}

function intlAge(dob: Date, asof: Date): number {
  let a = asof.getFullYear() - dob.getFullYear();
  const bThis = new Date(asof.getFullYear(), dob.getMonth(), dob.getDate());
  if (asof < bThis) a -= 1;
  return a;
}

function insAge(
  dob: Date,
  asof: Date
): { base: number; ins: number; half: Date } {
  const base = intlAge(dob, asof);
  const lastYear =
    asof.getFullYear() -
    (asof < new Date(asof.getFullYear(), dob.getMonth(), dob.getDate())
      ? 1
      : 0);
  const last = new Date(lastYear, dob.getMonth(), dob.getDate());
  const half = addMonths(last, 6);
  const plus = asof >= half ? 1 : 0;
  return { base, ins: base + plus, half };
}

export function AgeCalculator() {
  const [y, setY] = useState("");
  const [m, setM] = useState("");
  const [d, setD] = useState("");
  const [ageNum, setAgeNum] = useState("--");
  const [intlAgeVal, setIntlAgeVal] = useState("–");
  const [ruleText, setRuleText] = useState("생년월일을 입력하세요");
  const [halfLeft, setHalfLeft] = useState("–");
  const [badge, setBadge] = useState("–");

  const getDobString = () => {
    if (y.length === 4 && m.length === 2 && d.length === 2)
      return `${y}-${m}-${d}`;
    return null;
  };

  const renderAge = () => {
    const dobStr = getDobString();
    if (!dobStr) return;
    const dob = new Date(dobStr);
    if (Number.isNaN(dob.getTime())) return;
    const asof = new Date();
    const r = insAge(dob, asof);
    setAgeNum(String(r.ins));
    setIntlAgeVal(String(r.base));
    setRuleText(
      asof >= r.half
        ? "오늘 기준: 최근 생일부터 6개월 경과 → +1"
        : "오늘 기준: 최근 생일부터 6개월 미만"
    );
    const ms = r.half.getTime() - asof.getTime();
    setHalfLeft(
      ms <= 0
        ? "이미 상령일 지남"
        : `${fmt(r.half)} (약 ${Math.floor(ms / 86400000)}일 ${Math.floor((ms % 86400000) / 3600000)}시간 남음)`
    );
    setBadge(`${r.ins}세`);
  };

  const reset = () => {
    setY("");
    setM("");
    setD("");
    setAgeNum("--");
    setIntlAgeVal("–");
    setRuleText("생년월일을 입력하세요");
    setHalfLeft("–");
    setBadge("–");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const dobParam = params.get("dob");
    if (dobParam && /^\d{4}-\d{2}-\d{2}$/.test(dobParam)) {
      const [yy, mm, dd] = dobParam.split("-");
      setY(yy);
      setM(mm);
      setD(dd);
      const r = insAge(new Date(dobParam), new Date());
      setAgeNum(String(r.ins));
      setIntlAgeVal(String(r.base));
      setRuleText(
        new Date() >= r.half
          ? "오늘 기준: 최근 생일부터 6개월 경과 → +1"
          : "오늘 기준: 최근 생일부터 6개월 미만"
      );
      const ms = r.half.getTime() - new Date().getTime();
      setHalfLeft(
        ms <= 0
          ? "이미 상령일 지남"
          : `${fmt(r.half)} (약 ${Math.floor(ms / 86400000)}일 남음)`
      );
      setBadge(`${r.ins}세`);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renderAge();
  };

  const onlyDigits = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D/g, "");
  };
  const clamp2 = (v: string, min: number, max: number) => {
    if (!v) return "";
    const n = Number(v);
    if (Number.isNaN(n)) return "";
    return String(Math.min(max, Math.max(min, n))).padStart(2, "0");
  };

  return (
    <section id="age" className="panel">
      <div className="section-head">
        <h3 className="section-title">보험나이 계산기</h3>
        <p className="section-sub">
          규칙: 만나이 + (최근 생일부터 6개월 경과 시 +1) · 기준일은{" "}
          <strong>오늘</strong>
        </p>
      </div>
      <div className="panel-card">
        <div className="calc-card h-full border border-slate-200 rounded-2xl bg-white shadow-md">
          <div className="flex items-center justify-between p-3 border-b border-slate-200">
            <div className="text-sm font-bold text-slate-900">
              청구닷컴 나이 계산기
            </div>
            <div className="text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold">
              {badge}
            </div>
          </div>
          <div className="p-3 grid gap-2">
            <div className="display rounded-lg border border-slate-200 bg-white p-3 grid gap-1">
              <div className="text-[10px] text-slate-600 flex items-center justify-between">
                <span>보험나이</span>
                <span>기준: 오늘</span>
              </div>
              <div className="display-num text-[clamp(28px,4vw,36px)] font-black text-slate-900">
                <span>{ageNum}</span>
                <span className="text-lg align-top ml-1">세</span>
              </div>
              <div className="text-xs text-slate-600">{ruleText}</div>
            </div>

            <form id="age-form" onSubmit={handleSubmit}>
              <label className="text-xs font-semibold text-center block text-slate-700">
                생년월일
              </label>
              <div className="flex gap-1.5 items-center justify-center mt-1.5">
                <input
                  id="dobY"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="연도(YYYY)"
                  className="h-9 rounded-lg px-2.5 text-center border border-slate-300 text-sm bg-white w-[110px]"
                  value={y}
                  onChange={(e) => {
                    setY(e.target.value.replace(/\D/g, ""));
                    if (e.target.value.replace(/\D/g, "").length >= 4)
                      document.getElementById("dobM")?.focus();
                  }}
                  onBlur={(e) => setY(e.target.value)}
                />
                <span className="text-slate-400">–</span>
                <input
                  id="dobM"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="MM"
                  className="h-9 rounded-lg px-2.5 text-center border border-slate-300 text-sm bg-white w-[65px]"
                  value={m}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setM(clamp2(v, 1, 12));
                    if (clamp2(v, 1, 12).length >= 2)
                      document.getElementById("dobD")?.focus();
                  }}
                />
                <span className="text-slate-400">–</span>
                <input
                  id="dobD"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="DD"
                  className="h-9 rounded-lg px-2.5 text-center border border-slate-300 text-sm bg-white w-[65px]"
                  value={d}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    setD(clamp2(v, 1, 31));
                  }}
                />
              </div>
              <div className="flex gap-2 justify-center items-center mt-2">
                <button type="submit" className="key key-primary">
                  계산하기
                </button>
                <button type="button" onClick={reset} className="key">
                  초기화
                </button>
              </div>
            </form>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[10px] text-slate-600">만나이</div>
                <div className="text-sm font-bold mt-0.5 text-slate-900">
                  <span>{intlAgeVal}</span> 세
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="text-[10px] text-slate-600">
                  다음 보험 상령일까지
                </div>
                <div className="text-sm font-semibold mt-0.5 text-slate-900">
                  <span>{halfLeft}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
