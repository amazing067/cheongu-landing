import type { Metadata } from "next";

// join/page.tsx 가 "use client" 라 metadata 를 직접 export 할 수 없어서
// 이 레이아웃에서 채용 페이지 전용 타이틀·canonical 을 준다.
// (없으면 홈과 같은 타이틀이 노출돼 검색결과에서 중복으로 취급된다)
export const metadata: Metadata = {
  title: "보험설계사 채용 | 프라임에셋 어메이징사업부 — 청구닷컴",
  description:
    "설계사는 상담만, 나머지는 시스템이. 청구닷컴을 만든 프라임에셋 어메이징사업부에서 함께할 보험설계사를 찾습니다. 입사 첫날부터 전산·청구 시스템 전부 오픈.",
  alternates: { canonical: "/join" },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    locale: "ko_KR",
    title: "보험설계사 채용 | 프라임에셋 어메이징사업부",
    description:
      "설계사는 상담만. 나머지는 시스템이. — 어메이징사업부 설계사 모집",
    url: "/join",
    images: [{ url: "/assets/og-image.png", width: 1200, height: 630 }],
  },
};

export default function JoinLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
