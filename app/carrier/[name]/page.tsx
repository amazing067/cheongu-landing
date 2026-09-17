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
import { Footer } from "@/components/Footer";

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

/**
 * fax 필드에는 실제 번호 대신 "폐지·앱 접수" / "콜센터 발급" / "고객센터 전화"
 * 같은 상태 문구가 들어가는 회사가 있다. 이걸 번호처럼 문장에 끼워 넣으면
 * "팩스번호는 콜센터 발급 입니다" 같은 문장이 검색결과로 나간다.
 */
function isFaxNumber(fax?: string): boolean {
  return /^[0-9]/.test(fax?.trim() ?? "");
}

/** 받침에 따라 은/는 을 고른다. "흥국화재은" 같은 문장이 검색결과로 나가지 않도록. */
function eunNeun(word: string): string {
  const last = word.trim().slice(-1).charCodeAt(0);
  const isHangul = last >= 0xac00 && last <= 0xd7a3;
  if (!isHangul) return "는";
  return (last - 0xac00) % 28 === 0 ? "는" : "은";
}

/** 전화번호 표 밑에 붙는 안내 한 줄. FAQ 답변과 같은 내용을 안내체로 짧게 쓴다. */
/**
 * 「발급」 회사 중 우체국보험만 공식 안내에 팩스 조건이 따로 적혀 있다.
 * (청구금액당 100만원 이하 / 발급받은 가상 팩스번호는 유효기간 경과 시 재발급)
 * 한화생명·하나생명·수협·신협에는 해당 없는 조건이라 공통 문구에 섞지 않는다.
 */
function faxIssuedExtra(name: string): string {
  if (name !== "우체국보험") return "";
  return " 팩스 접수는 청구금액 100만원 이하만 가능하며, 발급받은 번호는 유효기간이 지나면 쓸 수 없어 재발급받아야 합니다.";
}

function faxNoticeLine(name: string, fax: string, cs?: string): string {
  const subject = `${name}${eunNeun(name)}`;
  const center = cs ? `고객센터(${cs})` : "고객센터";
  if (fax.includes("폐지")) {
    return `${subject} 보험금 청구 팩스 접수를 종료했습니다. 모바일 앱 또는 홈페이지에서 서류를 사진으로 올려 접수해 주세요.`;
  }
  if (fax.includes("발급")) {
    return `${subject} 고정된 팩스번호가 없습니다. ${center}에 전화해 본인 확인을 거치면 가상 팩스번호를 발급해 드립니다.${faxIssuedExtra(name)}`;
  }
  return `${subject} 공개된 팩스번호가 없습니다. ${center}로 전화해 접수 방법을 안내받으시거나 모바일 앱으로 접수해 주세요.`;
}

/** 번호가 없는 회사의 팩스 안내 문장. 상태 문구별로 실제 접수 방법을 풀어 쓴다. */
function faxNoticeAnswer(name: string, fax: string, cs?: string): string {
  const subject = `${name}${eunNeun(name)}`;
  const center = cs ? `고객센터(${cs})` : "고객센터";
  if (fax.includes("폐지")) {
    return `${subject} 보험금 청구 팩스 접수를 종료했습니다. 모바일 앱 또는 홈페이지에서 서류를 사진으로 올려 접수하시면 됩니다. 문의는 ${center}로 하시면 됩니다.`;
  }
  if (fax.includes("발급")) {
    return `${subject} 고정된 팩스번호가 없습니다. ${center}에 전화해 본인 확인을 거치면 가상 팩스번호를 발급해 주며, 그 번호로 서류를 보내시면 됩니다.${faxIssuedExtra(name)}`;
  }
  return `${subject} 공개된 팩스번호가 없습니다. ${center}로 전화해 접수 방법을 안내받으시거나 모바일 앱으로 접수하시면 됩니다.`;
}

