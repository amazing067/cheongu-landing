# 청구닷컴 SEO 운영 가이드

배포 후 사람이 직접 해야 하는 작업과, 코드에서 지켜야 할 규칙 정리.
(2026-07-29 SEO 정비 기준)

---

## 0. 대표 도메인

**`https://www.xn--2e0br60d.com` (= www.청구.com) 하나로 통일.**

- 실서버가 non-www → www 로 307 리다이렉트한다. 그래서 www 가 정답.
- 다음 4곳의 표기가 항상 같아야 한다. 하나라도 어긋나면 랭킹 신호가 갈린다.
  - `app/layout.tsx` 의 `SITE_URL`
  - `app/sitemap.ts` 의 `BASE`
  - `app/robots.ts` 의 `BASE`
  - `tools/*.html` 의 `<link rel="canonical">` · `og:url`
- 루트 `CNAME` 파일은 GitHub Pages 시절 잔재라 Vercel 배포에는 영향이 없다.
  (지우면 `scripts/prepare-public.js` 의 `files` 배열에서도 빼야 함)

---

## 1. 배포 직후 — 구글 서치콘솔

<https://search.google.com/search-console>

1. 속성 등록과 소유확인 태그는 **이미 넣어뒀다** (2026-07-29).
   - 계정 `bohumreport@gmail.com` (어메이징사업부), 속성 `https://www.xn--2e0br60d.com` (URL 접두어)
   - 확인 값은 `app/layout.tsx` 의 `GOOGLE_SITE_VERIFICATION` 상수에 있다.
   - **배포한 뒤에** 서치콘솔 소유확인 창에서 "확인" 버튼을 눌러야 인증이 끝난다.
     태그가 라이브에 올라가 있어야 구글이 읽어가기 때문이다.
   - 인증 후에도 태그를 지우면 소유권이 해제되므로 삭제 금지.
2. **Sitemaps** → `sitemap.xml` 제출 (이미 제출돼 있으면 "다시 읽기").
3. **URL 검사**에 아래를 하나씩 넣고 → *색인 생성 요청*.
   하루 할당량이 있으니 안 되면 다음 날 이어서.

```
https://www.xn--2e0br60d.com/
https://www.xn--2e0br60d.com/join
https://www.xn--2e0br60d.com/carrier
https://www.xn--2e0br60d.com/calc/보험나이-계산기
https://www.xn--2e0br60d.com/calc/실손의료비-계산기
https://www.xn--2e0br60d.com/tools/history.html
https://www.xn--2e0br60d.com/tools/op-surgery-codes.html
https://www.xn--2e0br60d.com/tools/tertiary-hospitals.html
https://www.xn--2e0br60d.com/tools/care-hospitals.html
```

보험사 41곳 상세 페이지는 사이트맵에 다 들어 있으니 하나씩 넣을 필요는 없다.
다만 거래가 많은 곳(삼성화재·현대해상·DB손해보험·삼성생명 등) 몇 개는 직접 색인 요청을
넣어두면 훨씬 빨리 잡힌다. 주소는 `/carrier/삼성화재` 처럼 한글 그대로 넣으면 된다.

> 홈은 예전 타이틀(`청구닷컴 | 보험금 청구 링크 허브`)로 색인돼 있어서,
> 색인 생성 요청을 넣어야 새 타이틀로 갱신된다.

---

## 2. 네이버 서치어드바이저

<https://searchadvisor.naver.com/>

1. 사이트가 `www.청구.com` 으로 등록돼 있는지 확인.
   (소유확인 메타는 `app/layout.tsx` 에 이미 있음 — 지우면 안 됨)
> ⚠️ 콘솔 안쪽 주소(`/console/site/...`)를 브라우저에 직접 입력해 들어가면
> "로그아웃 하시겠습니까?" 확인창이 뜨고 세션이 끊긴다.
> 반드시 사이트 목록에서 링크를 눌러 이동할 것.

2. **요청 → 사이트맵 제출** : `https://www.xn--2e0br60d.com/sitemap.xml`
3. **요청 → 웹페이지 수집** : 위 6개 URL 을 하나씩 수집 요청.
4. **검증 → 웹페이지 최적화** 로 경고 없는지 확인.

---

## 3. 이미지 검색 유입

`assets/silson-generation-compare.png` — 실손 1~5세대 비교 인포그래픽(1200×630).

- `tools/history.html` 의 og:image · JSON-LD `ImageObject` · 본문 `<figure>` 에 물려 있다.
- 표 내용이 바뀌면 **이 이미지도 같이 갱신**해야 한다. 안 그러면 공유된 이미지와
  페이지 내용이 어긋난다.
- 구글 이미지검색은 파일명보다 `alt` · `figcaption` · 주변 본문 텍스트를 훨씬 크게 본다.
  키워드는 거기에 넣을 것.
- `app/sitemap.ts` 의 history 항목에 `images: [...]` 로 이미지 사이트맵을 넣어뒀다.
  인포그래픽을 추가하면 여기에도 같이 등록할 것.
- **네이버 이미지검색은 자사 블로그/카페 문서를 압도적으로 우대**한다.
  외부 사이트 이미지만으로는 잘 안 잡히므로, 이 인포그래픽을 네이버 블로그 포스팅에
  올리고 본문에서 `청구.com` 으로 링크하는 게 실질적인 유입 경로다.

---

## 3-1. 보험사별 상세 페이지 (`/carrier/[name]`)

`data/links.json` 의 보험사 41곳 각각에 대해 정적 페이지가 자동 생성된다.
`links.json` 에 회사를 추가/삭제하면 페이지도 사이트맵도 자동으로 따라간다 — 손댈 곳 없음.

