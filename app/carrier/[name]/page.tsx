import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SITE_URL,
  carriers,
  carrierPath,
  carrierUrl,
  findCarrier,
  faxUpdated,
  pdfUpdated,
  splitPhones,
} from "@/lib/carriers";
import type { Carrier } from "@/types/carrier";
import { FAX_LIMITS } from "@/lib/fax-limits";
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

function faxNoticeLine(name: string, fax: string, cs?: string, mobileUpload?: string): string {
  const subject = `${name}${eunNeun(name)}`;
  const center = cs ? `고객센터(${cs})` : "고객센터";
  if (fax.includes("폐지") && mobileUpload) {
    return `${subject} 보험금 청구 팩스 접수를 종료했습니다. 대신 로그인 없이 링크에서 서류 사진을 올리는 「모바일 청구」 창구가 있습니다 — 아래 버튼으로 여세요.`;
  }
  if (fax.includes("폐지")) {
    return `${subject} 보험금 청구 팩스 접수를 종료했습니다. 모바일 앱 또는 홈페이지에서 서류를 사진으로 올려 접수해 주세요.`;
  }
  if (fax.includes("발급")) {
    return `${subject} 고정된 팩스번호가 없습니다. ${center}에 전화해 본인 확인을 거치면 가상 팩스번호를 발급해 드립니다.${faxIssuedExtra(name)}`;
  }
  return `${subject} 공개된 팩스번호가 없습니다. ${center}로 전화해 접수 방법을 안내받으시거나 모바일 앱으로 접수해 주세요.`;
}

/** 번호가 없는 회사의 팩스 안내 문장. 상태 문구별로 실제 접수 방법을 풀어 쓴다. */
function faxNoticeAnswer(name: string, fax: string, cs?: string, mobileUpload?: string): string {
  const subject = `${name}${eunNeun(name)}`;
  const center = cs ? `고객센터(${cs})` : "고객센터";
  if (fax.includes("폐지") && mobileUpload) {
    return `${subject} 보험금 청구 팩스 접수를 종료했습니다. 대신 로그인 없이 링크에서 피보험자 정보를 넣고 서류 사진을 올리는 「모바일 청구」 창구로 접수하시면 됩니다. 문의는 ${center}로 하시면 됩니다.`;
  }
  if (fax.includes("폐지")) {
    return `${subject} 보험금 청구 팩스 접수를 종료했습니다. 모바일 앱 또는 홈페이지에서 서류를 사진으로 올려 접수하시면 됩니다. 문의는 ${center}로 하시면 됩니다.`;
  }
  if (fax.includes("발급")) {
    return `${subject} 고정된 팩스번호가 없습니다. ${center}에 전화해 본인 확인을 거치면 가상 팩스번호를 발급해 주며, 그 번호로 서류를 보내시면 됩니다.${faxIssuedExtra(name)}`;
  }
  return `${subject} 공개된 팩스번호가 없습니다. ${center}로 전화해 접수 방법을 안내받으시거나 모바일 앱으로 접수하시면 됩니다.`;
}

/**
 * 「청구 전에 알아둘 것」에 들어갈 회사별 사실.
 *
 * 구글 서치콘솔 기준(2026-09-18) 보험사 41곳 중 색인된 것이 31개뿐이고
 * 55개가 「크롤링됨/발견됨 — 색인 생성 안 됨」이었다. 실제로 재보니 상세페이지
 * 본문이 1,100자뿐인데 페이지끼리 최대 89.6% 가 같았다. 구글이 중복으로 본 것이다.
 *
 * 그래서 회사마다 실제로 다른 사실을 본문에 드러낸다.
 * ★ 지어내지 않는다. links.json 과 lib/fax-limits.ts 에 검증해 둔 값만 쓴다.
 */
type Fact = { label: string; text: string; hi?: boolean };

/**
 * 본문 안의 **강조** 를 굵게 + 주황 밑줄로 바꾼다. 가이드 페이지와 같은 표기법.
 * 팩스번호와 금액 한도는 이 페이지에서 사람들이 찾아온 값이라 눈에 걸려야 한다.
 */
