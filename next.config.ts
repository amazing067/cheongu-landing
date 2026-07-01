import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // 미완성 "보험금 청구서 자동기입" 관련 페이지 접근 차단.
  // 라우팅 단계에서 홈으로 돌려보내므로 직접 URL로도 못 들어간다.
  // (소스는 tools/ 에 보존 — 완성되면 이 규칙만 제거하면 됨)
  async redirects() {
    return [
      { source: "/tools/claim-autofill.html", destination: "/", permanent: false },
      { source: "/tools/pdf-coordinate-finder.html", destination: "/", permanent: false },
      { source: "/tools/pdf-field-mapper.html", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
