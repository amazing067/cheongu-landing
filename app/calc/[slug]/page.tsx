import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgeCalculator } from "@/components/AgeCalculator";
import { MedCalculator } from "@/components/MedCalculator";
import { SITE_URL } from "@/lib/carriers";
import { calcPath, calcUrl, calculators, findCalculator } from "@/lib/calculators";

// 서버 컴포넌트. 계산기 위젯 자체는 클라이언트 컴포넌트지만, 제목·설명 본문·FAQ 는
// 서버에서 HTML 로 나가므로 크롤러가 읽을 실질 콘텐츠가 확보된다.

export const dynamicParams = false;

// 인코딩하지 않은 원본 슬러그를 넘긴다 — 인코딩해 넘기면 Next 가 이중 인코딩해 404 가 된다.
export function generateStaticParams() {
  return calculators.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const calc = findCalculator(decodeSlug(slug));
  if (!calc) return {};

  return {
    title: calc.title,
    description: calc.description,
    keywords: calc.keywords,
    alternates: { canonical: calcPath(calc.slug) },
    openGraph: {
      type: "article",
      siteName: "청구닷컴",
      locale: "ko_KR",
      title: calc.title,
      description: calc.description,
      url: calcPath(calc.slug),
      images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function CalcPage({ params }: Props) {
  const { slug } = await params;
  const calc = findCalculator(decodeSlug(slug));
  if (!calc) notFound();

  const other = calculators.find((c) => c.slug !== calc.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${calcUrl(calc.slug)}#app`,
        name: calc.h1,
        url: calcUrl(calc.slug),
        description: calc.description,
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        inLanguage: "ko",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "청구닷컴", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: calc.h1,
            item: calcUrl(calc.slug),
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: calc.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
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
        › {calc.h1}
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
          {calc.h1}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {calc.description}
        </p>
      </header>

      <div className="mb-10">
        {calc.widget === "age" ? <AgeCalculator /> : <MedCalculator />}
      </div>

      {calc.body.map((section) => (
        <section key={section.heading} className="mb-8">
          <h2 className="mb-2 text-lg font-black text-slate-900">
            {section.heading}
          </h2>
          {section.paragraphs.map((p, i) => (
            <p key={i} className="mb-2 text-sm leading-relaxed text-slate-600">
              {p}
            </p>
          ))}
        </section>
      ))}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-black text-slate-900">자주 묻는 질문</h2>
        <dl className="space-y-4">
          {calc.faqs.map((f) => (
            <div key={f.q} className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm font-extrabold text-slate-900">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {f.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-sm">
        <a href="/" className="font-bold text-blue-700 no-underline hover:underline">
          ← 보험사별 청구 정보 보러가기
        </a>
        {other && (
          <a
            href={calcPath(other.slug)}
            className="font-bold text-slate-500 no-underline hover:underline"
          >
            {other.h1} →
          </a>
        )}
        <a
          href="/tools/history.html"
          className="font-bold text-slate-500 no-underline hover:underline"
        >
          실손보험 세대별 비교표 →
        </a>
      </nav>
    </main>
  );
}
