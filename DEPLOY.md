# 서버 이전 및 배포 가이드 (Next.js)

## ⚠️ 배포 시 주의 (전체 깨짐 방지)

이 프로젝트는 **Next.js** 기반입니다. 아래 파일은 **이 프로젝트에 존재하지 않습니다**:

- `main-app.js`, `app-pages-internals.js`, `layout.css`  
→ 이 파일들로 404가 난다면 **예전 캐시** 또는 **다른 빌드/호스트**가 로드된 것입니다.

| 원인 | 대응 |
|------|------|
| 예전 배포가 같은 도메인에 살아 있음 | 새 Next 배포로 도메인을 **전환**했는지 확인 |
| 정적 호스트(GitHub Pages 등)가 `index.html`만 서빙 | Next 전용 호스트(Vercel, Node 서버)로 **변경** |
| 브라우저/CDN 캐시 | 강력 새로고침(`Ctrl+Shift+R`), 배포 후 캐시 무효화 |
| 잘못된 빌드 산출물 배포 | 반드시 `npm run build` 후 생성된 `.next` + `public` 사용 |

---

## 1. 현재 구조 요약

| 구분 | 설명 |
|------|------|
| **프로덕션 진입점** | Next.js 앱 (`app/page.tsx`) — 루트 `/` 에서 React 앱 제공 |
| **정적 index.html** | 루트의 `index.html` — Next.js에서는 **사용되지 않음**. 정적 호스팅(GitHub Pages 등)에서만 사용 |
| **데이터/정적 파일** | `scripts/prepare-public.js`가 `assets`, `data`, `tools`, `icons`, `manifest.webmanifest`, `CNAME`을 `public/`로 복사 → Next에서 `/data/links.json`, `/tools/*.html`, `/assets/*` 등으로 서빙 |

---

## 2. 배포 전 확인 (필수)

- [ ] `npm run build` **성공**
- [ ] 배포 타겟이 **Next.js** (Vercel, Node 서버 등)인지 확인 — 정적 HTML만 서빙하는 호스트 아님
- [ ] 이전에 같은 도메인에 **다른 프로젝트**(CRA, Vite 등)가 있었다면, **완전히 제거/교체**했는지 확인
- [ ] `vercel.json` (Vercel 사용 시) 존재 및 `framework: "nextjs"` 확인

---

## 3. 서버 이전 절차 (Next.js 기준)

### 3-1. 로컬에서 확인

```bash
# 의존성 설치
npm ci

# 프로덕션 빌드 (prepare-public 자동 실행 후 next build)
npm run build

# 로컬에서 프로덕션 모드 실행
npm run start
```

- 브라우저에서 `http://localhost:4000` 접속 후 동작 확인

### 3-2. Vercel 배포 (권장)

