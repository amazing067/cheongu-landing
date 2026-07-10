import type { MetadataRoute } from "next";

// 네이버·구글 검색로봇에 청구닷컴의 페이지 목록을 알려주는 사이트맵.
// 소유확인된 도메인(www.청구.com)과 동일하게 www + punycode 로 표기한다.
// (/tools/*.html 은 next.config 에서 홈으로 redirect 되므로 제외, /api/* 는 페이지 아님)
const BASE = "https://www.xn--2e0br60d.com"; // www.청구.com
const LAST_MODIFIED = new Date("2026-07-11");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE}/join`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
