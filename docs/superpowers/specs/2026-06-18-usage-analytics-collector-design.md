# 청구닷컴 전용 이용량 수집소 — 설계 문서

- 작성일: 2026-06-18
- 대상 프로젝트: cheongu-landing (Next.js 15 App Router, Vercel 배포)
- 목적: Vercel Web Analytics의 30일 제한을 넘어, **영구 보관** + **100% 소유** 가능한 자체 이용량 수집·조회 시스템 구축

## 1. 배경 / 문제

- 현재 Vercel Web Analytics(무료) 연동 완료 → 실시간·단기(30일) 방문/유입 확인 가능.
- 한계: **30일 초과 데이터 조회 불가**, 커스텀 이벤트(PDF 다운로드·링크 클릭 등) 추적 불가(무료 플랜).
- 요구: 방문·다운로드·링크클릭·검색을 **영구히 내 DB에 적재**하고, **나만 보는 전용 페이지**에서 조회.

## 2. 목표 / 비목표

### 목표
- 페이지 방문, PDF 다운로드, 보험사 링크 클릭, 계산기·검색 사용을 기록.
- 데이터를 Supabase(PostgreSQL)에 영구 저장 (사용자 소유 계정).
- `청구.com/admin` 전용 통계 페이지(비밀번호 보호)에서 조회.
- 개인정보(IP 원본) 미저장 — 익명 visitor_id만.

### 비목표 (YAGNI)
- 실시간 대시보드(실시간은 기존 Vercel Analytics가 담당).
- 다중 사용자/권한 관리 — 단일 관리자(비밀번호 1개).
- 외부 차트 라이브러리 — 초기엔 CSS 막대로 충분.
- 개인 식별·추적(IP/PII 저장) — 의도적으로 배제.

## 3. 전체 구조

```
방문자 브라우저
   │  (행동: 방문/다운로드/링크클릭/계산기/검색)
   ▼
track() 클라이언트 헬퍼 ──POST──▶ /api/track (Next.js Route Handler)
                                      │  (서버에서만 Supabase service key 사용)
                                      ▼
                                Supabase (PostgreSQL) · events 테이블 (영구 적재)
                                      ▲
                                      │  (인증 후 읽기 전용 집계)
        청구.com/admin  ◀─────────────┘  전용 통계 페이지 (비밀번호 보호, noindex)
```

- **쓰기 경로**(방문자)와 **읽기 경로**(관리자)를 분리.
- Supabase service role key는 **서버 측 환경변수**로만 사용, 브라우저에 노출 금지.

## 4. 데이터 모델

단일 `events` 테이블로 단순화 (어떤 통계든 이 위에서 집계).

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | bigint (identity) | PK |
| `created_at` | timestamptz (default now()) | 발생 시각 |
| `type` | text | `pageview` \| `download` \| `link_click` \| `calc` \| `search` |
| `target` | text | 대상: 보험사명 / 경로 / 파일명 / 검색어 등 |
| `visitor_id` | text | 익명 UUID (1년 쿠키). 재방문/신규 구분용. **IP 미저장** |
| `referrer` | text (nullable) | 유입 경로(호스트 수준) |
| `meta` | jsonb (nullable) | 확장 필드 |

인덱스: `(type, created_at)`, `(created_at)`.

## 5. 이벤트 수집 방식

- **track() 헬퍼** (`lib/track.ts` 등): `navigator.sendBeacon` 우선, 실패 시 `fetch` fallback. 실패해도 조용히 무시(사이트 동작 방해 금지).
- **페이지 방문**: `app/layout.tsx`에 클라이언트 컴포넌트(`<Tracker />`) 추가 → 라우트 진입 시 `pageview` 기록.
- **PDF 다운로드 / 보험사 링크 클릭**: `components/CarrierList.tsx` 링크 클릭 핸들러에서 `track('download'|'link_click', 보험사/파일)`.
- **계산기·검색**: `AgeCalculator`, `MedCalculator`, `Hero`(검색) 사용 시 `track('calc'|'search', ...)`. (디바운스로 과다 기록 방지)
- **visitor_id**: 최초 방문 시 클라이언트에서 UUID 생성 → 1년 만료 쿠키 저장.

## 6. 전용 통계 페이지 (`/admin`)

- **인증**: 환경변수 `ADMIN_PASSWORD` 기반 단일 비밀번호. 로그인 폼 → 검증 성공 시 httpOnly 서명 쿠키 발급, 이후 유지. 미인증 접근은 로그인 폼으로.
- **검색엔진 차단**: `noindex` (robots 메타 / 헤더).
- **표시 내용**:
  - 일별 방문수 · 순방문자수 추세 (CSS 막대)
  - 인기 보험사 TOP (link_click/download 기준)
  - PDF 다운로드 순위
  - 유입경로 TOP (referrer)
  - 검색어 TOP
  - 기간 선택: 7 / 30 / 90일 / 전체
- **집계**: 서버 컴포넌트 또는 Route Handler에서 Supabase 집계 쿼리(읽기 전용).
- **차트**: 외부 라이브러리 없이 CSS 막대로 시작(의존성·번들 최소화).

## 7. 개인정보 / 안정성

- IP 원본·PII 미저장 → PIPA 부담 최소화. 익명 visitor_id만.
- `/api/track` 실패가 사용자 경험에 영향을 주지 않도록 fire-and-forget.
- 명백한 봇 user-agent 기본 필터(서버 측 가벼운 차단).
- service role key 등 비밀값은 Vercel/로컬 환경변수로만 관리(.env, 커밋 금지).

## 8. 비용

- Supabase 무료 한도(약 500MB·월 수십만 행) 내. 청구닷컴 규모에서 수 년치 무료 예상.
- 한도 초과해도 사이트 동작에는 영향 없음(수집은 부가기능).

## 9. 환경변수 (신규)

| 키 | 위치 | 용도 |
|----|------|------|
| `SUPABASE_URL` | 서버 | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버(비밀) | events 쓰기/집계 |
| `ADMIN_PASSWORD` | 서버(비밀) | /admin 접근 비밀번호 |

## 10. 영향 받는 파일 (예상)

- 신규: `lib/track.ts`(헬퍼), `app/api/track/route.ts`(수집), `app/admin/*`(통계 페이지·로그인), `lib/supabase.ts`(서버 클라이언트), Supabase 테이블 마이그레이션 SQL.
- 수정: `app/layout.tsx`(Tracker 삽입), `components/CarrierList.tsx`, `components/AgeCalculator.tsx`, `components/MedCalculator.tsx`, `components/Hero.tsx`(이벤트 연결).

## 11. 열린 항목 (구현 계획에서 확정)

- visitor_id 저장 위치: 쿠키 vs localStorage (기본: 쿠키 1년).
- /admin 경로명 확정(`/admin` 유지 여부).
- 봇 필터 수준.
