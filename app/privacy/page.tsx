import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// 개인정보처리방침 페이지. 내용은 Footer 의 모달과 같다 —
// 모달은 크롤러에 <button> 으로만 보여서 "개인정보처리방침 링크 없음"으로 잡혔다.
//
// ⚠️ 최종 수정일은 실제로 방침을 고친 날짜를 손으로 적는다.
//    모달은 new Date() 로 오늘 날짜를 찍고 있었는데, 그러면 고친 적이 없어도
//    매일 "오늘 수정됨"으로 보여서 방침 문서로서 의미가 없다.
const LAST_UPDATED = "2026년 9월 10일";

const TITLE = "개인정보처리방침 — 청구닷컴";
const DESCRIPTION =
  "청구닷컴의 개인정보 처리 목적, 수집 항목, 보호책임자를 안내합니다. 본 사이트는 기본적으로 개인정보를 수집하지 않습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    url: "/privacy",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="maxw px-5 py-8">
        <article className="prose-cg">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            개인정보처리방침
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            최종 수정일: {LAST_UPDATED}
          </p>

          <h2>1. 개인정보의 처리 목적</h2>
          <p>
            청구닷컴(이하 &apos;본 사이트&apos;)은 다음의 목적을 위하여
            개인정보를 처리합니다.
          </p>
          <ul>
            <li>웹사이트 방문 통계 및 분석</li>
            <li>서비스 개선 및 최적화</li>
            <li>문의 사항 응대 및 고객 지원</li>
          </ul>

          <h2>2. 수집하는 개인정보의 항목</h2>
          <p>본 사이트는 기본적으로 개인정보를 수집하지 않습니다.</p>
          <p>
            방문 통계를 위해 접속 기기와 페이지 이동 정보 등 식별되지 않는
            형태의 이용 기록이 수집될 수 있습니다.
          </p>

          <h2>3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            본 사이트는 개인정보를 수집하지 않으므로 별도로 보유하지 않습니다.
            문의 과정에서 전달받은 내용은 응대가 끝나면 파기합니다.
          </p>

          <h2>4. 개인정보 보호책임자</h2>
          <p>
            <strong>책임자:</strong> 청구닷컴 운영팀
            <br />
            <strong>문의:</strong> <Link href="/contact">문의 페이지</Link>
          </p>

          <h2>5. 방침의 변경</h2>
          <p>
            이 방침이 바뀌면 이 페이지에 변경 내용과 최종 수정일을 함께
            안내합니다.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
