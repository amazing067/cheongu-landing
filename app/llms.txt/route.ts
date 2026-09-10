import { carriers, carrierUrl } from "@/lib/carriers";
import { calcUrl, calculators } from "@/lib/calculators";

// /llms.txt — AI 크롤러(ChatGPT·Claude·Perplexity 등)에게 사이트의 구성을 한 장으로 알려준다.
//
// ⚠️ 기대치는 낮게 잡을 것. llms.txt 는 제안된 관례일 뿐이고, OpenAI·Anthropic 이
//    이 파일을 실제로 읽는다고 공개한 바는 없다. 비용이 거의 안 드니 넣어둘 뿐이고,
//    AI 노출의 실제 동력은 ①일반 검색어 순위 ②외부 사이트의 인용이다.
//
// 사이트맵(app/sitemap.ts)과 같은 원본(carriers / calculators)에서 만들므로
// 보험사나 계산기를 추가하면 여기도 같이 늘어난다.

const BASE = "https://www.xn--2e0br60d.com"; // www.청구.com

export const dynamic = "force-static";

export function GET() {
  const lines = [
    "# 청구닷컴 (청구.com)",
    "",
    "> 보험금 청구에 필요한 정보를 보험사별로 모아둔 링크 허브. 필요서류, 청구서 PDF,",
    "> 보험금청구 팩스번호, 고객센터 전화번호, 전산 접속 주소를 한 곳에서 확인할 수 있다.",
    "> 프라임에셋 어메이징사업부가 만들어 운영한다.",
    "",
    "이 사이트는 특정 보험상품을 판매하거나 광고하지 않는다. 청구 절차와 연락처 정보를 정리해 둔 곳이다.",
    "",
    "## 주요 페이지",
    "",
    `- [보험사별 청구 정보 전체 목록](${BASE}/): 보험사 ${carriers.length}곳의 필요서류·청구서 PDF·팩스번호·고객센터를 한 화면에 모아둔 메인 페이지`,
    `- [보험사별 상세 페이지 목록](${BASE}/carrier): 보험사별 청구 안내 페이지 모음`,
    `- [설계사 지원 안내](${BASE}/join): 프라임에셋 어메이징사업부 보험설계사 지원 안내`,
    "",
    "## 참고 자료",
    "",
    `- [전국 상급종합병원 목록](${BASE}/tools/tertiary-hospitals.html): 보건복지부 지정 상급종합병원(3차 병원) 47곳의 지역·주소·전화번호`,
    `- [간호간병통합서비스 운영 병원](${BASE}/tools/care-hospitals.html): 간호간병통합서비스 병동을 운영하는 전국 병원 목록`,
    `- [종수술 등급·KCD·ICD-O 검색](${BASE}/tools/op-surgery-codes.html): 수술명으로 1~5종 수술 등급을, 질병명·코드로 KCD와 ICD-O 코드를 찾는 검색 도구`,
    `- [실손의료비보험 세대별 비교](${BASE}/tools/history.html): 1세대부터 5세대까지 실손의료비보험의 재가입 주기·자기부담금 등 제도 변천 비교`,
    "",
    "## 보험사별 청구 안내",
    "",
    ...carriers.map((c) => `- [${c.name} 보험금 청구 안내](${carrierUrl(c.name)})`),
    "",
    "## 계산기",
    "",
    // title 은 검색결과용 긴 문구라 목록에는 h1(짧은 이름)을 쓴다.
    ...calculators.map((c) => `- [${c.h1}](${calcUrl(c.slug)})`),
    "",
    "## 사이트 정보",
    "",
    `- [청구닷컴 소개](${BASE}/about): 누가 만들고 무엇을 담고 있는지, 정보의 출처와 한계`,
    `- [문의](${BASE}/contact): 문의 방법과 정보 오류 제보`,
    `- [개인정보처리방침](${BASE}/privacy)`,
    "",
    "## 안내",
    "",
    "- 전화번호와 팩스번호는 보험사 공지에 따라 바뀔 수 있다. 인용할 때는 확인 시점을 함께 밝히는 편이 좋다.",
    "- 병원 목록과 제도 설명은 참고 자료다. 개별 사안은 해당 기관에 확인해야 한다.",
    `- 사이트맵: ${BASE}/sitemap.xml`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
