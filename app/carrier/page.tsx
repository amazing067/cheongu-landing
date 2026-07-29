import type { Metadata } from "next";
import { SITE_URL, carriersByType, carrierPath } from "@/lib/carriers";
import type { Carrier } from "@/types/carrier";

// 보험사 41곳으로 가는 허브. 크롤러가 개별 페이지를 전부 발견하는 통로이자,
// "보험사 팩스번호 모음" 류 검색어를 직접 노리는 페이지다.

// 개수는 links.json 에서 세어 쓴다. 하드코딩하면 보험사를 추가했을 때
// 제목·설명만 조용히 틀어져서 검색결과에 잘못된 숫자가 나간다.
const COUNTS = {
  손해: carriersByType["손해"].length,
  생명: carriersByType["생명"].length,
  공제회사: carriersByType["공제회사"].length,
};
const TOTAL = COUNTS.손해 + COUNTS.생명 + COUNTS.공제회사;

const TITLE = `보험사별 보험금 청구 안내 ${TOTAL}곳 — 필요서류·청구서 PDF·팩스번호·고객센터 | 청구닷컴`;
const DESCRIPTION = `손해보험 ${COUNTS.손해}곳, 생명보험 ${COUNTS.생명}곳, 공제회사 ${COUNTS.공제회사}곳 — 보험사별 보험금 청구 필요서류, 청구서 PDF 양식, 팩스번호, 고객센터 전화번호를 한 곳에서 확인하세요.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "보험사 팩스번호",
    "보험사 고객센터",
    "보험금 청구서류",
    "보험금 청구서 양식",
    "보험사별 보험금 청구",
    "청구닷컴",
  ],
  alternates: { canonical: "/carrier" },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    url: "/carrier",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
};

function Group({ title, items }: { title: string; items: readonly Carrier[] }) {
  return (
    <section className="mb-9">
      <h2 className="mb-3 flex items-baseline gap-2 text-lg font-black text-slate-900">
        {title}
        <span className="text-sm font-bold text-slate-400">{items.length}곳</span>
      </h2>
      <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
        {items.map((c) => (
          <li key={c.name}>
            <a
              href={carrierPath(c.name)}
              className="block rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-bold text-slate-800 no-underline transition hover:border-blue-300 hover:text-blue-700"
            >
              {c.name}
              {c.nameFormer && (
                <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">
                  (구) {c.nameFormer}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function CarrierIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/carrier#page`,
        url: `${SITE_URL}/carrier`,
        name: "보험사별 보험금 청구 안내",
        description: DESCRIPTION,
        inLanguage: "ko",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "청구닷컴", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: "보험사별 청구 안내",
            item: `${SITE_URL}/carrier`,
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-5 text-xs font-semibold text-slate-400">
        <a href="/" className="text-slate-600 no-underline hover:underline">
          청구닷컴
        </a>{" "}
        › 보험사별 청구 안내
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
          보험사별 보험금 청구 안내
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          보험사를 선택하면 <strong>필요서류 안내</strong>,{" "}
          <strong>보험금 청구서 PDF 양식</strong>, <strong>보험금청구 팩스번호</strong>,{" "}
          <strong>고객센터 전화번호</strong>를 한 화면에서 확인할 수 있습니다.
        </p>
      </header>

      <Group title="손해보험사" items={carriersByType["손해"]} />
      <Group title="생명보험사" items={carriersByType["생명"]} />
      <Group title="공제회사" items={carriersByType["공제회사"]} />

      <nav className="border-t border-slate-200 pt-5 text-sm">
        <a href="/" className="font-bold text-blue-700 no-underline hover:underline">
          ← 전체 청구 정보 한 화면으로 보기
        </a>
      </nav>
    </main>
  );
}
