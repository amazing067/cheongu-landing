import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SITE_URL,
  carriers,
  carrierPath,
  carrierUrl,
  findCarrier,
  pdfUpdated,
  splitPhones,
} from "@/lib/carriers";
import type { Carrier } from "@/types/carrier";

// 서버 컴포넌트로 두는 게 핵심이다. 홈은 검색 상자·아코디언 때문에 클라이언트 렌더인데,
// 이 페이지는 처음부터 완성된 HTML 로 나가야 네이버 크롤러도 팩스번호까지 읽어간다.

export const dynamicParams = false;

// 여기에는 인코딩하지 않은 원본 이름을 넘겨야 한다.
// encodeURIComponent 를 씌워 넘기면 Next 가 한 번 더 인코딩해 실제 주소가 404 가 된다.
export function generateStaticParams() {
  return carriers.map((c) => ({ name: c.name }));
}

type Props = { params: Promise<{ name: string }> };

function decodeName(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** 검색결과에 그대로 노출되는 문장 — 실제 번호를 넣어야 클릭률이 오른다. */
function buildDescription(c: Carrier): string {
  const L = c.links || {};
  const bits: string[] = [];
  if (L.fax) bits.push(`보험금청구 팩스 ${splitPhones(L.fax)[0]?.number ?? L.fax}`);
  if (L.cs) bits.push(`고객센터 ${L.cs}`);
  if (L.monitor) bits.push(`인콜 ${L.monitor}`);
  const numbers = bits.length ? ` ${bits.join(" · ")}.` : "";
  return `${c.name} 보험금 청구에 필요한 서류, 보험금 청구서 PDF 양식, 팩스번호, 고객센터 전화번호를 한 페이지에 정리했습니다.${numbers} 청구닷컴 — 프라임에셋 어메이징사업부`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const carrier = findCarrier(decodeName(name));
  if (!carrier) return {};

  const title = `${carrier.name} 보험금 청구 — 필요서류·청구서 PDF·팩스번호·고객센터 | 청구닷컴`;
  const description = buildDescription(carrier);

  return {
    title,
    description,
    keywords: [
      `${carrier.name} 보험금 청구`,
      `${carrier.name} 청구서류`,
      `${carrier.name} 보험금청구서`,
      `${carrier.name} 팩스번호`,
      `${carrier.name} 고객센터`,
      `${carrier.name} 청구서 양식`,
      "보험금 청구",
      "청구닷컴",
    ],
    alternates: { canonical: carrierPath(carrier.name) },
    openGraph: {
      type: "article",
      siteName: "청구닷컴",
      locale: "ko_KR",
      title,
      description,
      url: carrierPath(carrier.name),
      images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
    },
  };
}

function PhoneRow({ label, value }: { label: string; value?: string }) {
  const phones = splitPhones(value);
  if (!phones.length) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="w-28 shrink-0 text-sm font-bold text-slate-500">{label}</dt>
      <dd className="flex flex-wrap gap-x-4 gap-y-1">
        {phones.map((p) => (
          <a
            key={p.number}
            href={`tel:${p.tel}`}
            className="text-base font-extrabold text-slate-900 no-underline hover:text-blue-700"
          >
            {p.number}
            {p.label && (
              <span className="ml-1 text-xs font-semibold text-slate-400">
                {p.label}
              </span>
            )}
          </a>
        ))}
      </dd>
    </div>
  );
}

function LinkRow({
  label,
  href,
  external,
  download,
}: {
  label: string;
  href?: string;
  external?: boolean;
  download?: boolean;
}) {
  if (!href) return null;
  return (
    <li>
      <a
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 no-underline transition hover:border-blue-300 hover:text-blue-700"
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(download ? { download: "" } : {})}
      >
        {label}
      </a>
    </li>
  );
}

