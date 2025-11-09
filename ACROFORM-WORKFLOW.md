# 🤖 AcroForm 자동화 워크플로우

## ✅ 준비 완료!

모든 도구가 준비되었습니다. 이제 바로 시작할 수 있습니다!

---

## 📋 작업 순서 (현대해상 예시)

### Step 1: 좌표 측정 도구 열기
```
브라우저에서 접속:
https://[서버주소]/tools/pdf-field-mapper.html
```

### Step 2: PDF 업로드
```
1. "📄 PDF 업로드" 버튼 클릭
2. HYUNDAI_MARINE-template.pdf 선택
3. 보험사 키 입력: HYUNDAI_MARINE
```

### Step 3: 필드 추가
```
⚡ 빠른 추가 버튼 사용:
1. "📦 전체" 버튼 클릭 → 모든 필드 자동 추가!

또는 개별 추가:
- "피보험자" → 피보험자 관련 4개 필드
- "계약자" → 계약자 관련 4개 필드
- "주소" → 우편번호, 주소 3개 필드
- "계좌" → 은행, 계좌번호 3개 필드
- "사고정보" → 사고일, 진단명 등 4개 필드
- "청구일" → 날짜 4개 필드
```

### Step 4: 좌표 클릭
```
1. 필드 목록에서 노란색 "👆 클릭 대기 중..." 필드 클릭
2. PDF 화면에서 해당 입력란 위치를 클릭
3. 초록색으로 변하면 완료!
4. 자동으로 다음 필드가 대기 상태로 전환됨
5. 모든 필드가 초록색이 될 때까지 반복
```

### Step 5: 코드 복사
```
우측 하단 "생성된 코드" 섹션에서:
1. "📋 코드 복사" 버튼 클릭

또는

2. "💾 스크립트 파일 저장" 버튼으로 
   HYUNDAI_MARINE-fields.js 파일 다운로드
```

### Step 6: 필드 정의 추가
```
1. create-acroform-template.js 파일 열기
2. FIELD_DEFINITIONS의 HYUNDAI_MARINE 섹션 찾기
3. fields: [] 부분에 복사한 코드 붙여넣기
```

### Step 7: 스크립트 실행
```bash
# 터미널에서 실행:
node create-acroform-template.js create HYUNDAI_MARINE

# 출력 예시:
# 🔨 HYUNDAI_MARINE AcroForm 템플릿 생성 시작...
# 📄 입력: assets/pdf-templates/HYUNDAI_MARINE-template.pdf
# 💾 출력: assets/pdf-templates/HYUNDAI_MARINE-template.pdf
# 
# 📊 PDF 정보:
#   - 페이지 수: 2
#   - 필드 수: 25
# 
# 🏗️  필드 추가 중...
#   ✅ TextField 추가: ins_name
#   ✅ TextField 추가: ins_rrn1
#   ... (생략) ...
# 
# 📈 추가 완료:
#   - 텍스트 필드: 21개
#   - 체크박스: 4개
#   - 라디오 그룹: 0개
# 
# 💾 PDF 저장 중...
# ✅ 완료! 파일 크기: 1356.2 KB
```

### Step 8: 검증
```bash
# 생성된 PDF의 필드 확인:
node create-acroform-template.js validate assets/pdf-templates/HYUNDAI_MARINE-template.pdf

# 출력 예시:
# 🔍 템플릿 검증 중...
# ✅ 총 25개 필드 발견
#   1. ins_name (PDFTextField)
#   2. ins_rrn1 (PDFTextField)
#   3. claim_type_sickness (PDFCheckBox)
#   ... (생략) ...
```

### Step 9: claim-autofill.html 테스트
```
1. 브라우저에서 tools/claim-autofill.html 접속
2. "샘플 채우기" 클릭
3. 3단계에서 현대해상 선택
4. 4단계에서 서명
5. "📄 PDF 파일로 저장하기" 클릭
6. 생성된 PDF 열어서 확인
```

---

## 🚀 다음 보험사 작업

현대해상이 잘 되면 같은 방식으로:
1. DB손해보험
2. KB손해보험
3. 메리츠화재
4. ... (TOP 10까지)

---

## 💡 팁

### 좌표 측정 팁:
```
✅ 입력란의 왼쪽 상단 모서리를 클릭하세요
✅ 페이지 배율은 150%가 가장 편합니다
✅ 체크박스는 정중앙을 클릭하세요
```

### 필드 크기 가이드:
```
- 이름: width 200, height 30
- 주민번호 앞: width 80, height 30
- 주민번호 뒤: width 100, height 30
- 주소: width 400-450, height 30
- 체크박스: width 15, height 15
```

### 폰트 크기 가이드:
```
- 큰 글씨 (이름): 12pt
- 보통 글씨: 11pt
- 작은 글씨 (주소, 상세): 10pt
```

---

## 🎯 예상 작업 시간

| 보험사 | 필드 수 | 측정 시간 | 스크립트 실행 | 검증 |
|--------|---------|-----------|---------------|------|
| 현대해상 | 25개 | 15분 | 즉시 | 2분 |
| DB손해보험 | 25개 | 15분 | 즉시 | 2분 |
| ... | ... | ... | ... | ... |
| **합계 (10개)** | **250개** | **2.5시간** | **즉시** | **20분** |

**총 소요 시간: 약 3시간** (수동 작업 대비 90% 시간 단축!)

---

## 🔧 문제 해결

### Q: 필드가 올바른 위치에 안 나타나요
```
A: PDF 좌표계는 좌하단이 (0,0)입니다.
   스크립트가 자동 변환하므로, 그냥 클릭만 하시면 됩니다!
```

### Q: 긴 주소가 잘려요
```
A: width를 더 크게 조정하거나, fontSize를 9-10으로 줄이세요.
```

### Q: 체크박스가 이상해요
```
A: width, height를 정확히 15, 15로 설정하고,
   체크박스의 정중앙을 클릭하세요.
```

---

## 📞 지원

막히는 부분이 있으면 언제든 질문하세요!
- 좌표 측정
- 코드 통합
- 테스트 디버깅

**화이팅! 🎉**

