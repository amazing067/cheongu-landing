import { TrackedLink } from "@/components/TrackedLink";

/**
 * 채용 진입 CTA — /join 으로 이동.
 *
 * variant="bar"   : 한 줄 배너. 상단(검색 바로 아래)용.
 *                   청구 정보 찾으러 온 사람의 용무를 막지 않도록 짧게 유지한다.
 * variant="cards" : 무엇을 주는지 펼쳐 보여준다. 하단(푸터 위)용.
 *                   용무가 끝난 뒤라 읽을 여유가 있는 자리다.
 *
 * 왜 이 구성인가 —
 * 청구닷컴에 오는 사람 상당수가 이미 설계사다(보험사 팩스번호·청구서 양식을
 * 찾는 건 대개 고객 청구를 돕는 설계사다). 모집 대상이 이미 사이트 안에
 * 들어와 있는데 한 줄 배너는 "누르면 뭔가 있다"고만 하고 내용을 감췄다.
 *
 * 문구·디자인 규칙은 globals.css 의 .recruit-cards 주석에 정리해 뒀다.
 * 요약하면: 이모지·그라데이션 금지, 색은 로고에서 뽑은 두 가지만,
 * 차별점은 배지가 아니라 문장으로, 내용은 자동화로 통일.
 */

/**
 * 어메이징사업부가 직접 만든 영업 시스템의 기능 수.
 *
 * amazing-biz-server 의 frontend/src/pages 를 센 값이다(2026-09-11 기준).
 * 관리자·로그인·결제·약관 같은 운영 페이지를 뺀 보수적인 기준이고,
 * 전체 페이지는 52개다. 기능을 추가하면 이 숫자만 고치면 된다.
 */
const FEATURE_COUNT = 29;

/**
 * 앞세울 다섯 가지. "시스템이 대신한다"로 읽히는 것만 고른다.
 *
 * 보장분석·통합조회·영업 DB 는 어느 GA 나 있는 것이라 앞에 세우지 않고
 * 아래 배지로 내렸다. 블로그·유튜브 자동 생성이 제일 드문 것이라 남겼다
 * (설계사가 제일 하기 싫고 못 하는 게 콘텐츠다).
 *
 * tone: 카드 테두리와 배지 색. 로고에서 뽑은 두 색만 쓴다.
 * dropOnMobile: 좁은 폭에서 접을 항목. 5칸이 2열로 떨어지면 마지막 칸이
 *               혼자 전체 폭을 먹어서 한 칸만 접는다.
 */
const FEATURES = [
  {
    badge: "환급",
    tone: "gold",
    title: "실손 미청구 환급",
    desc: "못 받은 실비를 찾아 돌려받게",
  },
  {
    badge: "분석",
    tone: "amz",
    title: "진료내역 분석",
    desc: "긴 진료이력을 AI가 정리",
  },
  {
    badge: "분석",
    tone: "amz",
    title: "고지의무 분석",
    desc: "분쟁 병력을 계약 전에",
  },
  {
    badge: "보장",
    tone: "ink",
    title: "보장분석",
    desc: "증권 한 장으로 부족·중복",
    dropOnMobile: true,
  },
  {
    badge: "콘텐츠",
    tone: "gold",
    title: "블로그·유튜브 자동화",
    desc: "글도 대본도 내 이름으로",
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
                손으로 하던 일을 <span className="u">시스템이 대신합니다</span>
              </div>
              <div className="rc-lead">
                <p>
                  영업하다 불편한 걸 하나씩 만들다 보니{" "}
                  <b>{FEATURE_COUNT}개</b>가 됐습니다.
                </p>
                {/* 만드는 사람과 쓰는 사람이 같다는 것이 이 사업부의 유일한
                    차별점이다. "설계사가 만들고 개발자가 붙는다"고 쓰면 두 사람인
                    것처럼 읽히는데 실제로는 한 사람이다. 사실대로 쓰는 쪽이 더 세다.

                    연차 숫자("8년차")는 일부러 쓰지 않는다. 읽는 사람이 현직이라
                    숫자를 걸면 숫자로 비교당하고(더 오래 한 사람이 대다수다),
                    매년 고쳐야 하며 잊으면 거짓말이 된다. "오래"로 충분하다. */}
                <p>
                  현장을 오래 뛴 <b>현직 설계사가 직접 만듭니다.</b>{" "}
                  <span className="tail">쓰는 사람이 만드니 </span>필요하면 그날
                  고칩니다.
                </p>
              </div>
            </div>
            {/* 버튼은 지원으로 돌려놓는다. "29개 살펴보기"는 문턱이 낮지만
                정작 지원 의사가 있는 사람에게 다음 단계가 보이지 않는다. */}
            <TrackedLink href="/join" event="cards" className="rc-btn">
              1분 지원하기 →
            </TrackedLink>
          </div>

          <div className="rc-grid">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rc-card t-${f.tone}${
                  "dropOnMobile" in f && f.dropOnMobile ? " drop-mobile" : ""
                }`}
              >
                <span className={`rc-bdg b-${f.tone}`}>{f.badge}</span>
                <div className="t">{f.title}</div>
                <div className="d">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="rc-foot">
            <span>
              지금 쓰고 계신 <b>청구닷컴</b>도 그 {FEATURE_COUNT}개 중
              하나입니다.
            </span>
            <span className="cnt">통합조회 · 영업 DB · CRM 외 24개</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="maxw mt-4">
      {/* 이모지는 빼둔다. 카드 쪽과 같은 규칙이다 — 이모지가 붙는 순간
          템플릿으로 만든 배너처럼 보인다. */}
      <TrackedLink href="/join" event="bar" className="recruit-bar">
        <span className="tx">
          <b>어메이징사업부와 함께할 설계사분을 찾아요</b>
          <span className="rsub">
            직접 만든 영업 시스템 · 밀착 교육 · 자유로운 영업 환경
          </span>
        </span>
        <span className="go">1분 지원하기 →</span>
      </TrackedLink>
    </section>
  );
}
