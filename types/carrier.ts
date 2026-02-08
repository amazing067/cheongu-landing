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
  carriers: Carrier[];
}
