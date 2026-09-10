import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

// 구글 서치콘솔 소유확인 값 (bohumreport@gmail.com / 어메이징사업부 계정,
// 속성: https://www.xn--2e0br60d.com, 2026-07-29 발급).
// 확인이 끝난 뒤에도 이 태그를 지우면 소유권이 해제되므로 절대 삭제하지 말 것.
// 값은 구글이 계정·속성별로 발급하므로 임의로 바꿔 쓸 수 없다.
const GOOGLE_SITE_VERIFICATION = "kU6KbPjW-C2z8YrJpuSfjIppr0eaV45FUXuou4w0daM";

// Bing 웹마스터도구 소유확인 값 (2026-09-10 발급).
// ChatGPT 검색이 Bing 색인을 쓰기 때문에 등록했다 — 구글·네이버만으로는
// AI 검색에 안 잡힌다. 구글 값과 마찬가지로 확인 후에도 지우면 소유권이 풀린다.
const BING_SITE_VERIFICATION = "B8405522ACE1F187A3C514F7E7CEA09B";

// 대표 도메인 = www.청구.com (퓨니코드 www.xn--2e0br60d.com).
// 실서버가 non-www → www 로 307 리다이렉트하므로 모든 표기를 www 로 통일해야
// 검색엔진에 랭킹 신호가 한 주소로 모인다. sitemap.ts / robots.ts 와 동일하게 유지할 것.
const SITE_URL = "https://www.xn--2e0br60d.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
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
    locale: "ko_KR",
    url: `${SITE_URL}/`,
    images: [
      {
        url: `${SITE_URL}/assets/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  // 트위터 카드가 없어 SEO 진단에서 소셜 항목이 계속 걸렸다.
  // 값은 기존 openGraph 를 그대로 따라가므로 문구가 새로 생기지는 않는다.
  twitter: {
    card: "summary_large_image",
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
        {GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={GOOGLE_SITE_VERIFICATION}
          />
        )}
        <meta name="msvalidate.01" content={BING_SITE_VERIFICATION} />
        {/* AI 크롤러용 사이트 안내. llms.txt 를 실제로 읽는다고 공개한 곳은 없지만
            비용이 없어서 걸어둔다 (app/llms.txt/route.ts 참고). */}
        <link rel="llms" href="/llms.txt" type="text/plain" />
        {/* 구조화 데이터 — 청구닷컴이 어메이징사업부 브랜드 자산임을 검색엔진에 연결 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.xn--2e0br60d.com/#website",
                  name: "청구닷컴",
                  alternateName: ["청구.com", "어메이징사업부 청구닷컴"],
                  url: "https://www.xn--2e0br60d.com/",
                  description:
                    "보험사별 보험금 청구 필요서류·청구서 PDF·팩스번호·고객센터를 한 페이지에 모은 링크 허브",
                  inLanguage: "ko",
                  publisher: { "@id": "https://www.xn--2e0br60d.com/#org" },
                },
                {
                  "@type": "Organization",
                  "@id": "https://www.xn--2e0br60d.com/#org",
                  name: "프라임에셋 어메이징사업부",
                  alternateName: ["어메이징사업부", "어메이징 사업부", "AMAZING"],
                  url: "https://xn--h32b21du9cf7grcy2k20f.com/",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.xn--2e0br60d.com/icons/icon-512.png",
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
