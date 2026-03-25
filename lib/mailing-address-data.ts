export type MailingAddressEntry = {
  company: string;
  zipcode: string;
  address: string;
  receiver: string;
  contact: string;
  note: string;
};

export const MAILING_ADDRESS_ENTRIES: MailingAddressEntry[] = [
  {
    company: "ABL생명",
    zipcode: "07332",
    address: "서울시 영등포구 의사당대로 147 10층",
    receiver: "동부GA사업단",
    contact: "",
    note: "",
  },
  {
    company: "DB생명",
    zipcode: "04320",
    address: "서울시 용산구 후암로 107, 게이트웨이타워 14층",
    receiver: "DB생명 잠실지점",
    contact: "02-779-5384",
    note: "",
  },
  {
    company: "IBK연금보험",
    zipcode: "04511",
    address: "서울시 중구 칠패로 37, 17층",
    receiver: "신계약담당자",
    contact: "",
    note: "바로원본",
  },
  {
    company: "KB라이프",
    zipcode: "06253",
    address: "서울시 강남구 강남대로 298 KB라이프타워 18층",
    receiver: "영업추진파트 신계약 담당자 앞",
    contact: "1899-3800",
    note: "",
  },
  {
    company: "KDB생명",
    zipcode: "03736",
    address: "서울시 서대문구 충정로 60, KT&G서대문타워 9층",
    receiver: "KDB생명 GA수도3사업단",
    contact: "",
    note: "",
  },
  {
    company: "교보생명",
    zipcode: "06158",
    address: "서울시 강남구 테헤란로 445, 11층",
    receiver: "영등포사업팀",
    contact: "02-2675-8523",
    note: "",
  },
  {
    company: "NH농협생명",
    zipcode: "04516",
    address: "서울시 서대문구 통일로 87 농협생명빌딩 동관 3층",
    receiver: "강북GA 신계약담당자",
    contact: "",
    note: "",
  },
  {
    company: "동양생명",
    zipcode: "03116",
    address: "서울시 종로구 창신동 330-3 동양생명사옥빌딩 3층",
    receiver: "GA 서울사업단",
    contact: "02-3670-5722",
    note: "",
  },
  {
    company: "라이나생명",
    zipcode: "03156",
    address:
      "서울시 종로구 삼봉로 48 (청진동 188) 시그나타워 17층",
    receiver: "라이나생명 대면영업GA운영팀",
    contact: "02-3775-7159",
    note: "",
  },
  {
    company: "라이나손해보험",
    zipcode: "04537",
    address: "서울시 중구 삼일대로 299 이화빌딩 5층 501호",
    receiver: "스캔팀 장채이 파트장",
    contact: "02-6261-4920",
    note: "",
  },
  {
    company: "메트라이프",
    zipcode: "06211",
    address:
      "서울시 강남구 테헤란로 316, 6층 GA본부 행랑실 (역삼동, 메트라이프타워)",
    receiver: "그랜드사업단 신계약담당자 앞",
    contact: "",
    note: "바로원본",
  },
  {
    company: "미래에셋생명",
    zipcode: "07330",
    address:
      "서울시 영등포구 국제금융로 56, 미래에셋대우빌딩 9층",
    receiver: "미래에셋생명 GA영업지원팀",
    contact: "02-3271-5253",
    note: "",
  },
  {
    company: "삼성생명",
    zipcode: "06193",
    address: "서울시 강남구 테헤란로 424 대치타워 8층",
    receiver: "삼성생명 GA광진 주예원 프로님",
    contact: "",
    note: "",
  },
  {
    company: "신한라이프",
    zipcode: "04512",
    address: "서울시 중구 칠패로 42, 우리빌딩 8층",
    receiver: "신한라이프 GA1영업본부 임현정",
    contact: "02-3455-4099",
    note: "",
  },
  {
    company: "iM라이프 (강북GA)",
    zipcode: "04532",
    address: "서울시 중구 남대문로 125 IM금융센터 12층",
    receiver: "IM라이프 강북GA",
    contact: "02-2087-9379",
    note: "",
  },
  {
    company: "처브라이프",
    zipcode: "06151",
    address:
      "서울시 강남구 테헤란로 401(삼성동, 남경센터) 12층",
    receiver: "처브라이프 채널운영팀",
    contact: "",
    note: "",
  },
  {
    company: "하나생명",
    zipcode: "04538",
    address: "서울시 중구 을지로 66, 12층",
    receiver: "GA사업부",
    contact: "",
    note: "",
  },
  {
    company: "한화생명",
    zipcode: "04526",
    address: "서울시 중구 세종대로 92 4층",
    receiver: "한화생명 강북GA사업단 김승연",
    contact: "02-6366-7196",
    note: "",
  },
  {
    company: "흥국생명",
    zipcode: "03184",
    address: "서울시 종로구 새문안로 68, 흥국생명빌딩 11층",
    receiver: "강동GA",
    contact: "",
    note: "",
  },
];

/** `/public/assets/logos/` 파일명 (표기명과 파일명이 다른 경우만 지정) */
const MAILING_LOGO_FILE: Partial<Record<string, string>> = {
  "KB라이프": "KB라이프생명.png",
  "NH농협생명": "농협생명.png",
  "iM라이프 (강북GA)": "iM라이프생명.png",
};

export function getMailingAddressLogoSrc(company: string): string {
  const file = MAILING_LOGO_FILE[company] ?? `${company}.png`;
  return `/assets/logos/${file}`;
}

function isNonLifeInsurance(company: string): boolean {
  return company.includes("손보") || company.includes("손해보험");
}

function sortKo(a: MailingAddressEntry, b: MailingAddressEntry): number {
  return a.company.localeCompare(b.company, "ko");
}

export function getMailingAddressGroups(): {
  nonLife: MailingAddressEntry[];
  life: MailingAddressEntry[];
} {
  const nonLife = MAILING_ADDRESS_ENTRIES.filter((e) =>
    isNonLifeInsurance(e.company)
  ).sort(sortKo);
  const life = MAILING_ADDRESS_ENTRIES.filter(
    (e) => !isNonLifeInsurance(e.company)
  ).sort(sortKo);
  return { nonLife, life };
}

export function formatAddressForCopy(entry: MailingAddressEntry): string {
  const lines = [
    `(${entry.zipcode}) ${entry.address}`,
    entry.receiver,
  ];
  if (entry.contact.trim()) lines.push(entry.contact);
  if (entry.note.trim()) lines.push(`비고: ${entry.note}`);
  return lines.filter(Boolean).join("\n");
}
