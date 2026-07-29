"use client";

import { useCallback, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CarrierList } from "@/components/CarrierList";
import { AgeCalculator } from "@/components/AgeCalculator";
import { MedCalculator } from "@/components/MedCalculator";
import { CarrierIndexLinks } from "@/components/CarrierIndexLinks";
import { JoinCTA } from "@/components/JoinCTA";
import { JoinFab } from "@/components/JoinFab";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const clearSearch = useCallback(() => setSearchQuery(""), []);

  return (
    <>
      <Header />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <JoinCTA />
      <main className="maxw pb-20">
        <CarrierList
          searchQuery={searchQuery}
          onClearSearch={clearSearch}
        />
        <section id="calc-panels" className="mt-14">
          <div className="section-head">
            <h2 className="section-title">빠른 계산 도구</h2>
            <p className="section-sub">
              보험나이와 실손 예상 수령액을 한 화면에서 계산하세요.
            </p>
            {/* 계산기 단독 페이지로 가는 링크 — 설명·FAQ가 붙어 있고, 크롤 경로도 된다 */}
            <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <a
                href="/calc/보험나이-계산기"
                className="font-bold text-slate-500 no-underline hover:underline"
              >
                보험나이 계산기 설명 보기 →
              </a>
              <a
                href="/calc/실손의료비-계산기"
                className="font-bold text-slate-500 no-underline hover:underline"
              >
                실손의료비 계산기 설명 보기 →
              </a>
            </p>
          </div>
          <div
            id="calc-grid"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 items-start"
          >
            <AgeCalculator />
            <MedCalculator />
          </div>
        </section>
        <CarrierIndexLinks />
        <JoinCTA variant="card" />
      </main>
      <Footer />
      <JoinFab />
    </>
  );
}