export default async function CarrierPage({ params }: Props) {
  const { name } = await params;
  const carrier = findCarrier(decodeName(name));
  if (!carrier) notFound();

  const L = carrier.links || {};
  const faxFirst = splitPhones(L.fax)[0]?.number;

  // 검색에서 실제로 들어오는 질문들 — 답 박스(FAQ 리치 결과)로 잡히도록 스키마에 싣는다.
  const faqs: { q: string; a: string }[] = [];
  if (faxFirst) {
    faqs.push({
      q: `${carrier.name} 보험금 청구 팩스번호는?`,
      a: `${carrier.name}의 보험금 청구 팩스번호는 ${L.fax} 입니다. 청구서와 필요서류를 팩스로 보내신 뒤 접수 여부를 고객센터로 확인하시는 것이 안전합니다.`,
    });
  }
  if (L.cs) {
    faqs.push({
      q: `${carrier.name} 고객센터 전화번호는?`,
      a: `${carrier.name} 고객센터는 ${L.cs} 입니다.${
        L.monitor ? ` 인콜 모니터링은 ${L.monitor} 입니다.` : ""
      }`,
    });
  }
  if (L.pdf) {
    faqs.push({
      q: `${carrier.name} 보험금 청구서 양식은 어디서 받나요?`,
      a: `이 페이지에서 ${carrier.name} 보험금 청구서 PDF 를 바로 내려받을 수 있습니다.${
        pdfUpdated ? ` 서식 기준일은 ${pdfUpdated.replace(/-/g, ".")} 입니다.` : ""
      }`,
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${carrierUrl(carrier.name)}#page`,
        url: carrierUrl(carrier.name),
        name: `${carrier.name} 보험금 청구 안내`,
        description: buildDescription(carrier),
        inLanguage: "ko",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@type": "Organization", name: carrier.name },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "청구닷컴", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "보험사별 청구 안내", item: `${SITE_URL}/carrier` },
          {
            "@type": "ListItem",
            position: 3,
            name: carrier.name,
            item: carrierUrl(carrier.name),
          },
        ],
      },
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ]
        : []),
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
        ›{" "}
        <a href="/carrier" className="text-slate-600 no-underline hover:underline">
          보험사별 청구 안내
        </a>{" "}
        › {carrier.name}
      </nav>

      <header className="mb-7">
        <p className="mb-1 text-xs font-bold text-blue-700">
          {carrier.type === "공제회사" ? "공제회사" : `${carrier.type}보험사`}
        </p>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl">
          {carrier.name} 보험금 청구 안내
        </h1>
        {carrier.nameFormer && (
          <p className="mt-1 text-sm font-semibold text-slate-400">
            (구) {carrier.nameFormer}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {carrier.name} 보험금 청구에 필요한 <strong>서류 안내</strong>,{" "}
          <strong>보험금 청구서 PDF 양식</strong>, <strong>팩스번호</strong>,{" "}
          <strong>고객센터 전화번호</strong>를 한 곳에 모았습니다.
        </p>
      </header>

      {/* 번호가 하나도 없는 보험사면 빈 카드만 남으므로 섹션째 숨긴다 */}
      {(L.cs || L.monitor || L.helpdesk || L.fax) && (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-1 text-lg font-black text-slate-900">
            {carrier.name} 전화번호 · 팩스번호
          </h2>
          <p className="mb-2 text-xs text-slate-400">
            번호를 누르면 바로 연결됩니다.
          </p>
          <dl>
            <PhoneRow label="고객센터" value={L.cs} />
            <PhoneRow label="인콜 모니터링" value={L.monitor} />
            <PhoneRow label="헬프데스크" value={L.helpdesk} />
            <PhoneRow label="보험금청구 FAX" value={L.fax} />
          </dl>
        </section>
      )}

      {(L.pdf || L.dental || L.guide || L.terms || L.support || L.system) && (
      <section className="mb-8">
        <h2 className="mb-1 text-lg font-black text-slate-900">
          {carrier.name} 청구 서류 · 바로가기
        </h2>
        {pdfUpdated && L.pdf && (
          <p className="mb-3 text-xs text-slate-400">
            청구서 서식 업데이트 {pdfUpdated.replace(/-/g, ".")}
          </p>
        )}
        <ul className="flex list-none flex-wrap gap-2 p-0">
          <LinkRow label="📄 보험금 청구서 PDF 내려받기" href={L.pdf} download />
          <LinkRow label="🦷 치과치료확인서" href={L.dental} download />
          <LinkRow label="📋 필요서류 안내" href={L.guide} external />
          <LinkRow label="📘 약관 확인" href={L.terms} external />
          <LinkRow label="🏠 홈페이지" href={L.support} external />
          <LinkRow label="💻 전산 접속" href={L.system} external />
        </ul>
      </section>
      )}

      {faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-black text-slate-900">자주 묻는 질문</h2>
          <dl className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-sm font-extrabold text-slate-900">{f.q}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mb-8 rounded-2xl bg-slate-50 p-5">
        <h2 className="mb-2 text-base font-black text-slate-900">
          보험금 청구, 이 순서로 하시면 됩니다
        </h2>
        <ol className="ml-4 list-decimal space-y-1.5 text-sm leading-relaxed text-slate-600">
          <li>위 &ldquo;필요서류 안내&rdquo;에서 청구 사유별 서류를 확인합니다.</li>
          <li>보험금 청구서 PDF 를 내려받아 작성합니다.</li>
          <li>진단서·영수증 등 서류를 함께 준비합니다.</li>
          <li>
            {faxFirst
              ? `팩스(${faxFirst}) 또는 모바일 앱으로 접수합니다.`
              : "팩스 또는 모바일 앱으로 접수합니다."}
          </li>
          <li>
            {L.cs
              ? `접수 여부를 고객센터(${L.cs})로 확인합니다.`
              : "접수 여부를 고객센터로 확인합니다."}
          </li>
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          ※ 보장 여부와 필요 서류는 가입하신 상품의 약관에 따라 다릅니다. 정확한 내용은
          해당 보험사 또는 담당 설계사에게 확인하세요.
        </p>
      </section>

      <nav className="border-t border-slate-200 pt-5 text-sm">
        <a href="/" className="font-bold text-blue-700 no-underline hover:underline">
          ← 전체 보험사 청구 정보 보러가기
        </a>
      </nav>
    </main>
  );
}
