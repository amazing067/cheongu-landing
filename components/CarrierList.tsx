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
        className="btn btn-call center fax-claim fax-popup-trigger btn-compact"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-expanded={open}
      >
        <span className="bico" aria-hidden>📠</span>
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

  return (
    <>
      {pdfUpdatedLabel && (
        <p className="mt-2 text-right text-xs text-slate-400">
          청구서 서식 업데이트 {pdfUpdatedLabel}
        </p>
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
