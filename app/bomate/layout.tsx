import type { Metadata } from "next";

// page.tsx 가 "use client" 라 metadata 는 이 레이아웃에서 준다.
export const metadata: Metadata = {
  title: "보메이트 체험단 모집 | 보험설계사 12일 무료 체험 — 청구닷컴",
  description:
    "어메이징사업부가 개발한 보메이트를 보험설계사에게 12일간 무료로 열어드립니다. 써보고 불편한 점을 알려주세요. 11월 27일까지 신청.",
  alternates: { canonical: "/bomate" },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    locale: "ko_KR",
    title: "보메이트 체험단 모집 | 보험설계사 12일 무료 체험",
    description: "써보고, 불편한 점을 알려주세요. 보험설계사 대상 12일 무료 체험.",
    url: "/bomate",
    images: [{ url: "/assets/bomate/card1.jpg", width: 900, height: 1125 }],
  },
};

export default function BomateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
