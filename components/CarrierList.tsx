"use client";

import { useEffect, useRef, useState } from "react";
import type { Carrier, LinksData } from "@/types/carrier";
import rawLinks from "@/data/links.json";

// 예전에는 브라우저에서 /data/links.json 을 fetch 했는데, 그러면 서버가 내려주는
// HTML 에 "데이터 로딩 중..." 만 남고 보험사 41개·팩스·고객센터가 통째로 빠진다.
// 구글은 JS 를 실행해 주지만 네이버 크롤러는 사실상 못 보므로, 빌드 시점에 묶어서
// 첫 HTML 부터 내용이 들어가게 한다. (links.json 수정 → 배포 흐름은 그대로)
const data = rawLinks as unknown as LinksData;

function useAccordionRow() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((v) => !v) };
}

/**
 * 삼성생명 전산(Edge 전용) 링크에서 microsoft-edge: 프로토콜을 써야 하는지 판단.
 * - Windows + 비(非)Edge 브라우저(크롬 등) → 프로토콜로 Edge 실행
 * - 이미 Edge이거나 맥/모바일 → 일반 https 링크(그대로 현재 Edge/브라우저에서 열림)
 */
function useEdgeProtocol() {
  const [useProto, setUseProto] = useState(false);
  useEffect(() => {
    if (typeof navigator !== "undefined") {
      const ua = navigator.userAgent;
      const isWin = /Windows/i.test(ua);
      const isEdge = /Edg\//.test(ua); // Chromium Edge UA 토큰
      setUseProto(isWin && !isEdge);
    }
  }, []);
  return useProto;
}

function shortLabel(label: string): string {
  return label
    .replace(/필요서류\s*안내/gi, "필요서류")
    .replace(/치과\s*치료\s*확인서/gi, "치과확인서")
    .replace(/보험금\s*청구서\s*pdf\s*다운로드/gi, "청구서 PDF")
    .replace(/보험금청구서\s*pdf\s*다운로드/gi, "청구서 PDF");
}

/** 칩 앞 아이콘 */
function iconFor(label: string): string {
  if (/전산/.test(label)) return "💻";
  if (/필요서류/.test(label)) return "📋";
  if (/치과/.test(label)) return "🦷";
  if (/PDF|청구서/i.test(label)) return "📄";
  if (/홈페이지/.test(label)) return "🏠";
  if (/약관/.test(label)) return "📘";
  if (/고객센터/.test(label)) return "📞";
  if (/인콜/.test(label)) return "🎧";
  if (/FAX/i.test(label)) return "📠";
  return "";
}

function Btn({
  label,
  href,
  cls,
}: {
  label: string;
  href?: string;
  cls?: string;
}) {
  const short = shortLabel(label);
  const ico = iconFor(label);
  if (!href)
    return (
      <button className="btn btn-muted" disabled>
        {ico && <span className="bico" aria-hidden>{ico}</span>}
        {short}
      </button>
    );
  const isExternal = /전산|홈페이지|필요서류|약관확인/.test(label);
  const isDownload = cls === "btn-pdf" || cls === "btn-dental";
  return (
    <a
      className={`btn ${cls || ""}`}
      href={href}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...(isDownload ? { download: "" } : {})}
    >
      {ico && <span className="bico" aria-hidden>{ico}</span>}
      {short}
    </a>
  );
}

/**
 * FAX 번호 " | " 파싱 → [{ label, number, tel }]
 * 형식: 0505-005-1224(서울)
 *
 * 괄호 안은 원래 지역이었는데(우체국보험), 청구 종류로 번호가 나뉜 회사가
 * 생겼다 — 메리츠화재 질병/상해, 라이나손해보험 일반/치아.
 * 그래서 "지역" 이 아니라 "라벨" 이다. 버튼 문구도 라벨을 그대로 보여준다.
 */
function parseFaxNumbers(num: string): { label: string; number: string; tel: string }[] {
  return num
    .split(/\s*\|\s*/)
    .filter(Boolean)
    .map((p) => {
      const m = p.trim().match(/^([\d\-]+)\(([^)]+)\)$/);
      const number = m ? m[1].trim() : p.trim();
      const label = m ? m[2].trim() : "";
      const tel = number.replace(/[^0-9]/g, "");
      return { label, number, tel };
    });
}

