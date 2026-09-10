"use client";

import Link from "next/link";
import { track } from "@vercel/analytics";

/**
 * 클릭을 세는 링크.
 *
 * 왜 필요한가 —
 * 채용 CTA 가 상단 카드 / 하단 배너 / 플로팅 버튼 세 군데에 있는데,
 * 어느 것이 실제로 눌리는지 아무 데이터가 없었다. 디자인·문구 판단이 전부
 * 추측이었다. 어디서 들어오는지 세어두면 다음 결정은 숫자로 할 수 있다.
 *
 * ⚠️ Vercel Web Analytics 의 커스텀 이벤트는 요금제에 따라 집계가 안 될 수
 *    있다(Hobby). track() 이 무시돼도 링크 이동은 정상이므로 화면에는 영향이
 *    없지만, 대시보드에 이벤트가 안 보이면 그 이유다.
 *    그 경우를 대비해 /join 에 from 파라미터도 함께 붙인다 — 서버 로그나
 *    나중에 붙일 다른 분석 도구에서도 출처를 구분할 수 있다.
 */
export function TrackedLink({
  href,
  event,
  children,
  ...rest
}: {
  /** 이동할 경로. from 파라미터는 이 컴포넌트가 붙인다 */
  href: string;
  /** 이벤트 이름 겸 from 값. 예: "cards" */
  event: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "onClick" | "children">) {
  const url = href.includes("?")
    ? `${href}&from=${event}`
    : `${href}?from=${event}`;

  return (
    <Link
      {...rest}
      href={url}
      onClick={() => {
        // 집계가 실패해도 이동은 막지 않는다
        try {
          track("join_click", { from: event });
        } catch {
          /* 무시 */
        }
      }}
    >
      {children}
    </Link>
  );
}
