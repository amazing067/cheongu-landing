import Link from "next/link";

/**
 * 채용 진입 CTA — /join 으로 이동.
 * variant="bar"  : 검색창 폭에 맞춘 얇고 짧은 상단 바 (기본)
 * variant="card" : 하단(푸터 위)에 놓는 조금 더 큰 카드
 */
export function JoinCTA({ variant = "bar" }: { variant?: "bar" | "card" }) {
  if (variant === "card") {
    return (
      <section className="maxw px-5 mt-14">
        <Link
          href="/join"
          className="group relative flex items-center gap-5 overflow-hidden rounded-2xl px-6 py-6 text-white no-underline sm:px-8"
          style={{ background: "linear-gradient(115deg,#0f2038,#203a63)" }}
        >
          <span
            className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(224,52,42,.35),transparent 70%)" }}
          />
          <span className="relative z-10 grid h-14 w-14 flex-none place-items-center rounded-2xl bg-white/10 text-2xl">
            🤝
          </span>
          <span className="relative z-10 flex-1">
            <span className="text-[11px] font-black tracking-[0.14em]" style={{ color: "#ffb3ad" }}>
              WITH AMAZING
            </span>
            <span className="mt-1 block text-lg font-black sm:text-xl">
              어메이징사업부와 함께하실 설계사분을 찾습니다
            </span>
            <span className="mt-1 block text-[13px] text-slate-300">
              직접 만든 영업 시스템 · 밀착 교육·코칭 · 자유로운 영업 환경
            </span>
          </span>
          <span
            className="relative z-10 hidden flex-none rounded-xl px-5 py-3 text-sm font-black transition-transform group-hover:translate-x-0.5 sm:block"
            style={{ background: "#e0342a" }}
          >
            지원 ›
          </span>
        </Link>
      </section>
    );
  }

  // 상단 컴팩트 바 — 검색창과 같은 폭(900px), 바로 아래 딱 붙임
  return (
    <section className="maxw px-5 -mt-3">
      <div className="mx-auto w-full max-w-[900px]">
        <Link
          href="/join"
          className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-2.5 text-white no-underline sm:px-5"
          style={{ background: "linear-gradient(100deg,#0f2038,#203a63)" }}
        >
          <span
            className="pointer-events-none absolute -right-6 -top-10 h-32 w-32 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(224,52,42,.4),transparent 70%)" }}
          />
          <span className="relative z-10 text-lg">🤝</span>
          <span className="relative z-10 flex min-w-0 flex-1 flex-col leading-tight sm:flex-row sm:items-center sm:gap-2">
            <b className="truncate text-[13px] font-black sm:text-sm">
              어메이징사업부와 함께할 설계사분을 찾습니다
            </b>
            <span className="hidden truncate text-[12px] text-slate-300 lg:inline">
              · 직접 만든 시스템 · 밀착 교육 · 자유로운 영업
            </span>
          </span>
          <span
            className="relative z-10 flex-none rounded-lg px-3 py-1.5 text-[12px] font-black transition-transform group-hover:translate-x-0.5 sm:text-[13px]"
            style={{ background: "#e0342a" }}
          >
            지원 ›
          </span>
        </Link>
      </div>
    </section>
  );
}
