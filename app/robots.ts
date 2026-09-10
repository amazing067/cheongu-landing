import type { MetadataRoute } from "next";

// /robots.txt 자동 생성 — 전체 수집 허용 + 사이트맵 위치 안내.
const BASE = "https://www.xn--2e0br60d.com"; // www.청구.com

// AI 크롤러를 이름으로 한 번 더 허용해 둔다.
// allow:"/" 로 이미 전부 허용이라 동작상 달라지는 건 없지만, 나중에 누군가
// 차단 규칙을 넣을 때 이 목록이 "이건 일부러 열어둔 것"이라는 표시가 된다.
// ChatGPT 검색이 Bing 색인과 OAI-SearchBot 을, Claude 가 ClaudeBot 을 쓴다.
// (2026-09-10 실측: 다섯 봇 모두 200 으로 완성 HTML 을 받아간다)
const AI_BOTS = [
  "OAI-SearchBot", // ChatGPT 검색
  "ChatGPT-User", // ChatGPT 가 사용자 요청으로 페이지를 열 때
  "GPTBot", // OpenAI 학습 크롤러
  "ClaudeBot", // Claude
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended", // 구글 Gemini / AI 개요
  "Applebot-Extended",
  "CCBot", // Common Crawl — 여러 모델의 학습 원천
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
