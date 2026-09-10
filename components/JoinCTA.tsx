import Link from "next/link";

/**
 * 채용 진입 CTA — /join 으로 이동.
 *
 * variant="bar"   : 한 줄 배너. 상단(검색 바로 아래)용.
 *                   청구 정보 찾으러 온 사람의 용무를 막지 않도록 짧게 유지한다.
 * variant="cards" : 무엇을 주는지 펼쳐 보여준다. 하단(푸터 위)용.
 *                   용무가 끝난 뒤라 읽을 여유가 있는 자리다.
 *
 * 왜 카드를 두는가 —
 * 청구닷컴에 오는 사람 상당수가 이미 설계사다(보험사 팩스번호·청구서 양식을
 * 찾는 건 대개 고객 청구를 돕는 설계사다). 모집 대상이 이미 사이트 안에
 * 들어와 있는데, 한 줄 배너는 "누르면 뭔가 있다"고만 하고 내용을 감춘다.
 * 그래서 클릭 없이도 무엇을 받는지 보이게 했다.
 */

/**
 * 어메이징사업부가 직접 만든 영업 시스템의 기능 수.
 *
 * amazing-biz-server 의 frontend/src/pages 를 센 값이다(2026-09-11 기준).
 * 관리자·로그인·결제·약관 같은 운영 페이지를 뺀 보수적인 기준이고,
 * 전체 페이지는 52개다. 기능을 추가하면 이 숫자만 고치면 된다.
 */
const FEATURE_COUNT = 29;

const FEATURES = [
  {
    icon: "📄",
    title: "보장분석 AI",
    desc: "증권 한 장 → 보장 부족·중복 표로",
  },
  {
    icon: "🔎",
    title: "통합 조회",
    desc: "전 보험사 가입내역·진료이력",
  },
  {
    icon: "💡",
    title: "미청구 발굴",
    desc: "안 받은 보험금 찾아주기",
  },
  {
    icon: "🗂️",
    title: "고객 CRM",
    desc: "만기 할 일 자동 · 공유 브리핑",
  },
] as const;

export function JoinCTA({ variant = "bar" }: { variant?: "bar" | "cards" }) {
  if (variant === "cards") {
    return (
      <section className="maxw mt-12">
        <div className="recruit-cards">
          <div className="rc-head">
            <div className="rc-tx">
              <div className="rc-h">
                영업하다 불편한 걸 하나씩 만들었더니,{" "}
                <span className="hl">{FEATURE_COUNT}개가 됐습니다</span>
              </div>
              <div className="rc-sub">
                현직 설계사가 직접 만든 영업 시스템 · 팀에 개발자가 있어 필요한
                건 바로 만듭니다
              </div>
            </div>
            <Link href="/join" className="rc-btn">
              1분 지원하기 →
            </Link>
          </div>
          <div className="rc-grid">
            {FEATURES.map((f) => (
              <div className="rc-card" key={f.title}>
                <div className="t">
                  <span aria-hidden>{f.icon}</span>
                  {f.title}
                </div>
                <div className="d">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="maxw mt-4">
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
