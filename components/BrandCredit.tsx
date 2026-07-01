/**
 * 모달·패널 하단에 넣는 은은한 어메이징 크레딧 한 줄.
 * (마크 + "프라임에셋 어메이징사업부 · 청구닷컴")
 */
export function BrandCredit({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-1.5 pt-3 mt-4 border-t border-slate-100 ${className}`}
    >
      <img
        src="/icons/amazing-mark.png"
        alt=""
        className="h-3.5 w-auto opacity-75 select-none"
        draggable={false}
      />
      <span className="text-[10px] font-semibold text-slate-400">
        프라임에셋 어메이징사업부 · 청구닷컴
      </span>
    </div>
  );
}
