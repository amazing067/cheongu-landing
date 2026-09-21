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
  /**
   * 로그인 없이 링크(QR)로 서류 사진을 올리는 청구 창구.
   * 2026-09-21 공식 페이지를 직접 열어 확인한 곳만 싣는다 (동양생명·흥국화재·롯데손해보험).
   */
  mobileUpload?: string;
  /**
   * 설계사(FC·FP)가 고객 대신 접수하는 공식 창구. 2026-09-21 각 사 공식 안내 원문으로 확인.
   * how 는 조건까지 담은 한 줄, url 은 전용 화면·서식이 있을 때만.
   */
  agentClaim?: { how: string; url?: string };
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
