export interface CarrierLinks {
  system?: string;
  guide?: string;
  pdf?: string;
  dental?: string;
  support?: string;
  cs?: string;
  monitor?: string;
  helpdesk?: string;
  fax?: string;
  /** 보낸 팩스가 도착했는지 고객이 직접 조회하는 페이지 (라이나생명) */
  faxCheck?: string;
  terms?: string;
}

export interface Carrier {
  name: string;
  /** 구(舊) 회사명 표시용 (예: 예별손해보험 + "(구)MG손해보험") */
  nameFormer?: string;
  type: "손해" | "생명" | "공제회사";
  tags?: string[];
  links?: CarrierLinks;
  logo?: string;
}

export interface LinksData {
  /** 청구서 PDF 서식 최종 업데이트일 (YYYY-MM-DD) */
  pdfUpdated?: string;
  /** 팩스번호·금액 한도를 각 사에 확인한 날 */
  faxUpdated?: string;
  carriers: Carrier[];
}
