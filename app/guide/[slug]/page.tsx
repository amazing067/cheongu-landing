import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
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

        디자인 규칙은 globals.css 의 .recruit-cards 주석을 따른다.
        이모지·그라데이션·어두운 배경 없이, 색은 로고에서 뽑은 빨강·주황 두 가지.
        눈에 띄게 하는 일은 색을 어둡게 하는 게 아니라 로고와 굵은 밑줄이 한다.
      */}
      <div className="guide-cta mt-6">
        <div className="gc-top">
          <BrandMark variant="full" height={32} />
          <span className="gc-site">청구닷컴</span>
        </div>
        <p className="gc-h">
          팩스번호만 찾으러 오셨나요? 여기가 <span className="u">그 다음</span>입니다
        </p>
        <p className="gc-lead">
          보험사 <b>41곳</b>의 필요서류와 청구서 PDF, 전산 접속 주소까지 한 곳에
          있습니다. 청구를 도우면서 매번 찾아 헤매던 것들입니다.
        </p>
        <p className="gc-lead">
          어메이징사업부가 직접 만들어 쓰는 <b>영업 시스템 29개</b> 중 하나를
          공개한 것입니다.
        </p>
        <div className="gc-actions">
          <Link href="/" className="gc-btn">
            보험사 41곳 청구정보 보기
          </Link>
          <a
            href="https://xn--h32b21du9cf7grcy2k20f.com"
            target="_blank"
            rel="noopener noreferrer"
            className="gc-btn2"
          >
            영업 시스템 둘러보기
          </a>
        </div>
      </div>

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
        표를 다 본 사람용 출구. 상단에서 이미 한 번 말했으니 여기서는 짧게,
        대신 설계사라면 걸릴 말을 한 줄 얹는다.
      */}
      <div className="guide-cta guide-cta--end mt-10">
        <p className="gc-h">찾으시는 번호가 없었나요?</p>
        <p className="gc-lead">
          보험사 <b>41곳</b>의 청구 서류와 연락처를 전부 정리해 뒀습니다.
          종수술분류표, 실손 계산기, 상급종합병원 목록도 함께 있습니다.
        </p>
        <div className="gc-actions">
          <Link href="/" className="gc-btn">
            청구닷컴 전체 보기
          </Link>
          <a
            href="https://xn--h32b21du9cf7grcy2k20f.com"
            target="_blank"
            rel="noopener noreferrer"
            className="gc-btn2"
          >
            영업 시스템 둘러보기
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
