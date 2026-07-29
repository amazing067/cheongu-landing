import { carriers, carrierPath } from "@/lib/carriers";

/**
 * 홈 하단의 보험사별 상세 페이지 색인.
 * 홈의 보험사 목록은 아코디언·검색이 얽힌 클라이언트 UI라 크롤러가 개별 페이지로
 * 넘어갈 링크가 없다. 여기서 41곳으로 가는 평범한 <a> 를 깔아 크롤 경로를 만든다.
 * 사용자에게도 "삼성화재만 보고 싶다"는 요구를 그대로 받아준다.
 */
export function CarrierIndexLinks() {
  return (
    <section className="mt-14" aria-labelledby="carrier-index-title">
      <div className="section-head">
        <h2 className="section-title" id="carrier-index-title">
          보험사별 청구 안내 바로가기
        </h2>
        <p className="section-sub">
          보험사 하나만 골라 필요서류·청구서 PDF·팩스번호·고객센터를 한 화면에서 보세요.
        </p>
      </div>
      <ul className="flex list-none flex-wrap gap-1.5 p-0">
        {carriers.map((c) => (
          <li key={c.name}>
            <a
              href={carrierPath(c.name)}
              className="inline-block rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 no-underline transition hover:border-blue-300 hover:text-blue-700"
            >
              {c.name}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">
        <a href="/carrier" className="font-bold text-slate-500 no-underline hover:underline">
          보험사별 청구 안내 전체보기 →
        </a>
      </p>
    </section>
  );
}