/** 검색결과에 그대로 노출되는 문장 — 실제 번호를 넣어야 클릭률이 오른다. */
function buildDescription(c: Carrier): string {
  const L = c.links || {};
  const bits: string[] = [];
  if (isFaxNumber(L.fax)) {
    bits.push(`보험금청구 팩스 ${splitPhones(L.fax)[0]?.number ?? L.fax}`);
  } else if (L.fax?.includes("폐지")) {
    bits.push("보험금청구 팩스 접수 종료");
  }
  if (L.cs) bits.push(`고객센터 ${L.cs}`);
  if (L.monitor) bits.push(`인콜 ${L.monitor}`);
  const numbers = bits.length ? ` ${bits.join(" · ")}.` : "";
  return `${c.name} 보험금 청구에 필요한 서류, 보험금 청구서 PDF 양식, 팩스번호, 고객센터 전화번호를 한 페이지에 정리했습니다.${numbers} 청구닷컴 — 프라임에셋 어메이징사업부`;
}

/**
 * 검색결과 제목.
 *
 * 실측 근거 (2026-09, 네이버·구글 실제 검색결과를 열어 확인)
 *
 * 1) 브랜드 접미사는 넣지 않는다.
 *    네이버는 제목 끝의 "| 청구닷컴" 을 스스로 떼고 사이트명을 제목 위에 따로
 *    붙인다. 구글도 제목과 별개로 사이트명 줄을 보여준다. 제목에 또 넣으면
 *    중복이고 자리만 먹는다.
 *
 * 2) 제목은 생각보다 훨씬 일찍 잘린다.
 *    「메리츠화재 보험금청구 팩스번호」 구글 검색에서 옛 제목 44자가 32자에서
 *    잘렸다. 잘려나간 것은 "·고객센터 | 청구닷컴" 이다. 역산하면 한계는
 *    약 458px(20px 기준)로, 흔히 말하는 "구글 55~60자" 보다 훨씬 좁다.
 *    → 고객센터 번호를 제목에 넣어봐야 잘려서 보이지 않는다.
 *
 * 3) 고객센터·인콜 번호는 설명(description)에 이미 전부 나간다.
 *    네이버 검색결과에 "팩스 0505-021-3400 · 고객센터 1566-7711 · 인콜
 *    1577-7711" 이 그대로 노출되는 것을 확인했다. 구글은 FAQ 구조화데이터의
 *    답변을 설명으로 쓴다.
 *
 * 4) "보험금청구" 는 유지한다.
 *    실측 검색어에서 긴형("<회사> 보험금청구 팩스번호") 노출이 짧은형보다
 *    22.8% 많다(2,243 vs 1,827). 자리가 남으므로 뺄 이유가 없다.
 *
 * 대리점명(프라임에셋 어메이징사업부)도 제목에 넣지 않는다. 보험사명과
 * 모집조직명이 한 제목에 나란히 놓이면 광고로 해석될 여지가 있다.
 * 설명·푸터·구조화데이터에는 이미 들어가 있다.
 */