/** 긴 FAX(우체국보험 등): 클릭 시 이미지처럼 라이트블루 헤더 + 그리드 카드 팝업 */
function FaxPopupBtn({ number }: { number: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const parts = parseFaxNumbers(number);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="fax-popup-wrap" ref={ref}>
      <button
        type="button"
        className="btn btn-call center fax-claim fax-popup-trigger btn-compact"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
      >
        <span className="bico" aria-hidden>📠</span>
        보험금청구 FAX <span className="num">클릭</span>
      </button>
      {open && (
        <>
          <div
            className="fax-popup-backdrop"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="fax-popup fax-popup-modal">
            <div className="fax-popup-header">
            <span className="fax-popup-header-icon">📠</span>
            보험금 청구 FAX
          </div>
          <div className="fax-popup-grid">
            {parts.map((p, i) => (
              <a
                key={i}
                href={`tel:${p.tel}`}
                className="fax-popup-card"
                onClick={() => setOpen(false)}
              >
                {p.label && (
                  <span className="fax-popup-card-region">{p.label}</span>
                )}
                <span className="fax-popup-card-num">{p.number}</span>
              </a>
            ))}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

/**
 * 팩스번호 대신 「폐지·앱 접수」「콜센터 발급」「고객센터 전화」 같은 글자가 들어간 회사.
 * 예전엔 href="#" 이라 누르면 화면 맨 위로 튀었다.
 * - 로그인 없는 모바일 청구 창구가 있으면(동양생명) 누르자마자 그 링크로 간다.
 * - 없으면 누를 이유가 없다 — 고객센터 번호는 옆 버튼에 이미 있다. 안내 글자로만 둔다.
 */
function NoFaxBtn({ fax, mobileUpload }: { fax: string; mobileUpload?: string }) {
  if (mobileUpload) {
    return (
      <a
        className="btn btn-call center fax-claim btn-compact"
        href={mobileUpload}
        target="_blank"
        rel="noopener noreferrer"
        title="팩스 접수 종료 — 로그인 없이 서류 사진을 올리는 모바일 청구 (휴대폰에서 여세요)"
      >
        <span className="bico" aria-hidden>📱</span>
        <span className="lb">FAX</span> <span className="num">모바일 청구 클릭</span>
      </a>
    );
  }
  const issued = fax.includes("발급");
  const title = issued
    ? "고정된 팩스번호가 없습니다. 고객센터에 전화해 본인 확인을 거치면 가상 팩스번호를 발급해 줍니다. 그 번호로 서류를 보내세요."
    : "공개된 팩스번호가 없습니다. 고객센터로 전화해 접수 방법을 안내받으세요.";
  return (
    <span className="btn btn-call center fax-claim btn-compact btn-static" title={title}>
      <span className="bico" aria-hidden>📠</span>
      <span className="lb">FAX</span> <span className="num">고객센터 문의</span>
    </span>
  );
}

function PhoneBtn({
  label,
  number,
  name,
  cs,
  mobileUpload,
}: {
  label: string;
  number?: string;
  /** 아래 셋은 보험금청구 FAX 버튼에서만 쓴다 — 번호가 없는 회사의 안내 팝업용 */
  name?: string;
  cs?: string;
  mobileUpload?: string;
}) {
  if (!number)
    return (
      <button className="btn btn-muted" disabled>
        <span className="bico" aria-hidden>{iconFor(label)}</span>
        {label}
      </button>
    );
  const tel = number.replace(/[^0-9]/g, "");
  const centerClass = /고객센터|인콜/.test(label) ? " center" : "";
  const incallClass = label === "인콜 모니터링" ? " incall-monitor btn-compact" : "";
  const faxClaimClass = label === "보험금청구 FAX" ? " fax-claim btn-compact" : "";
  const fullText = `${label} ${number}`;
  const isFax = label === "보험금청구 FAX";
  const hasLongFax = isFax && /\s\|\s/.test(number);

  if (hasLongFax) return <FaxPopupBtn number={number} />;
  // 번호 대신 「폐지·앱 접수」 같은 글자면 href="#" 로 맨 위로 튀지 않게 안내 팝업을 띄운다
  if (isFax && !tel) return <NoFaxBtn fax={number} mobileUpload={mobileUpload} />;

  return (
    <a
      className={`btn btn-call${centerClass}${incallClass}${faxClaimClass}`}
      href={tel ? `tel:${tel}` : "#"}
      title={fullText}
    >
      <span className="bico" aria-hidden>{iconFor(label)}</span>
      <span className="lb">
        {label.replace("인콜 모니터링", "인콜").replace("보험금청구 FAX", "FAX")}
      </span>{" "}
      <span className="num">{number}</span>
    </a>
  );
}

function RowFirstCell({
  detailUrl,
  logoSrc,
  itemName,
  nameFormer,
  open,
  onToggle,
}: {
  detailUrl: string;
  logoSrc: string;
  itemName: string;
  nameFormer?: string;
  open: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <a
        href={detailUrl}
        className="block no-underline"
      >
        <div className={`brand${nameFormer ? " brand-with-former" : ""}`}>
          <img
            src={logoSrc}
            alt={`${itemName} 로고`}
            className="logo"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {nameFormer ? (
            <span className="brand-former-badge">(구){nameFormer}</span>
          ) : (
            <span className="name">{itemName}</span>
          )}
        </div>
      </a>
      <button
        type="button"
        className="accordion-toggle"
        aria-label="메뉴 열기/닫기"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(e);
        }}
      >
        {open ? "×" : "+"}
      </button>
    </div>
  );
}

function CarrierRow({ item }: { item: Carrier }) {
  const { open, toggle } = useAccordionRow();
  const useEdgeProto = useEdgeProtocol();
  const L = item.links || {};
  const logoSrc = item.logo || `/assets/logos/${item.name}.png`;
  const detailUrl = `/tools/e-enroll.html?c=${encodeURIComponent(item.name)}`;
  const rowClass = `row${open ? " active" : ""}`;

  if (item.type === "공제회사") {
    return (
      <div
        className={rowClass}
        data-name={item.name}
        data-tags={(item.tags || []).join(" ").toLowerCase()}
      >
        <RowFirstCell
          detailUrl={detailUrl}
          logoSrc={logoSrc}
          itemName={item.name}
          nameFormer={item.nameFormer}
          open={open}
          onToggle={toggle}
        />
        <div className="stack">
          <div className="grid-top">
            <Btn label="홈페이지" href={L.support} cls="btn-ghost" />
            <PhoneBtn label="고객센터" number={L.cs} />
            <Btn label="약관확인" href={L.terms} cls="btn-ghost" />
          </div>
          <div className="grid-bottom">
            <Btn label="보험금 청구서 PDF 다운로드" href={L.pdf} cls="btn-pdf" />
            <PhoneBtn label="보험금청구 FAX" number={L.fax} name={item.name} cs={L.cs} mobileUpload={L.mobileUpload} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={rowClass}
      data-name={item.name}
      data-tags={(item.tags || []).join(" ").toLowerCase()}
    >
      <RowFirstCell
        detailUrl={detailUrl}
        logoSrc={logoSrc}
        itemName={item.name}
        nameFormer={item.nameFormer}
        open={open}
        onToggle={toggle}
      />
      <div className="stack">
        <div className="grid-top">
          {/* 삼성생명 전산은 Edge 전용 → Windows에서 클릭 시 Edge로 실행 */}
          {item.name === "삼성생명" && L.system ? (
            <a
              className="btn btn-primary btn-compact"
              href={useEdgeProto ? `microsoft-edge:${L.system}` : L.system}
              {...(useEdgeProto
                ? {
                    title:
                      "삼성생명 전산접속 — 'Microsoft Edge을(를) 여시겠습니까?' 창이 뜨면 '열기'를 누르세요.",
                  }
                : {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    title: "삼성생명 전산접속 (Microsoft Edge에서 열림)",
                  })}
            >
              <span className="bico" aria-hidden>
                💻
              </span>
              전산 접속
              <span className="edge-badge" aria-hidden>
                Edge
              </span>
            </a>
          ) : (
            <Btn
              label="전산 접속"
              href={L.system}
              cls="btn-primary btn-compact"
            />
          )}
          <Btn label="필요서류 안내" href={L.guide} cls="btn-ghost btn-compact" />
          <Btn label="치과치료확인서" href={L.dental} cls="btn-dental btn-compact" />
          <Btn label="보험금 청구서 PDF 다운로드" href={L.pdf} cls="btn-pdf" />
          <Btn label="홈페이지" href={L.support} cls="btn-ghost btn-compact" />
        </div>
        <div className="grid-bottom">
          <PhoneBtn label="고객센터" number={L.cs} />
          <PhoneBtn label="인콜 모니터링" number={L.monitor} />
          <PhoneBtn label="보험금청구 FAX" number={L.fax} name={item.name} cs={L.cs} mobileUpload={L.mobileUpload} />
          <Btn label="약관확인" href={L.terms} cls="btn-ghost" />
        </div>
      </div>
    </div>
  );
}

function filterCarriers(carriers: Carrier[], query: string): Carrier[] {
  if (!query.trim()) return carriers;
  const v = query.toLowerCase().trim();
  return carriers.filter((c) => {
    const key = (c.name + " " + (c.tags || []).join(" ")).toLowerCase();
    return key.includes(v);
  });
}

export function CarrierList({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onClearSearch?: () => void;
}) {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("q")?.focus();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClearSearch?.();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [onClearSearch]);

  const lossRaw = data.carriers.filter((x) => x.type === "손해");
  const lifeRaw = data.carriers.filter((x) => x.type === "생명");
  const mutualRaw = data.carriers.filter((x) => x.type === "공제회사");

  const loss = filterCarriers(lossRaw, searchQuery);
  const life = filterCarriers(lifeRaw, searchQuery);
  const mutual = filterCarriers(mutualRaw, searchQuery);

  const pdfUpdatedLabel = data.pdfUpdated
    ? data.pdfUpdated.replace(/-/g, ".")
    : null;
  // 팩스번호는 각 사가 예고 없이 바꾼다. 언제 확인한 값인지 보여야
  // 방문자가 최신인지 판단할 수 있다.
  const faxUpdatedLabel = data.faxUpdated
    ? data.faxUpdated.replace(/-/g, ".")
    : null;

  return (
    <>
      {faxUpdatedLabel ? (
        <p className="fax-stamp">
          <span className="d">팩스번호 {faxUpdatedLabel} 확인</span>
          <span className="t">
            보험사 {data.carriers.length}곳을 각 사 콜센터와 공식 안내에서 직접
            확인한 값입니다.
          </span>
          {pdfUpdatedLabel && (
            <span className="sub">청구서 서식 {pdfUpdatedLabel}</span>
          )}
        </p>
      ) : (
        pdfUpdatedLabel && (
          <p className="mt-2 text-right text-xs text-slate-400">
            청구서 서식 업데이트 {pdfUpdatedLabel}
          </p>
        )
      )}
      <section id="loss" className="mt-2">
        <div className="catbar">
          <h2>손해보험사</h2>
          <span className="cnt">{loss.length}</span>
          <span className="rule" />
        </div>
        <div className="table">
          {loss.map((item) => (
            <CarrierRow key={item.name} item={item} />
          ))}
        </div>
        {loss.length === 0 && (
          <div className="mt-3 text-sm text-slate-600 text-center">
            표시할 손해보험사가 없습니다.
          </div>
        )}
      </section>

      <section id="life" className="mt-8">
        <div className="catbar">
          <h2>생명보험사</h2>
          <span className="cnt">{life.length}</span>
          <span className="rule" />
        </div>
        <div className="table">
          {life.map((item) => (
            <CarrierRow key={item.name} item={item} />
          ))}
        </div>
        {life.length === 0 && (
          <div className="mt-3 text-sm text-slate-600 text-center">
            표시할 생명보험사가 없습니다.
          </div>
        )}
      </section>

      <section id="mutual" className="mt-8">
        <div className="catbar">
          <h2>공제회사</h2>
          <span className="cnt">{mutual.length}</span>
          <span className="rule" />
        </div>
        <div className="table">
          {mutual.map((item) => (
            <CarrierRow key={item.name} item={item} />
          ))}
        </div>
        {mutual.length === 0 && (
          <div className="mt-3 text-sm text-slate-600 text-center">
            표시할 공제회사가 없습니다.
          </div>
        )}
      </section>
    </>
  );
}