1. 저장소를 GitHub에 푸시
2. [Vercel](https://vercel.com) 로그인 → **Add New Project** → 해당 저장소 선택
3. **Framework Preset**: Next.js 자동 감지
4. **Build Command**: `npm run build` (기본값)
5. **Output Directory**: 기본값 유지
6. **Install Command**: `npm ci` 또는 `npm i`
7. 환경 변수: 현재 코드는 별도 env 없이 동작 (필요 시 Vercel 대시보드에서 추가)
8. **Deploy** 실행

- 커스텀 도메인(예: 청구.com)은 Vercel 프로젝트 **Settings → Domains**에서 연결
- `CNAME` 파일은 GitHub Pages용이므로, Vercel 도메인 설정은 대시보드에서 처리

### 3-3. 다른 호스팅 (Node 서버)

- **Build**: `npm run build`
- **실행**: `npm run start` (기본 포트 4000)
- PM2 등으로 프로세스 유지:

  ```bash
  pm2 start npm --name "cheongu" -- start
  ```

- 리버스 프록시(Nginx 등)에서 해당 포트로 프록시

### 3-4. 정적 호스팅만 사용하는 경우 (index.html)

- Next가 아니라 **루트의 index.html**을 메인으로 쓰는 경우:
  - `assets`, `data`, `tools`, `icons` 등이 호스팅 루트에 있어야 함
  - Tailwind 레거시: `npm run build:tailwind-legacy` 로 `assets/site.css` 생성
  - GitHub Actions(`.github/workflows/tailwind-build.yml`)는 `main` 푸시 시 빌드 후 `assets/site.css` 커밋

---

## 3. 점검 체크리스트

### 빌드 및 실행

- [x] `npm run build` 성공
- [x] `npm run start` 후 localhost:4000 접속 가능
- [x] `prepare-public`으로 `public/`에 data, tools, assets 복사됨

### 기능

- [x] **보험사 목록**: `/data/links.json` 로드 → 손해/생명/공제회사 섹션 표시
- [x] **검색**: Hero의 `#q` 입력 ↔ CarrierList 검색 연동
- [x] **단축키**: `/` 포커스, `Esc` 지우기 (CarrierList에서 `#q`, `#clear` 사용)
- [x] **보험나이 계산기**: AgeCalculator (`#age`), `#dobY` / `#dobM` / `#dobD` 존재
- [x] **실손 계산기**: MedCalculator (`#medcalc`)
- [x] **푸터**: 문의/개인정보처리방침 모달, 카카오 링크(https)
- [x] **외부 링크**: `/tools/*.html` (e-enroll, care-hospitals 등) → `public/tools/` 복사로 서빙

### 정적 자원

- [x] 로고: `public/assets/logos/` (prepare-public)
- [x] PDF: `public/assets/pdf/` (prepare-public)
- [x] OG 이미지: `app/layout.tsx`의 `og-image.png` → `public/assets/og-image.png` (prepare-public)

### 알려진 제한 / 차이

- **index.html**: Next 앱과 별개. Next로 서버 이전 시 **메인 화면은 Next 앱만** 사용됨. 기존 정적 index.html은 같은 서버에서 제공하지 않음 (필요 시 별도 경로/서브도메인 구성 필요).
- **GitHub Actions**: `tailwind-build.yml`은 `assets/site.css`(정적용) 빌드·커밋. Next만 쓸 경우 선택적으로 비활성화 가능.
- **검색 UI**: Next 앱에는 index.html처럼 '도구 페이지 검색 제안' 드롭다운이 없음. 검색은 보험사 목록 필터만 적용되며, 단축키 `/`, `Esc`는 동작함. "Enter 첫 번째 결과" 문구는 현재 필터 결과로 스크롤 등은 없음 (표시만 있음).

---

## 4. 문제 발생 시

| 증상 | 확인 사항 |
|------|-----------|
| 데이터 안 나옴 | `public/data/links.json` 존재 여부, `fetch('/data/links.json')` 네트워크 탭 확인 |
| 툴 페이지 404 | `public/tools/*.html` 존재 여부, 배포 시 `prepare-public` 실행 여부 |
| PDF/로고 404 | `public/assets/` 하위 파일 복사 여부 |
| 포트 충돌 | `npm run start` 시 다른 프로세스가 4000 사용 중이면 `next start -p 4001` 등으로 변경 |
| **전체 깨짐 + main-app.js / layout.css 404** | 이 Next 프로젝트에는 해당 파일이 없음. **캐시된 예전 페이지**이거나 **다른 서버/빌드**가 로드된 상태일 가능성 큼. 해결: (1) 접속 주소 확인 — Next는 `http://localhost:4000` 에서 `npm run dev` 또는 `npm run start` 로 서빙 (2) 강력 새로고침: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac) (3) 해당 사이트 캐시/쿠키 삭제 후 재접속 (4) 배포 환경이면 최신 `npm run build` 후 재배포 |

---

## 5. 배포 후 검증 (같은 현상 방지)

배포 직후 **반드시** 아래를 확인하세요.

1. **접속 URL**  
   - 배포한 주소(예: `https://청구.com`)로 직접 접속

2. **강력 새로고침**  
   - `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)으로 캐시 무시 후 로드

3. **개발자 도구(F12) → 네트워크**  
   - `main-app.js`, `layout.css`, `app-pages-internals.js` 요청이 **없는지** 확인  
   - Next.js라면 `_next/static/chunks/...` 형태의 JS만 있어야 함  
   - 위 파일들로 404가 보이면 → **캐시/잘못된 배포**이므로, 접속 URL·배포 설정 재확인

4. **동작 확인**  
   - 데이터 로딩, 검색, 계산기, 링크, 툴 페이지 모두 정상 동작하는지 확인

---

## 6. 요약

- **서버를 Next.js로 이전**할 경우: `npm run build` → `npm run start` 또는 Vercel 등에 배포하면 됨.
- **메인 진입점**은 Next 앱만 사용하고, 정적 `index.html`은 사용하지 않음.
- 데이터·툴·에셋은 모두 `prepare-public.js`가 `public/`에 넣어 주므로, 빌드 시 한 번만 실행되면 됨.
- **설정 파일**: `next.config.ts` (캐시 헤더), `vercel.json` (Vercel용)이 배포 시 동일 현상 방지에 활용됨.
