# 📋 보험금 청구서 자동기입 구현 가이드

## 🎯 목표
사용자가 한번 입력한 개인정보로 여러 보험사의 청구서를 자동으로 작성하는 시스템 구축

---

## 📊 현황
- ✅ PDF 파일 복사 완료: 66개 파일
- ✅ 좌표 측정 도구 제작 완료: `tools/pdf-coordinate-finder.html`
- ✅ 기본 자동기입 시스템 완성: `tools/claim-autofill.html`

---

## 🛠️ 3가지 구현 방식 비교

| 구분 | AcroForm 방식 | 이미지 오버레이 방식 | 하이브리드 방식 |
|------|---------------|---------------------|----------------|
| **품질** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **속도** | ⭐ (30-50시간) | ⭐⭐⭐⭐⭐ (1-2일) | ⭐⭐⭐⭐ (3-5일) |
| **유지보수** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **필요 도구** | Adobe Acrobat Pro | pdf-lib | 둘 다 |
| **권장도** | 장기 프로젝트 | 빠른 프로토타입 | **⭐ 추천** |

---

## 🚀 추천: 하이브리드 방식 구현 계획

### Phase 1: TOP 10 보험사 (AcroForm) - 1주
```
1. 삼성화재 ✅ (완료)
2. 현대해상
3. DB손해보험
4. KB손해보험
5. 메리츠화재
6. 삼성생명
7. 한화생명
8. 교보생명
9. NH농협손해보험
10. KB라이프생명
```

**작업 시간:** 보험사당 1-2시간 × 9개 = **9-18시간**

### Phase 2: 나머지 보험사 (이미지 오버레이) - 2일
- 좌표 측정 도구로 빠르게 매핑
- 주요 필드(10-15개)만 우선 지원

### Phase 3: 점진적 개선 - 지속
- 사용자 피드백 수집
- 자주 사용되는 보험사부터 AcroForm으로 업그레이드

---

## 📐 좌표 측정 도구 사용법

### 1. 도구 접속
```
파일 위치: tools/pdf-coordinate-finder.html
```

### 2. 사용 순서
1. **PDF 업로드**: 보험사 청구서 PDF 선택
2. **페이지 선택**: 여러 페이지 중 작업할 페이지 선택
3. **필드 추가**: 
   - 필드명 입력 (예: `ins_name`)
   - 설명 입력 (예: "피보험자 이름")
   - "필드 추가" 버튼 클릭
4. **좌표 클릭**: PDF에서 입력란 위치 클릭
5. **반복**: 모든 필드에 대해 3-4번 반복
6. **코드 복사**: 생성된 코드를 복사하여 `claim-autofill.html`에 붙여넣기

### 3. 주요 필드명 표준
```javascript
// 계약자 (Subscriber)
sub_name         // 이름
sub_rrn1         // 주민번호 앞자리
sub_rrn2         // 주민번호 뒷자리
sub_phone1       // 전화번호 1
sub_phone2       // 전화번호 2
sub_phone3       // 전화번호 3

// 피보험자 (Insured)
ins_name         // 이름
ins_rrn1         // 주민번호 앞자리
ins_rrn2         // 주민번호 뒷자리

// 주소
zip              // 우편번호
addr             // 도로명주소
addr_detail      // 상세주소

// 사고/질병 정보
accident_date    // 발병일/사고일
diagnosis        // 진단명
hospital_name    // 병원명

// 계좌 정보
bank_name        // 은행명
bank_account     // 계좌번호
bank_depositor   // 예금주

// 날짜 (청구일)
date_y_full      // 연도 (2025)
date_y_short     // 연도 짧게 (25)
date_m           // 월 (11)
date_d           // 일 (05)
```

---

## 💻 이미지 오버레이 방식 구현 예시

