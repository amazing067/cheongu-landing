import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { NoRightClick } from "@/components/NoRightClick";

export const metadata: Metadata = {
  title: "청구닷컴 | 보험금 청구 필요서류·팩스번호·고객센터 한눈에 — 어메이징사업부",
  description:
    "보험금 청구에 필요한 모든 것 — 보험사별 필요서류, 청구서 PDF, 팩스번호, 고객센터 전화번호, 전산 접속까지 한 페이지에서. 프라임에셋 어메이징사업부가 만든 보험금 청구 링크 허브.",
  keywords: [
    "청구닷컴",
    "청구.com",
    "어메이징사업부",
    "어메이징 사업부",
    "프라임에셋 어메이징사업부",
    "어메이징사업부 청구닷컴",
    "보험금 청구",
    "보험금 청구서류",
    "보험사 팩스번호",
    "보험사 고객센터",
  ],
  authors: [{ name: "프라임에셋 어메이징사업부" }],
  creator: "프라임에셋 어메이징사업부",
  publisher: "프라임에셋 어메이징사업부",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "청구닷컴",
    title: "청구닷컴 | 보험금 청구 필요서류·팩스번호·고객센터 한눈에 — 어메이징사업부",
    description:
      "보험사별 필요서류 · 청구서 PDF · 팩스번호 · 고객센터 · 전산 접속까지 한 페이지에서 — 어메이징사업부가 만든 보험금 청구 링크 허브",
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
  const faviconVersion = "20260726-1";

  return (
    <html lang="ko">
      <head>
        <link rel="icon" href={`/favicon.ico?v=${faviconVersion}`} sizes="48x48" />
        <link
          rel="icon"
          href={`/icons/icon-192.png?v=${faviconVersion}`}
          type="image/png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href={`/icons/icon-192.png?v=${faviconVersion}`}
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
        {/* 구조화 데이터 — 청구닷컴이 어메이징사업부 브랜드 자산임을 검색엔진에 연결 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://xn--2e0br60d.com/#website",
                  name: "청구닷컴",
                  alternateName: ["청구.com", "어메이징사업부 청구닷컴"],
                  url: "https://xn--2e0br60d.com/",
                  description:
                    "보험사별 보험금 청구 필요서류·청구서 PDF·팩스번호·고객센터를 한 페이지에 모은 링크 허브",
                  inLanguage: "ko",
                  publisher: { "@id": "https://xn--2e0br60d.com/#org" },
                },
                {
                  "@type": "Organization",
                  "@id": "https://xn--2e0br60d.com/#org",
                  name: "프라임에셋 어메이징사업부",
                  alternateName: ["어메이징사업부", "어메이징 사업부", "AMAZING"],
                  url: "https://xn--h32b21du9cf7grcy2k20f.com/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://xn--2e0br60d.com/icons/icon-512.png",
                    width: 512,
                    height: 512,
                  },
                  parentOrganization: { "@type": "Organization", name: "프라임에셋" },
                  sameAs: [
                    "https://xn--h32b21du9cf7grcy2k20f.com/",
                    "https://xn--oi2b19pfvd21bx33a.com/",
                    "https://talk.naver.com/profile/wj20ujg",
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="text-slate-900 mode-compact">
        <NoRightClick>{children}</NoRightClick>
        <Analytics />
      </body>
    </html>
  );
}