function Mark({ t }: { t: string }) {
  return (
    <>
      {t.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <b key={i} className="amt">
            {part}
          </b>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** JSON-LD·메타에는 ** 표기가 들어가면 안 된다 */
const plain = (t: string) => t.replace(/\*\*/g, "");

/**
 * 팩스 한도 값을 문장으로 만든다.
 * 값이 세 가지 형태로 들어온다.
 *   "100만원 이하"                          → 보통
 *   "제한 없음"                             → 흥국화재 (콜센터 확인)
 *   "실손 제한 없음 / 정액담보 200만원 미만"   → 삼성화재 (담보별로 다름)
 * "팩스 접수에 제한 없음 상한을 두고 있습니다" 같은 문장이 나가지 않게 나눈다.
 */
function limitSentence(name: string, limit: string): string {
  const subject = `${name}${eunNeun(name)}`;
  if (limit === "제한 없음") {
    return `${subject} 팩스 접수에 **금액 상한이 없습니다**. 다만 팩스는 보낸 쪽에서 도착 여부를 알 수 없으니 접수 확인은 하시는 편이 안전합니다.`;
  }
  if (limit.includes("/")) {
    return `${subject} 청구 담보에 따라 팩스 상한이 다릅니다 — **${limit}**. 상한을 넘는 건은 원본 서류를 등기우편이나 방문으로 내셔야 합니다.`;
  }
  return `${subject} 팩스로는 **${limit}** 건만 접수됩니다. 상한을 넘으면 원본 서류를 등기우편이나 방문으로 내셔야 합니다.`;
}

/** 「이 순서로」 4단계에 덧붙일 짧은 한 마디. 상한이 없으면 아무 말도 붙이지 않는다 */
function limitStepNote(name: string): string {
  const limit = FAX_LIMITS[name];
  if (!limit || limit === "제한 없음") return "";
  if (limit.includes("/")) return ` 담보에 따라 상한이 다릅니다 — ${limit}.`;
  return ` ${limit} 건만 접수되니, 넘으면 원본 서류를 등기우편이나 방문으로 내셔야 합니다.`;
}

function carrierFacts(c: Carrier): Fact[] {
  const L = c.links || {};
  const name = c.name;
  const center = L.cs ? `고객센터(${L.cs})` : "고객센터";
  const fax = (L.fax || "").trim();
  const limit = FAX_LIMITS[name];
  const out: Fact[] = [];

  // 접수 방법 — 팩스 값의 형태가 회사마다 다섯 가지다
  if (isFaxNumber(fax)) {
    const ps = splitPhones(fax);
    out.push({
      label: "접수 방법",
      text:
        ps.length > 1
          ? `청구 종류에 따라 팩스번호가 나뉩니다 — ${ps
              .map((p) => (p.label ? `${p.label} **${p.number}**` : `**${p.number}**`))
              .join(", ")}. 어느 쪽으로 보낼지 확인하고 보내세요.`
          : `팩스 **${ps[0].number}** 로 보내시면 됩니다. 팩스는 보낸 쪽에서 도착 여부를 알 수 없으니 ${center}로 접수 확인까지 하시는 편이 안전합니다.`,
    });
  } else {
    out.push({ label: "접수 방법", text: faxNoticeAnswer(name, fax, L.cs, L.mobileUpload) });
  }

  // 로그인 없는 모바일 청구 창구 — 링크(QR)에서 서류 사진만 올리면 된다
  if (L.mobileUpload) {
    out.push({
      label: "링크로 서류 제출",
      text: `${name}${eunNeun(name)} **로그인 없이** 링크에서 피보험자 정보를 넣고 서류 사진을 올려 청구할 수 있습니다. 앱을 깔지 않아도 되고, 고객 옆에서 설계사가 대신 올려 드리기도 쉽습니다. 휴대폰에서 여는 것을 권합니다.`,
      hi: true,
    });
  }

  // 설계사 대리접수 — 각 사가 공식으로 열어 둔 창구만 싣는다
  if (L.agentClaim) {
    out.push({
      label: "설계사 대리접수",
      text: `${name}${eunNeun(name)} 담당 설계사가 고객 대신 접수하는 공식 창구가 있습니다 — **${L.agentClaim.how}**. 고객의 청구 동의와 서명은 반드시 받아야 합니다.`,
    });
  }

  // 팩스 금액 한도 — 41곳 중 공식에서 확인된 곳은 14곳뿐이다
  if (limit) {
    out.push({ label: "팩스 금액 한도", text: limitSentence(name, limit), hi: true });
  } else if (isFaxNumber(fax)) {
    out.push({
      label: "팩스 금액 한도",
      text: `${name}의 팩스 금액 상한은 **공식 안내에서 확인되지 않았습니다**. 거의 모든 보험사가 상한을 두고 있으니, 금액이 큰 청구라면 보내기 전에 ${center}로 확인하세요.`,
      hi: true,
    });
  }

  // 준비 서류 — 어떤 서식을 제공하는지가 회사마다 다르다
  const docs: string[] = [];
  if (L.pdf) docs.push("보험금 청구서");
  if (L.dental) docs.push("치과치료확인서");
  if (docs.length) {
    out.push({
      label: "청구서 서식",
      text:
        docs.length > 1
          ? `${name}${eunNeun(name)} ${docs[0]}와 ${docs[1]} 서식을 따로 씁니다. 치과 치료로 청구하실 때는 두 가지를 함께 내셔야 합니다. 아래에서 내려받으실 수 있습니다.`
          : `${name} ${docs[0]} 서식을 아래에서 내려받아 작성하시면 됩니다.`,
    });
  }

  // 보낸 팩스가 도착했는지 직접 볼 수 있는 곳. 41곳 중 라이나생명에만 있다
  if (L.faxCheck) {
    out.push({
      label: "팩스 도착 확인",
      text: `${name}${eunNeun(name)} 보낸 팩스가 도착했는지 **고객이 직접 조회**할 수 있습니다. 로그인 없이 확인되니, 보내신 뒤 전화로 묻지 않아도 됩니다.`,
      hi: true,
    });
  }

  // 공제회사는 보험사와 부르는 말과 창구가 다르다
  if (c.type === "공제회사") {
    out.push({
      label: "공제 상품입니다",
      text: `${name}${eunNeun(name)} 보험회사가 아니라 공제기관입니다. 보험금이 아니라 공제금이라고 부르며, 청구 서식과 창구도 보험사와 다릅니다. 서류는 반드시 ${name} 양식으로 내셔야 합니다.`,
    });
  }

  return out;
}

/** 같은 구분(손해·생명·공제)의 다른 회사 — 내부 링크가 없어 크롤러가 못 넘어가고 있었다 */
function siblingCarriers(c: Carrier, limit = 8): Carrier[] {
  const same = carriers.filter((x) => x.type === c.type && x.name !== c.name);
  if (!same.length) return [];
  // 이름 순으로 돌리면 이웃한 회사끼리 목록이 거의 같아져 중복이 오히려 늘었다.
  // 이름으로 만든 수를 시작점과 보폭으로 써서 회사마다 다른 조합이 나오게 한다.
  let h = 0;
  for (const ch of c.name) h = (h * 31 + ch.charCodeAt(0)) % 100003;
  const step = 1 + (h % Math.max(1, same.length - 1));
  const out: Carrier[] = [];
  const seen = new Set<string>();
  // ★ k 를 same.length 로 반드시 끊는다. step 이 same.length 와 공약수를 가지면
  //   (h + k*step) % same.length 가 일부 칸만 돌아 조건이 영원히 안 채워진다.
  //   실제로 그렇게 써서 빌드가 static 생성 29/59 에서 멈췄다.
  for (let k = 0; k < same.length && out.length < limit; k++) {
    const x = same[(h + k * step) % same.length];
    if (!seen.has(x.name)) {
      seen.add(x.name);
      out.push(x);
    }
  }
  // 위에서 못 들른 회사가 남으면 순서대로 채운다
  for (let k = 0; k < same.length && out.length < limit; k++) {
    const x = same[k];
    if (!seen.has(x.name)) {
      seen.add(x.name);
      out.push(x);
    }
  }
  return out;
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
  const facts = carrierFacts(carrier);
  const siblings = siblingCarriers(carrier);

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
      a: faxNoticeAnswer(carrier.name, L.fax, L.cs, L.mobileUpload),
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
  // 팩스 한도는 회사마다 값이 다르고, 모르고 보내면 반려되는 조건이라 따로 묻는 사람이 많다
  if (FAX_LIMITS[carrier.name]) {
    faqs.push({
      q: `${carrier.name} 팩스로 얼마까지 청구할 수 있나요?`,
      a: limitSentence(carrier.name, FAX_LIMITS[carrier.name]),
    });
  }
  if (L.dental) {
    faqs.push({
      q: `${carrier.name} 치과 치료도 이 청구서로 내나요?`,
      a: `아닙니다. ${carrier.name}${eunNeun(carrier.name)} 치과치료확인서 서식이 따로 있습니다. 치과 치료 보험금을 청구하실 때는 보험금 청구서와 치과치료확인서를 함께 내셔야 하며, 두 가지 모두 이 페이지에서 내려받을 수 있습니다.`,
    });
  }
  if (L.faxCheck) {
    faqs.push({
      q: `${carrier.name} 팩스가 잘 갔는지 어떻게 확인하나요?`,
      a: `${carrier.name}${eunNeun(carrier.name)} 보낸 팩스의 수신 내역을 고객이 직접 조회할 수 있는 페이지를 운영합니다. 로그인 없이 확인할 수 있어, 접수 여부를 전화로 묻지 않아도 됩니다. 이 페이지의 「팩스 도착 확인」 버튼으로 들어가시면 됩니다.`,
    });
  }
  if (carrier.type === "공제회사") {
    faqs.push({
      q: `${carrier.name} 공제금 청구도 보험금 청구와 같나요?`,
      a: `${carrier.name}${eunNeun(carrier.name)} 보험회사가 아니라 공제기관이라 보험금이 아닌 공제금으로 부릅니다. 청구 서식과 접수 창구가 보험사와 다르므로 반드시 ${carrier.name} 양식으로 작성해 제출하셔야 합니다.`,
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
                acceptedAnswer: { "@type": "Answer", text: plain(f.a) },
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
            {faxUpdated && (
              <>
                {" · "}
                <b className="font-bold text-slate-500">
                  팩스번호 확인 {faxUpdated.replace(/-/g, ".")}
                </b>
              </>
            )}
          </p>
          <dl>
            <PhoneRow label="고객센터" value={L.cs} />
            <PhoneRow label="인콜 모니터링" value={L.monitor} />
            <PhoneRow label="헬프데스크" value={L.helpdesk} />
            <PhoneRow label="보험금청구 FAX" value={L.fax} />
          </dl>
          {!hasFaxNumber && L.fax && (
            <p className="mt-1 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
              ※ {faxNoticeLine(carrier.name, L.fax, L.cs, L.mobileUpload)}
            </p>
          )}
          {/* 로그인 없이 링크로 서류 사진을 올리는 창구 (2026-09-21 직접 확인한 3곳) */}
          {L.mobileUpload && (
            <a
              href={L.mobileUpload}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 no-underline hover:border-blue-400"
            >
              <span>📱 로그인 없이 서류 사진 올려 청구하기</span>
              <span className="text-xs font-semibold text-blue-500">휴대폰에서 여세요</span>
            </a>
          )}
        </section>
      )}

      {facts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-black text-slate-900">
            {carrier.name} 청구 전에 알아둘 것
          </h2>
          <dl className="carrier-facts">
            {facts.map((f) => (
              <div key={f.label} className={f.hi ? "hi" : undefined}>
                <dt>{f.label}</dt>
                <dd>
                  <Mark t={f.text} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {(L.pdf || L.dental || L.guide || L.terms || L.support || L.system || L.faxCheck || L.mobileUpload || L.agentClaim?.url) && (
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
          <LinkRow label="📱 모바일 청구 (로그인 없이)" href={L.mobileUpload} external />
          <LinkRow
            label={L.agentClaim?.url?.endsWith(".pdf") ? "🧑‍💼 설계사 대리접수 서식" : "🧑‍💼 설계사 대리접수"}
            href={L.agentClaim?.url}
            external
          />
          <LinkRow label="📠 팩스 도착 확인" href={L.faxCheck} external />
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
                  <Mark t={f.a} />
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
          <li>
            {L.guide
              ? `위 「필요서류 안내」에서 ${carrier.name}이(가) 청구 사유별로 요구하는 서류를 확인합니다.`
              : `청구 사유별로 필요한 서류를 ${L.cs ? `고객센터(${L.cs})` : "고객센터"}에 확인합니다.`}
          </li>
          <li>
            {L.pdf
              ? `${carrier.name} 보험금 청구서 PDF 를 내려받아 작성합니다.${
                  L.dental ? " 치과 치료라면 치과치료확인서도 함께 받습니다." : ""
                }`
              : `${carrier.name} 양식의 보험금 청구서를 준비합니다.`}
          </li>
          <li>진단서·영수증 등 청구 사유를 증명할 서류를 함께 준비합니다.</li>
          <li>
            {hasFaxNumber
              ? `팩스 ${faxFirst} 로 보냅니다.${limitStepNote(carrier.name)}`
              : faxNoticeLine(carrier.name, L.fax || "", L.cs, L.mobileUpload)}
          </li>
          <li>
            {L.cs
              ? `보낸 뒤 고객센터(${L.cs})로 접수 여부를 확인합니다. 팩스는 보낸 쪽에서 도착을 알 수 없습니다.`
              : "보낸 뒤 고객센터로 접수 여부를 확인합니다."}
          </li>
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          ※ 보장 여부와 필요 서류는 가입하신 상품의 약관에 따라 다릅니다. 정확한 내용은
          해당 보험사 또는 담당 설계사에게 확인하세요.
        </p>
      </section>

      {siblings.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-1 text-lg font-black text-slate-900">
            다른 {carrier.type === "공제회사" ? "공제기관" : `${carrier.type}보험사`} 청구 안내
          </h2>
          <p className="mb-3 text-xs text-slate-400">
            가입하신 곳이 여러 군데라면 여기서 바로 넘어가실 수 있습니다.
          </p>
          <ul className="flex list-none flex-wrap gap-2 p-0">
            {siblings.map((s) => (
              <li key={s.name}>
                <a href={carrierPath(s.name)} className="sibling-pill">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

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
