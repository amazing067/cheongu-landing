import Link from "next/link";

/**
 * 우하단 은은한 플로팅 버튼 — 어느 화면에서든 채용 페이지 접근.
 */
export function JoinFab() {
  return (
    <Link
      href="/join"
      aria-label="설계사 지원"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-[13px] font-black text-white no-underline shadow-lg transition-transform hover:-translate-y-0.5"
      style={{ background: "#e0342a", boxShadow: "0 10px 26px rgba(224,52,42,.4)" }}
    >
      🚀 설계사 지원
    </Link>
  );
}