function buildTitle(c: Carrier): string {
  const L = c.links || {};
  const fax = (L.fax || "").trim();

  if (isFaxNumber(fax)) {
    return `${c.name} 보험금청구 팩스번호 ${splitPhones(fax)[0]?.number ?? fax}`;
  }
  if (fax.includes("발급")) {
    return `${c.name} 보험금청구 팩스번호 고객센터 발급${L.cs ? ` ${L.cs}` : ""}`;
  }
  // 「폐지·앱 접수」 / 「고객센터 전화」 / 값 없음 — 고객센터 검색을 노린다
  return L.cs
    ? `${c.name} 보험금청구 고객센터 ${L.cs}`
    : `${c.name} 보험금 청구서 양식·필요서류`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const carrier = findCarrier(decodeName(name));
  if (!carrier) return {};

  const title = buildTitle(carrier);
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

/**
 * 팩스번호가 청구 종류별로 나뉜 회사가 있다.
 * (메리츠화재 질병/상해, 라이나손해보험 일반/치아)
 * 데이터에는 "번호(라벨) | 번호(라벨)" 로 들어오는데, 그대로 문장에 넣으면
 * 파이프 기호가 그대로 읽힌다. FAQ 답변용으로 사람 말처럼 풀어 쓴다.
 */
function faxSentence(fax?: string): string {
  const ps = splitPhones(fax);
  if (ps.length <= 1) return fax ?? "";
  return ps.map((p) => (p.label ? `${p.label} ${p.number}` : p.number)).join(", ");
}

function PhoneRow({ label, value }: { label: string; value?: string }) {
  const phones = splitPhones(value);
  if (!phones.length) return null;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="w-28 shrink-0 text-sm font-bold text-slate-500">{label}</dt>
      <dd className="flex flex-wrap gap-x-4 gap-y-1">
        {phones.map((p) =>
          // 숫자가 없는 값("폐지·앱 접수" 등)까지 링크로 만들면 href="tel:" 인
          // 죽은 링크가 된다. 모바일에서 눌리는데 아무 반응이 없다.
          p.tel ? (
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
          ) : (
            <span key={p.number} className="text-base font-extrabold text-slate-400">
              {p.number}
            </span>
          )
        )}
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

/**
 * 상세페이지 하단 「빠른 도구」.
 * 검색으로 상세페이지에 바로 들어온 사람은 홈에만 있는 도구를 못 보고 나간다.
 * 청구 용무(번호 확인 → 청구서 PDF)가 끝난 자리에 두어 흐름을 끊지 않는다.
 * 계산기 두 개는 홈 안의 패널이라 홈으로 보낸다.
 * (홈의 「청약서 발송 주소록」은 모달이라 링크로 걸 자리가 없어 제외했다)
 */
const QUICK_TOOLS: { emoji: string; label: string; href: string; external?: boolean }[] = [
  { emoji: "📠", label: "보험사별 팩스번호", href: "/guide/보험금청구-팩스번호" },
  { emoji: "💧", label: "누수 배상 청구", href: "/guide/누수-배상책임-청구" },
  { emoji: "🔬", label: "종수술분류표", href: "/tools/op-surgery-codes.html" },
  { emoji: "🧮", label: "실손 계산기", href: "/#medcalc" },
  { emoji: "📊", label: "실손 변천사", href: "/tools/history.html" },
  { emoji: "🎂", label: "보험나이 계산기", href: "/#calc-panels" },
  {
    emoji: "🔁",
    label: "계약전환 간편계산기",
    href: "https://www.e-insmarket.or.kr/mins/minsInsCal.knia",
    external: true,
  },
  { emoji: "🏥", label: "상급종합병원", href: "/tools/tertiary-hospitals.html" },
  { emoji: "🏨", label: "간호간병 병원", href: "/tools/care-hospitals.html" },
];

export default async function CarrierPage({ params }: Props) {
  const { name } = await params;
  const carrier = findCarrier(decodeName(name));
  if (!carrier) notFound();

  const L = carrier.links || {};
  const faxFirst = splitPhones(L.fax)[0]?.number;
  const hasFaxNumber = isFaxNumber(L.fax);

  // 검색에서 실제로 들어오는 질문들 — 답 박스(FAQ 리치 결과)로 잡히도록 스키마에 싣는다.
  const faqs: { q: string; a: string }[] = [];
  if (hasFaxNumber) {
    faqs.push({
      q: `${carrier.name} 보험금 청구 팩스번호는?`,
      a: `${carrier.name}의 보험금 청구 팩스번호는 ${faxSentence(L.fax)} 입니다. 청구서와 필요서류를 팩스로 보내신 뒤 접수 여부를 고객센터로 확인하시는 것이 안전합니다.`,
    });
  } else if (L.fax) {
    faqs.push({
      q: `${carrier.name} 보험금 청구 팩스번호는?`,
      a: faxNoticeAnswer(carrier.name, L.fax, L.cs),
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
    <>
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
          {!hasFaxNumber && L.fax && (
            <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              ※ {faxNoticeLine(carrier.name, L.fax, L.cs)}
            </p>
          )}
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

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 text-lg font-black text-slate-900">빠른 도구</h2>
        <p className="mb-3 text-xs text-slate-400">
          청구 전에 확인하면 좋은 자료들입니다.
        </p>
        <div className="tools open">
          {QUICK_TOOLS.map((t) => (
            <a
              key={t.label}
              href={t.href}
              className="tool-pill"
              {...(t.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              <span className="em" aria-hidden>
                {t.emoji}
              </span>
              {t.label}
            </a>
          ))}
        </div>
      </section>

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
            {hasFaxNumber
              ? `팩스(${faxFirst}) 또는 모바일 앱으로 접수합니다.`
              : "모바일 앱 또는 홈페이지로 접수합니다."}
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
    <Footer />
    </>
  );
}
