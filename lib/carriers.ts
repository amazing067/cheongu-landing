import rawLinks from "@/data/links.json";
import type { Carrier, LinksData } from "@/types/carrier";

/**
 * 보험사별 상세 페이지(/carrier/[name])와 사이트맵이 함께 쓰는 데이터 접근 헬퍼.
 * links.json 하나를 원본으로 삼아 URL·목록·조회를 전부 여기서 만든다.
 */
const data = rawLinks as unknown as LinksData;

export const SITE_URL = "https://www.xn--2e0br60d.com";

export const carriers: Carrier[] = data.carriers;

export const pdfUpdated: string | undefined = data.pdfUpdated;

/**
 * URL 경로에 쓰는 보험사 식별자.
 * 한글 그대로 쓴다 — 검색엔진이 한글 URL 을 정상 처리하고, 주소만 봐도 무슨 페이지인지 안다.
 * 실제 링크에 넣을 때는 반드시 encodeURIComponent 를 거친 canonicalPath() 를 쓸 것.
 */
export function carrierPath(name: string): string {
  return `/carrier/${encodeURIComponent(name)}`;
}

export function carrierUrl(name: string): string {
  return `${SITE_URL}${carrierPath(name)}`;
}

export function findCarrier(name: string): Carrier | undefined {
  return carriers.find((c) => c.name === name);
}

/** 보험사 구분별 묶음 — 목록 페이지와 홈 하단 색인에서 쓴다. */
export const carriersByType = {
  손해: carriers.filter((c) => c.type === "손해"),
  생명: carriers.filter((c) => c.type === "생명"),
  공제회사: carriers.filter((c) => c.type === "공제회사"),
} as const;

/** "0505-162-0872 | 0505-162-0873(부산)" 형태를 전화 목록으로 편다. */
export function splitPhones(
  value?: string
): { label: string; number: string; tel: string }[] {
  if (!value) return [];
  return value
    .split(/\s*\|\s*/)
    .filter(Boolean)
    .map((part) => {
      const m = part.trim().match(/^([\d\-]+)\(([^)]+)\)$/);
      const number = m ? m[1].trim() : part.trim();
      const label = m ? m[2].trim() : "";
      return { label, number, tel: number.replace(/[^0-9]/g, "") };
    });
}
