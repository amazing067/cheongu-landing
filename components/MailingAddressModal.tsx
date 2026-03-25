"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  formatAddressForCopy,
  getMailingAddressGroups,
  getMailingAddressLogoSrc,
  type MailingAddressEntry,
} from "@/lib/mailing-address-data";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`shrink-0 text-slate-500 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function AccordionItem({
  entry,
  open,
  onToggle,
  copiedKey,
  onCopy,
}: {
  entry: MailingAddressEntry;
  open: boolean;
  onToggle: () => void;
  copiedKey: string | null;
  onCopy: (entry: MailingAddressEntry, key: string) => void;
}) {
  const key = entry.company;
  const copied = copiedKey === key;

  return (
    <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
      {/*
        고정 h-32 등은 img 박스만 키우고 object-contain 안에 빈 여백이 생김.
        h-auto + max-h만 두면 회사별 실제 로고 비율·해상도에 맞춰 행 높이가 달라짐.
      */}
      <button
        type="button"
        onClick={onToggle}
        className="mailing-address-accordion-trigger grid h-max min-h-0 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 border-0 px-4 py-2.5 text-left leading-none antialiased sm:px-5 sm:py-3 appearance-none bg-slate-50/80 hover:bg-slate-100/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 transition-colors"
        aria-expanded={open}
        aria-label={`${entry.company}, 발송 주소 ${open ? "접기" : "펼치기"}`}
      >
        <img
          src={getMailingAddressLogoSrc(entry.company)}
          alt=""
          aria-hidden
          className="col-start-1 row-start-1 block h-auto w-auto max-h-36 max-w-[min(100%,20rem)] justify-self-center object-contain object-center sm:max-h-44 sm:max-w-[min(100%,24rem)]"
          loading="lazy"
          decoding="async"
        />
        <span
          className="col-start-2 row-start-1 flex items-center justify-end text-slate-500"
          aria-hidden
        >
          <ChevronIcon open={open} />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-5 pt-1 sm:px-5 space-y-4 border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                우편번호 · 주소
              </p>
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
                <p className="text-base sm:text-lg text-slate-800 leading-relaxed flex-1 pl-0">
                  <span className="font-mono font-semibold text-violet-700">
                    ({entry.zipcode})
                  </span>{" "}
                  {entry.address}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(entry, key);
                  }}
                  className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 text-violet-800 px-3 py-2.5 text-sm font-bold hover:bg-violet-100 transition-colors min-h-[44px] min-w-[44px] sm:min-w-0"
                  title="주소 복사"
                  aria-label={`${entry.company} 주소 복사`}
                >
                  <CopyIcon className="w-5 h-5" />
                  <span className="sm:inline">복사</span>
                </button>
              </div>
              {copied && (
                <p className="mt-2 text-sm font-semibold text-emerald-600">
                  클립보드에 복사했습니다.
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                수신처
              </p>
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed">
                {entry.receiver}
              </p>
            </div>
            {entry.contact.trim() ? (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  연락처
                </p>
                <p className="text-base sm:text-lg text-slate-800">
                  <a
                    href={`tel:${entry.contact.replace(/[^0-9+]/g, "")}`}
                    className="text-violet-700 font-semibold underline-offset-2 hover:underline"
                  >
                    {entry.contact}
                  </a>
                </p>
              </div>
            ) : null}
            {entry.note.trim() ? (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  비고
                </p>
                <p className="text-base text-slate-700">{entry.note}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MailingAddressModal() {
  const [open, setOpen] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const { nonLife, life } = getMailingAddressGroups();

  const handleCopy = useCallback(async (entry: MailingAddressEntry, key: string) => {
    const text = formatAddressForCopy(entry);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopiedKey(key);
        window.setTimeout(() => setCopiedKey(null), 2000);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const openModal = useCallback(() => {
    setAnimateIn(false);
    setOpen(true);
    setExpandedKey(null);
    setCopiedKey(null);
  }, []);

  const closeModal = useCallback(() => {
    setAnimateIn(false);
    window.setTimeout(() => {
      setOpen(false);
      setExpandedKey(null);
    }, 220);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  const toggleItem = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
    setCopiedKey(null);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="mini-btn mini-emerald inline-flex items-center gap-2"
      >
        <span aria-hidden>📮</span>
        청약서 원본 발송 주소록 확인
      </button>

      {open ? (
      <div
        className={`fixed inset-0 z-[100] flex md:items-center md:justify-center md:p-4 transition-opacity duration-200 ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px] border-0 cursor-default"
          aria-label="모달 닫기"
          onClick={closeModal}
        />

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative flex flex-col w-full h-full md:h-auto md:max-h-[min(88vh,820px)] md:max-w-2xl md:rounded-2xl md:shadow-2xl bg-slate-50 overflow-hidden transition-all duration-200 ease-out ${
            animateIn
              ? "md:scale-100 md:translate-y-0 translate-y-0"
              : "md:scale-95 md:translate-y-2 translate-y-full md:translate-y-2"
          }`}
        >
          <header className="shrink-0 flex items-start justify-between gap-3 px-4 pt-4 pb-3 sm:px-5 border-b border-slate-200 bg-white">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-lg sm:text-xl font-black text-slate-900 leading-tight"
              >
                청약서 원본 발송 주소록
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                손해보험 · 생명보험 가나다순
              </p>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeModal}
              className="shrink-0 rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              aria-label="닫기"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="shrink-0 px-4 py-3 sm:px-5 bg-amber-50 border-b border-amber-100 space-y-2">
            <p className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed">
              📌 본 주소록은{" "}
              <span className="underline decoration-amber-700/70 underline-offset-2">
                광진2지점 어메이징사업부 전용
              </span>
              안내입니다.
            </p>
            <p className="text-sm sm:text-base font-bold text-amber-950 leading-relaxed">
              🚨 다른 보험사나 다른 지점은 주소와 담당자가 다를 수 있습니다.
            </p>
            <div className="overflow-x-auto -mx-0.5 px-0.5">
              <p className="text-xs sm:text-[13px] font-bold text-red-600 leading-tight whitespace-nowrap">
                본인이 가입한 보험사·지점을 꼭 확인한 뒤 &apos;등기 우편&apos;으로 발송해 주세요.
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5 space-y-6">
            {nonLife.length > 0 ? (
              <section>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
                  손해보험
                </h3>
                <div className="space-y-2.5">
                  {nonLife.map((entry) => (
                    <AccordionItem
                      key={entry.company}
                      entry={entry}
                      open={expandedKey === entry.company}
                      onToggle={() => toggleItem(entry.company)}
                      copiedKey={copiedKey}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">
                생명보험
              </h3>
              <div className="space-y-2.5">
                {life.map((entry) => (
                  <AccordionItem
                    key={entry.company}
                    entry={entry}
                    open={expandedKey === entry.company}
                    onToggle={() => toggleItem(entry.company)}
                    copiedKey={copiedKey}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      ) : null}
    </>
  );
}
