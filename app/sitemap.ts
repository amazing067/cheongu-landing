import type { MetadataRoute } from "next";
import { carriers, carrierUrl } from "@/lib/carriers";
import { calcUrl, calculators } from "@/lib/calculators";

// 네이버·구글 검색로봇에 청구닷컴의 페이지 목록을 알려주는 사이트맵.
// 소유확인된 도메인(www.청구.com)과 동일하게 www + punycode 로 표기한다.
// (/tools/*.html 은 next.config 에서 홈으로 redirect 되므로 제외, /api/* 는 페이지 아님)
const BASE = "https://www.xn--2e0br60d.com"; // www.청구.com
const LAST_MODIFIED = new Date("2026-07-11");
// tools 페이지는 이번 SEO 정비 시점으로 갱신 — 재크롤을 유도한다.
const TOOLS_MODIFIED = new Date("2026-07-29");

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
    // 검색 유입용 정보 페이지 — 홈 다음으로 검색량이 큰 콘텐츠들이라 우선순위를 높게 준다.
    // (e-enroll.html 은 noindex 유지, claim-autofill/pdf-* 는 미완성이라 제외)
    {
      url: `${BASE}/tools/history.html`,
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
      // 이미지 사이트맵 — 세대별 비교 인포그래픽을 구글 이미지검색에 직접 물려준다.
      images: [`${BASE}/assets/silson-generation-compare.png`],
    },
    {
      url: `${BASE}/tools/op-surgery-codes.html`,
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/tools/tertiary-hospitals.html`,
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/tools/care-hospitals.html`,
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // 계산기 단독 페이지 — "보험나이 계산기" 처럼 그 자체로 검색량이 있는 키워드용.
    ...calculators.map((c) => ({
      url: calcUrl(c.slug),
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // 보험사별 상세 페이지 — "삼성화재 팩스번호" 같은 롱테일 검색을 각 페이지가 나눠 맡는다.
    // links.json 에 보험사를 추가하면 여기도 자동으로 늘어난다.
    {
      url: `${BASE}/carrier`,
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...carriers.map((c) => ({
      url: carrierUrl(c.name),
      lastModified: TOOLS_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
