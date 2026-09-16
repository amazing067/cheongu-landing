import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { carrierPath, carriers, SITE_URL } from "@/lib/carriers";
import { findGuide, guidePath, guideUrl, guides } from "@/lib/guides";
import { FAX_LIMITS } from "@/lib/fax-limits";

// 서버 컴포넌트. 표·주의사항·FAQ 가 전부 HTML 로 나가므로 크롤러가 읽을
// 실질 콘텐츠가 확보된다.

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
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
  const guide = findGuide(decodeSlug((await params).slug));
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: guidePath(guide.slug) },
    openGraph: {
      type: "article",
      siteName: "청구닷컴",
      locale: "ko_KR",
      title: guide.title,
      description: guide.description,
      url: guidePath(guide.slug),
      images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
    },
  };
}

const isFaxNumber = (fax?: string) => /^[0-9]/.test(fax?.trim() ?? "");

/** 번호가 없는 회사가 왜 없는지 — 표에 그대로 들어갈 한 줄 */
function noFaxNote(fax: string): string {
  if (fax.includes("발급")) return "고객센터에서 가상번호 발급";
  if (fax.includes("폐지")) return "팩스 접수 종료 · 앱으로 접수";
  return "공개된 번호 없음 · 고객센터 문의";
}

export default async function GuidePage({ params }: Props) {
  const guide = findGuide(decodeSlug((await params).slug));
  if (!guide) notFound();

  const withFax = carriers.filter((c) => isFaxNumber(c.links?.fax));
  const withoutFax = carriers.filter(
    (c) => c.links?.fax && !isFaxNumber(c.links.fax),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.h1,
        description: guide.description,
        inLanguage: "ko",
        mainEntityOfPage: guideUrl(guide.slug),
        publisher: { "@id": `${SITE_URL}/#org` },
        dateModified: "2026-09-16",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "청구닷컴", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: guide.h1, item: guideUrl(guide.slug) },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="maxw pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="pt-6 text-xs text-slate-400">
        <Link href="/" className="no-underline hover:underline">
          청구닷컴
        </Link>{" "}
        › {guide.h1}
      </nav>

      <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
        {guide.h1}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{guide.lead}</p>
      <p className="mt-1 text-xs text-slate-400">
        공식 홈페이지 기준 · 최종 확인 2026.09.16
      </p>

      {/*
        검색에서 이 페이지로 바로 들어온 사람은 청구닷컴이 뭘 하는 곳인지 모른다.
        팩스번호만 얻고 나가면 사이트를 본 적도 없는 셈이다.

        온통 흰 페이지에서 이 블록만 짙은 남색으로 두어, 표를 읽기 전에 눈이
        한 번 걸리게 한다. 사이트의 다른 카드와 같은 모양을 쓰면 또 하나의
        내용 카드로 읽혀 그냥 지나친다.
      */}
      <Link
        href="/"
        className="mt-6 block rounded-2xl bg-slate-900 px-6 py-7 no-underline transition hover:bg-slate-800 sm:px-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div>
            <p className="text-lg font-black leading-snug text-white sm:text-xl">
              팩스번호만 찾으러 오셨나요?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              필요서류와 청구서 PDF, 전산 접속까지
              <br className="hidden sm:block" />{" "}
              보험사 <span className="font-extrabold text-white">41곳</span>을 한
              곳에 모아뒀습니다.
            </p>
          </div>
          <span className="shrink-0 rounded-xl bg-white px-6 py-3.5 text-center text-sm font-black text-slate-900">
            보험사 41곳 보러가기
          </span>
        </div>
      </Link>

      {/* 먼저 경고한다. 한도를 모르고 보내면 반려된다 */}
      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="mb-1.5 text-base font-black text-slate-900">
          보내기 전에 — 팩스는 금액 한도가 있습니다
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          거의 모든 보험사가 팩스 접수에 금액 상한을 둡니다. 한도를 넘겨 보내면
          접수되지 않고, 원본 서류를 우편이나 방문으로 다시 내야 합니다. 보낸
          뒤에는 고객센터로 접수 여부를 꼭 확인하세요.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-black text-slate-900">
          팩스번호가 있는 보험사 {withFax.length}곳
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          회사명을 누르면 필요서류·청구서 PDF 까지 볼 수 있습니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">보험사</th>
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">보험금청구 팩스</th>
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">금액 한도</th>
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">고객센터</th>
              </tr>
            </thead>
            <tbody>
              {withFax.map((c) => (
                <tr key={c.name} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 font-bold">
                    <Link href={carrierPath(c.name)} className="no-underline hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-bold text-slate-900">
                    {c.links?.fax}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {FAX_LIMITS[c.name] ?? (
                      <span className="text-slate-400">공식 안내 없음</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {c.links?.cs ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-black text-slate-900">
          팩스번호가 따로 없는 보험사 {withoutFax.length}곳
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          번호를 찾아 헤매지 마세요. 공식 안내가 아래와 같이 되어 있습니다.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">보험사</th>
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">접수 방법</th>
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">금액 한도</th>
                <th className="whitespace-nowrap px-4 py-3 font-extrabold">고객센터</th>
              </tr>
            </thead>
            <tbody>
              {withoutFax.map((c) => (
                <tr key={c.name} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 font-bold">
                    <Link href={carrierPath(c.name)} className="no-underline hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {noFaxNote(c.links?.fax ?? "")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {FAX_LIMITS[c.name] ?? (
                      <span className="text-slate-400">공식 안내 없음</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {c.links?.cs ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-slate-50 p-5">
        <h2 className="mb-2 text-base font-black text-slate-900">알아두면 좋은 것</h2>
        <ul className="ml-4 list-disc space-y-1.5 text-sm leading-relaxed text-slate-600">
          <li>
            같은 보험사라도 <b>청구 종류에 따라 팩스번호가 다릅니다.</b> KB손해보험은
            장기보험 상해·질병, 일반보험(단체), 재물배상이 각각 다른 번호입니다.
          </li>
          <li>
            <b>가상 팩스번호는 유효기간이 있습니다.</b> 우체국보험은 발급받은 번호를
            기간이 지난 뒤 다시 쓰면 접수되지 않아 재발급이 필요합니다.
          </li>
          <li>
            <b>사망·장해·진단 보험금은 대개 팩스로 받지 않습니다.</b> 원본 서류를
            우편이나 방문으로 제출해야 합니다.
          </li>
          <li>
            <b>접수 시간이 정해진 곳도 있습니다.</b> MG새마을금고는 09:30~15:30 에
            도착한 팩스만 당일 접수됩니다.
          </li>
          <li>
            번호는 회사 사정으로 바뀔 수 있습니다. 중요한 청구라면 보내기 전에
            고객센터로 한 번 확인하시는 편이 안전합니다.
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-black text-slate-900">자주 묻는 질문</h2>
        <dl className="space-y-4">
          {guide.faqs.map((f) => (
            <div key={f.q} className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm font-extrabold text-slate-900">{f.q}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
        표를 다 본 사람용 출구. 상단 배너와 같은 남색을 또 쓰면 두 번 소리치는
        꼴이라, 여기는 흰 바탕에 굵은 테두리로 조용하게 두되 누를 것이 분명하게.
      */}
      <Link
        href="/"
        className="mt-10 block rounded-2xl border-2 border-slate-900 bg-white px-6 py-6 text-center no-underline transition hover:bg-slate-50 sm:px-8"
      >
        <span className="block text-base font-black text-slate-900 sm:text-lg">
          찾으시는 번호가 없었나요?
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-slate-600">
          보험사 41곳의 청구 서류와 연락처를 전부 정리해 뒀습니다
        </span>
        <span className="mt-4 inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-black text-white">
          청구닷컴 전체 보기
        </span>
      </Link>

      <Footer />
    </main>
  );
}