### CARRIER_TEMPLATE_DATA 업데이트
```javascript
// claim-autofill.html의 CARRIER_TEMPLATE_DATA에 추가
"HYUNDAI_MARINE": {
  name: "현대해상",
  logo: "../assets/logos/현대해상.png",
  templatePath: "../assets/pdf-templates/현대해상-보험금청구서.pdf",
  
  // 이미지 오버레이 방식 (좌표 배열)
  fieldPositions: [
    { field: 'ins_name', page: 0, x: 150, y: 650, fontSize: 12 },
    { field: 'ins_rrn1', page: 0, x: 150, y: 630, fontSize: 10 },
    { field: 'ins_rrn2', page: 0, x: 200, y: 630, fontSize: 10 },
    { field: 'sub_name', page: 0, x: 150, y: 580, fontSize: 12 },
    { field: 'zip', page: 0, x: 150, y: 560, fontSize: 10 },
    { field: 'addr', page: 0, x: 150, y: 540, fontSize: 10 },
    { field: 'addr_detail', page: 0, x: 150, y: 520, fontSize: 10 },
    { field: 'bank_name', page: 0, x: 150, y: 480, fontSize: 11 },
    { field: 'bank_account', page: 0, x: 250, y: 480, fontSize: 11 },
    { field: 'accident_date', page: 0, x: 150, y: 400, fontSize: 11 },
    { field: 'diagnosis', page: 0, x: 150, y: 380, fontSize: 11 },
    { field: 'hospital_name', page: 0, x: 150, y: 360, fontSize: 11 },
    { field: 'date_y_short', page: 0, x: 400, y: 200, fontSize: 10 },
    { field: 'date_m', page: 0, x: 430, y: 200, fontSize: 10 },
    { field: 'date_d', page: 0, x: 450, y: 200, fontSize: 10 }
  ],
  
  // 서명 위치
  sigPositions: [
    { type: 'BENEFICIARY', page: 0, x: 450, y: 220, width: 80, height: 40 }
  ]
}
```

### generateSinglePdf 함수에 오버레이 로직 추가
```javascript
// claim-autofill.html의 generateSinglePdf 함수 수정
async function generateSinglePdf(P, templateConfig, kFontBytes, sigImageBytes) {
  const { PDFDocument, rgb } = PDFLib;
  
  // ... (기존 PDF 로드 코드) ...
  
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  
  // 폰트 임베드
  let fontToUse;
  if (kFontBytes) {
    fontToUse = await pdfDoc.embedFont(kFontBytes, { subset: true });
  } else {
    fontToUse = await pdfDoc.embedFont(StandardFonts.Helvetica);
  }
  
  // ✅ 이미지 오버레이 방식 (fieldPositions 사용)
  if (templateConfig.fieldPositions && templateConfig.fieldPositions.length > 0) {
    for (const pos of templateConfig.fieldPositions) {
      const value = P[pos.field];
      if (!value || value === "") continue;
      
      const page = pages[pos.page];
      if (!page) continue;
      
      const text = String(value);
      const fontSize = pos.fontSize || 11;
      
      page.drawText(text, {
        x: pos.x,
        y: pos.y,
        size: fontSize,
        font: fontToUse,
        color: rgb(0, 0, 0)
      });
    }
  }
  // ✅ AcroForm 방식 (기존 로직 유지)
  else {
    const form = pdfDoc.getForm();
    for (const [fieldName, text] of Object.entries(P)) {
      // ... (기존 AcroForm 로직) ...
    }
    form.flatten();
  }
  
  // 서명 추가
  if (sigImageBytes && templateConfig.sigPositions) {
    const sigImage = await pdfDoc.embedPng(sigImageBytes);
    for (const pos of templateConfig.sigPositions) {
      // ... (기존 서명 로직) ...
    }
  }
  
  return await pdfDoc.save();
}
```

---

## 🎨 AcroForm 방식 (TOP 10 보험사용)

### Adobe Acrobat Pro 작업 순서

#### 1. PDF 열기
```
파일 > 열기 > 현대해상-보험금청구서.pdf
```

#### 2. 양식 편집 모드 진입
```
도구 > 양식 준비 > 시작
```

#### 3. 텍스트 필드 추가
- 입력란 위에 "텍스트 필드 추가" 도구 드래그
- 필드 속성 설정:
  - **필드명**: `ins_name` (표준 필드명 사용)
  - **폰트**: NotoSansKR-Regular (한글 지원)
  - **폰트 크기**: 11pt
  - **정렬**: 왼쪽 정렬
  - **테두리**: 없음
  - **배경**: 투명

