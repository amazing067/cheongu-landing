"use client";

import { useEffect, useRef, useState } from "react";
import type { Carrier, LinksData } from "@/types/carrier";

function useAccordionRow() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((v) => !v) };
}

function shortLabel(label: string): string {
  return label
    .replace(/필요서류\s*안내/gi, "필요서류")
    .replace(/치과\s*치료\s*확인서/gi, "치과확인서")
    .replace(/보험금\s*청구서\s*pdf\s*다운로드/gi, "보험금 청구서 PDF")
    .replace(/보험금청구서\s*pdf\s*다운로드/gi, "보험금 청구서 PDF");
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
  if (!href)
    return (
      <button className="btn btn-muted" disabled>
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
      {short}
    </a>
  );
}

/** FAX 번호 " | " 파싱 → [{ region, number, tel }] (우체국보험 등, 형식: 0505-005-1224(서울)) */
function parseFaxNumbers(num: string): { region: string; number: string; tel: string }[] {
  return num
    .split(/\s*\|\s*/)
    .filter(Boolean)
    .map((p) => {
      const m = p.trim().match(/^([\d\-]+)\(([^)]+)\)$/);
      const number = m ? m[1].trim() : p.trim();
      const region = m ? m[2].trim() : p.trim();
      const tel = p.replace(/[^0-9]/g, "");
      return { region, number, tel };
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
        className="btn btn-call center fax-claim fax-popup-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
      >
        보험금청구 FAX <span className="num">({parts.length}개 지역) 클릭</span>
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
                <span className="fax-popup-card-region">{p.region}</span>
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

function PhoneBtn({ label, number }: { label: string; number?: string }) {
  if (!number)
    return (
      <button className="btn btn-muted" disabled>
        {label}
      </button>
    );
  const tel = number.replace(/[^0-9]/g, "");
  const centerClass = /고객센터|인콜/.test(label) ? " center" : "";
  const incallClass = label === "인콜 모니터링" ? " incall-monitor" : "";
  const faxClaimClass = label === "보험금청구 FAX" ? " fax-claim" : "";
  const fullText = `${label} ${number}`;
  const isFax = label === "보험금청구 FAX";
  const hasLongFax = isFax && /\s\|\s/.test(number);

  if (hasLongFax) return <FaxPopupBtn number={number} />;

  return (
    <a
      className={`btn btn-call${centerClass}${incallClass}${faxClaimClass}`}
      href={tel ? `tel:${tel}` : "#"}
      title={fullText}
    >
      {label} <span className="num">{number}</span>
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
        target="_blank"
        rel="noopener noreferrer"
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
            <PhoneBtn label="보험금청구 FAX" number={L.fax} />
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
          <Btn label="전산 접속" href={L.system} cls="btn-primary" />
          <Btn label="필요서류 안내" href={L.guide} cls="btn-ghost" />
          <Btn label="치과치료확인서" href={L.dental} cls="btn-dental" />
          <Btn label="보험금 청구서 PDF 다운로드" href={L.pdf} cls="btn-pdf" />
          <Btn label="홈페이지" href={L.support} cls="btn-ghost" />
        </div>
        <div className="grid-bottom">
          <PhoneBtn label="고객센터" number={L.cs} />
          <PhoneBtn label="인콜 모니터링" number={L.monitor} />
          <PhoneBtn label="보험금청구 FAX" number={L.fax} />
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
  const [data, setData] = useState<LinksData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/data/links.json?ts=${Date.now()}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("failed to load");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("데이터 로드 실패: /data/links.json"));
  }, []);

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

  if (error) {
    return (
      <div className="px-4 py-3 text-sm text-red-600">{error}</div>
    );
  }

  if (!data) {
    return (
      <div className="px-4 py-8 text-center text-slate-500">
        데이터 로딩 중...
      </div>
    );
  }

  const lossRaw = data.carriers.filter((x) => x.type === "손해");
  const lifeRaw = data.carriers.filter((x) => x.type === "생명");
  const mutualRaw = data.carriers.filter((x) => x.type === "공제회사");

  const loss = filterCarriers(lossRaw, searchQuery);
  const life = filterCarriers(lifeRaw, searchQuery);
  const mutual = filterCarriers(mutualRaw, searchQuery);

  return (
    <>
      <section id="loss" className="mt-6">
        <div className="section-head">
          <h2 className="section-title">손해보험사</h2>
          <p className="section-sub">
            비어있는 항목은 비활성 버튼으로 표시됩니다.
            <br />💡 각 보험사 로고를 클릭하면 전자청구 등 상세 정보를 확인하실
            수 있습니다.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs border border-slate-200 bg-white mx-auto mb-2">
          {loss.length}개
        </span>
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

      <section id="life" className="mt-12">
        <div className="section-head">
          <h2 className="section-title">생명보험사</h2>
          <p className="section-sub">
            비어있는 항목은 비활성 버튼으로 표시됩니다.
            <br />💡 각 보험사 로고를 클릭하면 전자청구 등 상세 정보를 확인하실
            수 있습니다.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs border border-slate-200 bg-white mx-auto mb-2">
          {life.length}개
        </span>
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

      <section id="mutual" className="mt-12">
        <div className="section-head">
          <h2 className="section-title">공제회사</h2>
          <p className="section-sub">
            상호부조 방식의 보험 서비스를 제공하는 공제회사입니다.
            <br />💡 각 공제회사 로고를 클릭하면 전자청구 등 상세 정보를
            확인하실 수 있습니다.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs border border-slate-200 bg-white mx-auto mb-2">
          {mutual.length}개
        </span>
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
