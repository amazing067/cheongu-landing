export interface CarrierLinks {
  system?: string;
  guide?: string;
  pdf?: string;
  dental?: string;
  support?: string;
  cs?: string;
  monitor?: string;
  helpdesk?: string;
  /**
   * 번호, 또는 상태 문구 하나.
   *   「콜센터 발급」 고정번호 없음. 전화로 본인 확인 후 팩스번호를 받는다.
   *                  공식 표현이 「가상번호 발급」이든 「번호 문의」든 이것 하나로 쓴다
   *                  (사장님 2026-10-26: 전화하면 번호를 알려 주는 게 가상번호 발급이다)
   *   「폐지·앱 접수」 팩스 접수 종료
   *   「고객센터 전화」 공식 안내에서 팩스 접수 방법을 찾지 못한 곳
   */
  fax?: string;
  /**
   * 팩스번호를 받으려고 거는 번호가 대표 고객센터(cs)와 다를 때만 쓴다.
   * 예) 삼성생명 「FAX접수번호 문의 사고보험금 상담 전용(1577-4118)」
   */
  faxPhone?: { number: string; label: string; ars?: string };
  /** 보낸 팩스가 도착했는지 고객이 직접 조회하는 페이지 (라이나생명·메리츠화재) */
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
