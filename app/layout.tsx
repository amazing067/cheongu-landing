import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { NoRightClick } from "@/components/NoRightClick";

export const metadata: Metadata = {
  title: "청구닷컴 | 보험금 청구 링크 허브",
  description:
    "전산 접속 · 필요서류 · 보험금 청구서 PDF · 치과치료확인서 · 고객센터 · 인콜 모니터링 · 보험금청구 FAX",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    title: "청구닷컴 | 보험금 청구 링크 허브",
    description:
      "전산 접속 · 필요서류 · 보험금 청구서 PDF · 치과치료확인서 · 고객센터 · 인콜 모니터링 · 보험금청구 FAX",
    url: "https://청구.com/",
    images: [
      {
        url: "https://청구.com/assets/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const faviconVersion = "20260305-1";

  return (
    <html lang="ko">
      <head>
        <link
          rel="icon"
          href={`/icons/icon-192.png?v=${faviconVersion}`}
          type="image/png"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pretendard:wght@400;600;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0f172a" />
        <meta
          name="naver-site-verification"
          content="b39cdcf2746e23ed3ae7e09800358ac349a5633e"
        />
      </head>
      <body className="text-slate-900 mode-compact">
        <NoRightClick>{children}</NoRightClick>
        <Analytics />
      </body>
    </html>
  );
}
