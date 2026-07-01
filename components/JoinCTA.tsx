import Link from "next/link";

/**
 * 채용 진입 CTA — /join 으로 이동. 정보형(토스풍) 파란 바.
 * variant="bar"  : 검색·도구 아래, 보험사 위 (기본)
 * variant="card" : 하단(푸터 위)
 */
export function JoinCTA({ variant = "bar" }: { variant?: "bar" | "card" }) {
  const mt = variant === "card" ? "mt-12" : "mt-4";
  return (
    <section className={`maxw ${mt}`}>
      <Link href="/join" className="recruit-bar">
        <span className="em" aria-hidden>
          🤝
        </span>
        <span className="tx">
          <b>어메이징사업부와 함께할 설계사분을 찾아요</b>
          <span className="rsub">
            직접 만든 영업 시스템 · 밀착 교육 · 자유로운 영업 환경
          </span>
        </span>
        <span className="go">1분 지원하기 →</span>
      </Link>
    </section>
  );
}