#### 4. 체크박스/라디오 버튼 추가
```javascript
// 청구 유형 (라디오 버튼 그룹)
필드명: claim_type
옵션1: 질병 (value: "질병")
옵션2: 상해 (value: "상해")

// 청구 내용 (체크박스)
필드명: claim_detail_hospital (입원)
필드명: claim_detail_outpatient (통원)
필드명: claim_detail_surgery (수술)
```

#### 5. 저장
```
파일 > 다른 이름으로 저장 > 
assets/pdf-templates/현대해상-template.pdf
```

#### 6. 좌표 확인 (서명란)
```
도구 > 콘텐츠 편집 > 객체 편집
서명란 클릭 > 속성에서 좌표 확인
```

---

## 📝 작업 체크리스트

### 보험사별 작업 체크리스트

#### ✅ 삼성화재 (완료)
- [x] AcroForm 템플릿 완성
- [x] 필드 매핑 완료
- [x] 서명 좌표 설정
- [x] 테스트 완료

#### 🔄 현대해상 (진행 중)
- [ ] PDF 업로드 (`pdf-coordinate-finder.html`)
- [ ] 좌표 측정 (15개 필드)
- [ ] `CARRIER_TEMPLATE_DATA` 업데이트
- [ ] 테스트

#### ⏳ DB손해보험 (대기)
- [ ] 작업 시작

... (나머지 보험사)

---

## 🧪 테스트 방법

### 1. 샘플 데이터 입력
```
tools/claim-autofill.html 접속
→ "샘플 채우기" 버튼 클릭
→ 3단계에서 테스트할 보험사 선택
→ 4단계에서 서명 후 "PDF 파일로 저장하기"
```

### 2. 확인 사항
- [ ] 모든 필드가 올바른 위치에 표시되는가?
- [ ] 한글이 깨지지 않는가?
- [ ] 서명이 올바른 위치에 찍히는가?
- [ ] PDF가 정상적으로 열리는가?
- [ ] 텍스트가 입력란을 벗어나지 않는가?

---

## 💡 팁 & 주의사항

### 1. 한글 폰트 문제
```javascript
// NotoSansKR-Regular.otf 파일이 없으면 CDN 사용
const cdn = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Korean/NotoSansKR-Regular.otf';
```

### 2. 좌표계 차이
```
PDF 좌표계: 좌하단이 (0, 0)
Canvas 좌표계: 좌상단이 (0, 0)

변환 공식:
pdfY = canvasHeight - canvasY
```

### 3. 폰트 크기 조정
```javascript
// 작은 입력란: 9-10pt
// 일반 입력란: 11-12pt
// 큰 입력란: 13-14pt
```

### 4. 긴 텍스트 처리
```javascript
// 주소가 너무 길면 줄바꿈 또는 축소
if (addr.length > 30) {
  // 방법 1: 폰트 크기 줄이기
  fontSize = 9;
  
  // 방법 2: 줄바꿈
  const lines = wrapText(addr, 30);
  lines.forEach((line, i) => {
    page.drawText(line, { 
      x: pos.x, 
      y: pos.y - (i * 15), 
      size: fontSize 
    });
  });
}
```

### 5. 서명 이미지 비율
```javascript
// 서명 이미지가 찌그러지지 않도록 비율 유지
const aspectRatio = sigImage.width / sigImage.height;
const height = pos.width / aspectRatio;

page.drawImage(sigImage, {
  x: pos.x,
  y: pos.y,
  width: pos.width,
  height: height
});
```

---

## 🚀 다음 단계

### 즉시 시작 가능:
1. ✅ `tools/pdf-coordinate-finder.html` 사용하여 현대해상 청구서 좌표 측정
2. ✅ 측정한 좌표를 `claim-autofill.html`에 추가
3. ✅ 테스트 후 다음 보험사로 진행

### 장기 계획:
1. TOP 10 보험사 AcroForm 작업 (Adobe Acrobat Pro 사용)
2. 나머지 보험사 이미지 오버레이 방식 구현
3. 사용자 피드백 수집 후 우선순위 조정
4. 자주 사용되는 보험사부터 AcroForm으로 업그레이드

---

## 📞 문의 & 지원

작업 중 막히는 부분이 있으면 언제든 질문하세요!

- 좌표 측정 도구 사용법
- AcroForm 작업 방법
- 코드 통합 방법
- 테스트 및 디버깅

**화이팅! 🎉**

