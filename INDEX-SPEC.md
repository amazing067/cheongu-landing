# INDEX v1 SPEC — 청구닷컴 랜딩

## 1) 페이지 섹션(순서 고정)
- Header(고정바): 로고(청구닷컴) + 베타 배지 + 내비(다운로드, 이용방법)
- Hero: 제목/설명, 검색 박스(입력, 지우기, 바로가기)
- Quick: 3카드(자주 찾는 PDF / 모바일 청구 / 이용방법)
- Links: 회사별 카드 리스트(회사명, Pill, 버튼 3개: PDF 다운로드 / 고객센터 / 모바일 청구)
- Top PDFs: 주요 PDF 2~4개 빠른 버튼
- Mobile Claim: 모바일/온라인 청구 3단계 가이드
- How-to: 이용방법 2카드
- Footer: 저작권, 문의/개인정보처리방침 버튼

## 2) 카드 컴포넌트 구조
- 필수 필드: name(회사명), type(손해/생명 등), tags([pdf, 고객센터, 모바일청구]), links{ pdf, support, mobile }
- UI 요소:
  - 상단: 회사명 굵게, 우측 Pill 1~2개
  - 버튼 3개 정렬: [PDF 다운로드(primary)] [고객센터] [모바일 청구]
  - 우측 상단 "링크복사" 보조 버튼(clipboard)

## 3) 검색/필터
- 입력 시 실시간 필터: (data-name + data-tags) 포함 여부로 표시/숨김
- 단축키: "/" 포커스, "Esc" 지우기
- Clear 버튼: 입력 초기화 + 포커스

## 4) 데이터 분리(JSON)
- 파일 위치: `data/links.json`
- 스키마(예시):
```json
{
  "carriers": [
    {
      "name": "삼성화재",
      "type": "손해",
      "tags": ["pdf", "고객센터", "모바일청구"],
      "links": {
        "pdf": "https://.../samsung-claim.pdf",
        "support": "https://.../samsung",
        "mobile": "https://.../samsung"
      }
    }
  ]
}
