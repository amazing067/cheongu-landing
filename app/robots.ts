import type { MetadataRoute } from "next";

// /robots.txt 자동 생성 — 전체 수집 허용 + 사이트맵 위치 안내.
const BASE = "https://www.xn--2e0br60d.com"; // www.청구.com

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