- 노리는 검색어: `삼성화재 팩스번호`, `현대해상 보험금 청구 서류`, `DB손해보험 청구서 양식` 처럼
  **회사명 + 청구 관련어** 조합. 홈 한 페이지가 다 감당하던 걸 41개가 나눠 맡는다.
- 각 페이지에 `FAQPage` 스키마가 들어가 있어서 "○○ 팩스번호는?" 류 검색에
  구글 답 박스로 노출될 수 있다.
- **`generateStaticParams` 에는 인코딩하지 않은 한글 이름을 그대로 넘겨야 한다.**
  `encodeURIComponent` 를 씌워 넘기면 Next 가 한 번 더 인코딩해 모든 주소가 404 가 된다.
  (`app/carrier/[name]/page.tsx` 주석 참고)
- 반대로 `<a href>` · canonical · 사이트맵에 넣을 때는 반드시
  `lib/carriers.ts` 의 `carrierPath()` / `carrierUrl()` 을 쓸 것 — 여기서 인코딩한다.

## 3-1-2. 계산기 단독 페이지 (`/calc/[slug]`)

`lib/calculators.ts` 에 정의를 넣으면 페이지도 사이트맵도 자동 생성된다.
계산기 위젯은 홈과 같은 컴포넌트를 재사용하고, 제목·설명 본문·FAQ 만 페이지가 따로 갖는다.

- `/calc/보험나이-계산기` → `보험나이 계산기`, `상령일`, `상령일 계산기`
- `/calc/실손의료비-계산기` → `실손보험 계산기`, `실손 자기부담금 계산`, `5세대 실손 계산`
- 홈의 `#calc-panels` 앵커는 그대로 두고, 그 옆에 단독 페이지로 가는 링크를 붙였다.
  앵커만으로는 개별 검색어로 순위를 잡을 수 없다.

## 3-2. 홈 본문은 서버 렌더링이어야 한다

`components/CarrierList.tsx` 는 원래 브라우저에서 `/data/links.json` 을 `fetch` 했다.
그러면 검색로봇이 받는 HTML 에 **"데이터 로딩 중..." 만 남고 보험사·팩스·고객센터가 통째로
빠진다.** 구글은 JS 를 실행해 주지만 네이버 크롤러는 사실상 못 본다.

지금은 `import rawLinks from "@/data/links.json"` 으로 빌드 시점에 묶는다.
**이걸 다시 런타임 fetch 로 되돌리지 말 것.** 데이터를 바꾸려면 어차피 배포가 필요하므로
잃는 것도 없다.

확인 방법:

```bash
curl -s https://www.xn--2e0br60d.com/ | grep -c "삼성화재"   # 1 이상이어야 정상
curl -s https://www.xn--2e0br60d.com/ | grep -c "데이터 로딩 중"  # 0 이어야 정상
```

## 3-3. 우클릭·복사 차단은 제거했다

예전에는 `components/NoRightClick.tsx` 와 `tools/*.html` 의 anti-copy 스크립트가
우클릭·복사·F12 를 막고 "콘텐츠 복사 금지" 알림을 띄웠다. 2026-07-29 에 전부 제거했다.

이유: 설계사가 표를 퍼가고 블로그에 인용하고 카톡에 옮기는 게 곧 홍보인데,
차단은 그 확산을 막는다. 어차피 소스 보기로 우회되므로 실효도 없다.
콘텐츠 보호는 차단이 아니라 인포그래픽 안의 `청구.com` 워터마크로 한다.

되살리고 싶다면 그건 홍보 목표와 상충한다는 걸 알고 결정할 것.

## 4. 코드 쪽 규칙

- **정적 파일 원본은 루트 `assets/` · `tools/` 다.** `public/` 은
  `scripts/prepare-public.js` 가 복사해 만드는 산출물이므로 직접 수정하지 말 것.
  수정 후 `node scripts/prepare-public.js` 로 동기화.
- **도구 페이지 링크는 반드시 `<a href>` 로 둔다.** `<button onClick={window.open}>` 만
  쓰면 크롤러가 따라갈 링크가 없어져 그 페이지들이 검색에서 사라진다.
  `components/Hero.tsx` 의 `usePopupLink` 가 좌클릭만 가로채 팝업으로 띄우는 패턴.
- 새 `tools/*.html` 을 만들면 세트로 같이 해야 하는 것:
  1. `<title>` · `<meta name="description">` · `<link rel="canonical">` · og 태그
  2. `app/sitemap.ts` 에 등록
  3. 홈(`Hero.tsx`)에서 `<a href>` 로 링크
- `tools/e-enroll.html` 은 보험사별 전산 정보라 `noindex,nofollow` 를 **일부러** 걸어뒀다.
  사이트맵에도 넣지 말 것.
- `tools/claim-autofill.html` · `pdf-*.html` 은 미완성이라 `next.config.ts` 에서
  홈으로 리다이렉트 중. 색인 대상 아님.

---

## 5. 효과 확인

배포 후 2~4주 뒤 서치콘솔 **실적** 에서:

- `5세대 실손`, `실손보험 세대별 비교`, `종수술 분류표`, `상급종합병원 목록`,
  `간호간병통합서비스 병원` 쿼리의 노출수가 잡히는지
- `/tools/*` 페이지들이 **페이지** 탭에 등장하는지

노출은 있는데 클릭이 없으면 → description 문구 손볼 차례.
노출 자체가 없으면 → 색인 자체가 안 된 것이니 URL 검사로 원인 확인.
