# 청구닷컴 전용 이용량 수집소 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방문·PDF다운로드·링크클릭·계산기·검색을 Supabase(PostgreSQL)에 영구 적재하고, 비밀번호로 보호되는 `/admin` 페이지에서 조회하는 자체 이용량 수집 시스템 구축.

**Architecture:** 방문자 브라우저의 `track()` 헬퍼가 `/api/track`(Next.js Route Handler)로 이벤트를 POST하면 서버가 Supabase의 단일 `events` 테이블에 적재한다. 관리자는 `/admin`에서 비밀번호 인증 후 서버 측 집계 결과를 CSS 막대 차트로 본다. 쓰기 경로(방문자)와 읽기 경로(관리자)를 분리하고, Supabase 비밀키는 서버에서만 사용한다.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@supabase/supabase-js`, Vitest(순수 로직 단위 테스트), Vercel 배포.

## Global Constraints

- 런타임/프레임워크: Next.js 15.4.11 App Router, React 19, TypeScript strict.
- 경로 별칭: `@/*` → 프로젝트 루트 (tsconfig 기존 설정 사용). **단, 단위 테스트 파일은 상대경로 import**(vitest 별칭 설정 회피).
- 개인정보: **IP 원본·PII 저장 금지.** 식별은 익명 `visitor_id`(쿠키 `cgu_vid`, 1년)만.
- 안정성: 수집 실패가 방문자 경험을 막으면 안 됨 — `/api/track` 및 `track()`는 fire-and-forget, 오류 시 조용히 무시.
- 비밀값(`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`)은 환경변수로만. `.env*`는 커밋 금지(`.gitignore` 확인).
- 이벤트 종류(고정): `pageview` | `download` | `link_click` | `calc` | `search`.
- 쿠키명: 방문자 `cgu_vid`, 관리자 세션 `cgu_admin`.
- Route Handler 런타임: `nodejs` (crypto·Supabase 사용).
- `/admin`은 검색엔진 색인 금지(noindex).

---

### Task 1: 의존성 설치 · 테스트 환경 · DB 스키마 · 환경변수 예시

**Files:**
- Modify: `package.json` (deps + scripts)
- Create: `vitest.config.ts`
- Create: `supabase/migrations/0001_create_events.sql`
- Create: `.env.local.example`
- Modify: `.gitignore` (필요 시 `.env*` 확인)

**Interfaces:**
- Consumes: 없음
- Produces: `npm test`(vitest run), `npm run test:watch`. Supabase `events` 테이블 스키마. 환경변수 키 목록.

- [ ] **Step 1: 의존성 설치**

Run:
```bash
npm install @supabase/supabase-js
npm install -D vitest
```
Expected: `added ... packages` 출력, 오류 없음.

- [ ] **Step 2: package.json 스크립트 추가**

`scripts`에 다음 두 줄 추가 (기존 줄은 유지):
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 3: vitest.config.ts 작성**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: DB 스키마 SQL 작성**

Create `supabase/migrations/0001_create_events.sql`:
```sql
-- 청구닷컴 이용량 수집: 단일 events 테이블
create table if not exists public.events (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text not null check (type in ('pageview','download','link_click','calc','search')),
  target      text,
  visitor_id  text,
  referrer    text,
  meta        jsonb
);

create index if not exists events_type_created_idx on public.events (type, created_at desc);
create index if not exists events_created_idx on public.events (created_at desc);

-- service role key로만 접근하므로 RLS는 활성화하되 정책은 두지 않음(서버 전용).
alter table public.events enable row level security;
```

- [ ] **Step 5: 환경변수 예시 파일 작성**

Create `.env.local.example`:
```
# Supabase (서버 전용 - 절대 NEXT_PUBLIC_ 접두사 쓰지 말 것)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...service_role...
# /admin 접근 비밀번호
ADMIN_PASSWORD=change-me-to-a-strong-password
```

- [ ] **Step 6: .gitignore 확인**

Run:
```bash
grep -n "env" .gitignore || echo "MISSING"
```
Expected: `.env*` 또는 `.env.local` 류가 이미 무시됨. 없으면 `.gitignore`에 다음 추가:
```
.env*.local
.env
```

- [ ] **Step 7: 빌드/테스트 러너 동작 확인**

Run:
```bash
npx vitest run
```
Expected: "No test files found" 또는 0 테스트 통과 (러너 자체는 정상 기동).

- [ ] **Step 8: 커밋**

```bash
git add package.json package-lock.json vitest.config.ts supabase/migrations/0001_create_events.sql .env.local.example .gitignore
git commit -m "chore: 이용량 수집 의존성·vitest·DB 스키마·env 예시 추가"
```

---

### Task 2: 순수 검증 헬퍼 (이벤트 검증 / 봇 필터 / referrer 호스트 / 방문자 쿠키 파싱)

**Files:**
- Create: `lib/analytics/events.ts`
- Create: `lib/analytics/bot.ts`
- Create: `lib/analytics/url.ts`
- Create: `lib/analytics/visitor.ts`
- Test: `lib/analytics/events.test.ts`, `lib/analytics/bot.test.ts`, `lib/analytics/url.test.ts`, `lib/analytics/visitor.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `events.ts`: `type EventType = "pageview"|"download"|"link_click"|"calc"|"search"`; `const EVENT_TYPES: readonly EventType[]`; `function isValidEventType(t: unknown): t is EventType`; `function sanitizeTarget(input: unknown, max?: number): string | null`
  - `bot.ts`: `function isBot(ua: string | null | undefined): boolean`
  - `url.ts`: `function extractHost(input: string | null | undefined): string | null`
  - `visitor.ts`: `function parseVisitorCookie(cookieHeader: string | null | undefined, name?: string): string | null`

- [ ] **Step 1: 실패하는 테스트 작성 — events**

Create `lib/analytics/events.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isValidEventType, sanitizeTarget } from "./events";

describe("isValidEventType", () => {
  it("accepts known types", () => {
    expect(isValidEventType("pageview")).toBe(true);
    expect(isValidEventType("download")).toBe(true);
  });
  it("rejects unknown / non-string", () => {
    expect(isValidEventType("foo")).toBe(false);
    expect(isValidEventType(123)).toBe(false);
    expect(isValidEventType(null)).toBe(false);
  });
});

describe("sanitizeTarget", () => {
  it("trims and returns string", () => {
    expect(sanitizeTarget("  삼성생명 ")).toBe("삼성생명");
  });
  it("returns null for empty / non-string", () => {
    expect(sanitizeTarget("")).toBeNull();
    expect(sanitizeTarget(null)).toBeNull();
    expect(sanitizeTarget(42)).toBeNull();
  });
  it("caps length", () => {
    expect(sanitizeTarget("a".repeat(500), 10)!.length).toBe(10);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/analytics/events.test.ts`
Expected: FAIL — "Cannot find module './events'".

- [ ] **Step 3: events.ts 구현**

Create `lib/analytics/events.ts`:
```ts
export type EventType = "pageview" | "download" | "link_click" | "calc" | "search";

export const EVENT_TYPES: readonly EventType[] = [
  "pageview",
  "download",
  "link_click",
  "calc",
  "search",
];

export function isValidEventType(t: unknown): t is EventType {
  return typeof t === "string" && (EVENT_TYPES as readonly string[]).includes(t);
}

export function sanitizeTarget(input: unknown, max = 300): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/analytics/events.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 실패하는 테스트 작성 — bot / url / visitor**

Create `lib/analytics/bot.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isBot } from "./bot";

describe("isBot", () => {
  it("flags known bots", () => {
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("Mozilla/5.0 (compatible; bingbot/2.0)")).toBe(true);
    expect(isBot("python-requests/2.31")).toBe(true);
  });
  it("treats missing UA as bot", () => {
    expect(isBot(null)).toBe(true);
    expect(isBot(undefined)).toBe(true);
    expect(isBot("")).toBe(true);
  });
  it("passes real browsers", () => {
    expect(
      isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36")
    ).toBe(false);
  });
});
```

Create `lib/analytics/url.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { extractHost } from "./url";

describe("extractHost", () => {
  it("extracts host", () => {
    expect(extractHost("https://m.naver.com/path?q=1")).toBe("m.naver.com");
  });
  it("returns null for empty / invalid", () => {
    expect(extractHost(null)).toBeNull();
    expect(extractHost("")).toBeNull();
    expect(extractHost("not a url")).toBeNull();
  });
});
```

Create `lib/analytics/visitor.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseVisitorCookie } from "./visitor";

describe("parseVisitorCookie", () => {
  it("reads cgu_vid value", () => {
    expect(parseVisitorCookie("a=1; cgu_vid=abc-123; b=2")).toBe("abc-123");
  });
  it("returns null when absent / empty", () => {
    expect(parseVisitorCookie("a=1; b=2")).toBeNull();
    expect(parseVisitorCookie(null)).toBeNull();
    expect(parseVisitorCookie("")).toBeNull();
  });
});
```

- [ ] **Step 6: 실패 확인**

Run: `npx vitest run lib/analytics/bot.test.ts lib/analytics/url.test.ts lib/analytics/visitor.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 7: 구현**

Create `lib/analytics/bot.ts`:
```ts
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|monitor|curl|wget|python-requests|axios|node-fetch|httpclient|scrapy|lighthouse|pingdom|uptimerobot/i;

export function isBot(ua: string | null | undefined): boolean {
  if (!ua) return true;
  return BOT_RE.test(ua);
}
```

Create `lib/analytics/url.ts`:
```ts
export function extractHost(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    return new URL(input).host || null;
  } catch {
    return null;
  }
}
```

Create `lib/analytics/visitor.ts`:
```ts
export function parseVisitorCookie(
  cookieHeader: string | null | undefined,
  name = "cgu_vid"
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) {
      const v = rest.join("=").trim();
      return v || null;
    }
  }
  return null;
}
```

- [ ] **Step 8: 통과 확인**

Run: `npx vitest run lib/analytics/bot.test.ts lib/analytics/url.test.ts lib/analytics/visitor.test.ts`
Expected: PASS.

- [ ] **Step 9: 커밋**

```bash
git add lib/analytics/events.ts lib/analytics/bot.ts lib/analytics/url.ts lib/analytics/visitor.ts lib/analytics/events.test.ts lib/analytics/bot.test.ts lib/analytics/url.test.ts lib/analytics/visitor.test.ts
git commit -m "feat: 이용량 수집 순수 헬퍼(이벤트검증·봇필터·호스트추출·쿠키파싱) + 테스트"
```

---

### Task 3: 집계 순수 함수 (일별 추세 / TOP 대상 / TOP 유입 / 순방문자)

**Files:**
- Create: `lib/analytics/aggregate.ts`
- Test: `lib/analytics/aggregate.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `interface EventRow { created_at: string; type: string; target: string | null; visitor_id: string | null; referrer: string | null }`
  - `interface DailyPoint { date: string; views: number; visitors: number }`
  - `interface Tally { label: string; count: number }`
  - `function dailySeries(rows: EventRow[]): DailyPoint[]` — 날짜(YYYY-MM-DD) 오름차순. `views`=해당일 `pageview` 수, `visitors`=해당일 distinct `visitor_id` 수.
  - `function topByTarget(rows: EventRow[], type: string, limit?: number): Tally[]` — 주어진 type의 `target`별 건수 내림차순.
  - `function topReferrers(rows: EventRow[], limit?: number): Tally[]` — `referrer`별 건수 내림차순(null 제외).
  - `function totalVisitors(rows: EventRow[]): number` — 전체 distinct `visitor_id`.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/analytics/aggregate.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  dailySeries,
  topByTarget,
  topReferrers,
  totalVisitors,
  type EventRow,
} from "./aggregate";

const rows: EventRow[] = [
  { created_at: "2026-06-17T01:00:00Z", type: "pageview", target: "/", visitor_id: "v1", referrer: "naver.com" },
  { created_at: "2026-06-17T02:00:00Z", type: "pageview", target: "/", visitor_id: "v1", referrer: "naver.com" },
  { created_at: "2026-06-17T03:00:00Z", type: "pageview", target: "/", visitor_id: "v2", referrer: "google.com" },
  { created_at: "2026-06-18T03:00:00Z", type: "pageview", target: "/", visitor_id: "v3", referrer: null },
  { created_at: "2026-06-18T04:00:00Z", type: "download", target: "삼성생명", visitor_id: "v3", referrer: null },
  { created_at: "2026-06-18T05:00:00Z", type: "download", target: "삼성생명", visitor_id: "v2", referrer: null },
  { created_at: "2026-06-18T06:00:00Z", type: "download", target: "한화생명", visitor_id: "v2", referrer: null },
];

describe("dailySeries", () => {
  it("groups views and distinct visitors per day, ascending", () => {
    const s = dailySeries(rows);
    expect(s).toEqual([
      { date: "2026-06-17", views: 3, visitors: 2 },
      { date: "2026-06-18", views: 1, visitors: 1 },
    ]);
  });
});

describe("topByTarget", () => {
  it("counts downloads per target desc", () => {
    expect(topByTarget(rows, "download")).toEqual([
      { label: "삼성생명", count: 2 },
      { label: "한화생명", count: 1 },
    ]);
  });
  it("respects limit", () => {
    expect(topByTarget(rows, "download", 1)).toEqual([{ label: "삼성생명", count: 2 }]);
  });
});

describe("topReferrers", () => {
  it("counts referrers desc, excluding null", () => {
    expect(topReferrers(rows)).toEqual([
      { label: "naver.com", count: 2 },
      { label: "google.com", count: 1 },
    ]);
  });
});

describe("totalVisitors", () => {
  it("counts distinct visitor_id", () => {
    expect(totalVisitors(rows)).toBe(3);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/analytics/aggregate.test.ts`
Expected: FAIL — "Cannot find module './aggregate'".

- [ ] **Step 3: aggregate.ts 구현**

Create `lib/analytics/aggregate.ts`:
```ts
export interface EventRow {
  created_at: string;
  type: string;
  target: string | null;
  visitor_id: string | null;
  referrer: string | null;
}

export interface DailyPoint {
  date: string;
  views: number;
  visitors: number;
}

export interface Tally {
  label: string;
  count: number;
}

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

export function dailySeries(rows: EventRow[]): DailyPoint[] {
  const views = new Map<string, number>();
  const visitors = new Map<string, Set<string>>();
  for (const r of rows) {
    const d = dayOf(r.created_at);
    if (r.type === "pageview") {
      views.set(d, (views.get(d) ?? 0) + 1);
      if (!visitors.has(d)) visitors.set(d, new Set());
      if (r.visitor_id) visitors.get(d)!.add(r.visitor_id);
    }
  }
  return [...views.keys()]
    .sort()
    .map((date) => ({
      date,
      views: views.get(date) ?? 0,
      visitors: visitors.get(date)?.size ?? 0,
    }));
}

function tally(values: (string | null)[], limit: number): Tally[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function topByTarget(rows: EventRow[], type: string, limit = 10): Tally[] {
  return tally(rows.filter((r) => r.type === type).map((r) => r.target), limit);
}

export function topReferrers(rows: EventRow[], limit = 10): Tally[] {
  return tally(rows.map((r) => r.referrer), limit);
}

export function totalVisitors(rows: EventRow[]): number {
  const set = new Set<string>();
  for (const r of rows) if (r.visitor_id) set.add(r.visitor_id);
  return set.size;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/analytics/aggregate.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
git add lib/analytics/aggregate.ts lib/analytics/aggregate.test.ts
git commit -m "feat: 이용량 집계 순수 함수(일별추세·TOP대상·TOP유입·순방문자) + 테스트"
```

---

### Task 4: 관리자 인증 토큰 (HMAC, 타이밍 안전 비교)

**Files:**
- Create: `lib/admin-auth.ts`
- Test: `lib/admin-auth.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `function makeToken(password: string): string` — `HMAC-SHA256(key=password, msg="cgu-admin-v1")`의 hex.
  - `function verifyToken(token: string | null | undefined, password: string | null | undefined): boolean` — 타이밍 안전 비교, 입력 누락 시 false.

- [ ] **Step 1: 실패하는 테스트 작성**

Create `lib/admin-auth.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { makeToken, verifyToken } from "./admin-auth";

describe("admin-auth", () => {
  it("makeToken is deterministic hex", () => {
    const t = makeToken("secret");
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    expect(makeToken("secret")).toBe(t);
  });
  it("verifies matching token", () => {
    expect(verifyToken(makeToken("secret"), "secret")).toBe(true);
  });
  it("rejects wrong token / missing inputs", () => {
    expect(verifyToken(makeToken("secret"), "other")).toBe(false);
    expect(verifyToken("deadbeef", "secret")).toBe(false);
    expect(verifyToken(undefined, "secret")).toBe(false);
    expect(verifyToken(makeToken("secret"), undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run lib/admin-auth.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: admin-auth.ts 구현**

Create `lib/admin-auth.ts`:
```ts
import crypto from "node:crypto";

export function makeToken(password: string): string {
  return crypto.createHmac("sha256", password).update("cgu-admin-v1").digest("hex");
}

export function verifyToken(
  token: string | null | undefined,
  password: string | null | undefined
): boolean {
  if (!token || !password) return false;
  const expected = makeToken(password);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run lib/admin-auth.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: 전체 테스트 확인**

Run: `npm test`
Expected: 모든 테스트 통과 (events/bot/url/visitor/aggregate/admin-auth).

- [ ] **Step 6: 커밋**

```bash
git add lib/admin-auth.ts lib/admin-auth.test.ts
git commit -m "feat: 관리자 인증 토큰(HMAC·타이밍안전 비교) + 테스트"
```

---

### Task 5: Supabase 서버 클라이언트 + `/api/track` 수집 엔드포인트

**Files:**
- Create: `lib/supabase-server.ts`
- Create: `app/api/track/route.ts`

**Interfaces:**
- Consumes: `getSupabaseAdmin()`(신규), `isValidEventType`/`sanitizeTarget`(Task 2), `isBot`(Task 2), `extractHost`(Task 2), `parseVisitorCookie`(Task 2).
- Produces:
  - `lib/supabase-server.ts`: `function getSupabaseAdmin(): SupabaseClient` — 환경변수 누락 시 throw.
  - `POST /api/track` — JSON `{ type, target?, meta? }` 수신, 봇/무효 입력 차단, `events` insert. 항상 사이트를 막지 않는 응답.

- [ ] **Step 1: Supabase 서버 클라이언트 작성**

Create `lib/supabase-server.ts`:
```ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다.");
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
```

- [ ] **Step 2: `/api/track` Route Handler 작성**

Create `app/api/track/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { isValidEventType, sanitizeTarget } from "@/lib/analytics/events";
import { isBot } from "@/lib/analytics/bot";
import { extractHost } from "@/lib/analytics/url";
import { parseVisitorCookie } from "@/lib/analytics/visitor";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (isBot(req.headers.get("user-agent"))) {
      return NextResponse.json({ ok: true, skipped: "bot" });
    }

    const body = await req.json().catch(() => null);
    if (!body || !isValidEventType(body.type)) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const visitorId = parseVisitorCookie(req.headers.get("cookie"));
    const referrer = extractHost(req.headers.get("referer"));

    await getSupabaseAdmin()
      .from("events")
      .insert({
        type: body.type,
        target: sanitizeTarget(body.target),
        visitor_id: visitorId,
        referrer,
        meta: body.meta && typeof body.meta === "object" ? body.meta : null,
      });

    return NextResponse.json({ ok: true });
  } catch {
    // 수집 실패가 사이트를 막지 않도록 200으로 조용히 무시
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
```

- [ ] **Step 3: 타입체크 / 빌드 확인**

Run: `npm run build`
Expected: 성공. `/api/track` 라우트가 빌드 출력에 표시됨.

- [ ] **Step 4: (환경변수 있을 때) 로컬 수집 스모크 테스트 — 선택**

`.env.local`에 Supabase 키가 설정된 경우에만:
```bash
npm run start &
curl -s -X POST http://localhost:4000/api/track -H "Content-Type: application/json" -H "User-Agent: Mozilla/5.0 Chrome/120" -d '{"type":"pageview","target":"/"}'
```
Expected: `{"ok":true}`. Supabase `events` 테이블에 1행 추가됨.
(환경변수 미설정이면 이 단계는 건너뛰고 배포 후 검증.)

- [ ] **Step 5: 커밋**

```bash
git add lib/supabase-server.ts app/api/track/route.ts
git commit -m "feat: Supabase 서버 클라이언트 + /api/track 수집 엔드포인트"
```

---

### Task 6: 클라이언트 track() 헬퍼 + Tracker 컴포넌트(페이지뷰) + layout 연결

**Files:**
- Create: `lib/track-client.ts`
- Create: `components/Tracker.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `EventType`(Task 2, 타입 import only).
- Produces:
  - `lib/track-client.ts`: `function getOrCreateVisitorId(): string`(클라이언트, 쿠키 `cgu_vid` 1년); `function track(type: EventType, target?: string, meta?: Record<string, unknown>): void`(fire-and-forget, `sendBeacon` 우선).
  - `components/Tracker.tsx`: `<Tracker />` — 마운트 시 `track("pageview", location.pathname)` 1회.

- [ ] **Step 1: 클라이언트 헬퍼 작성**

Create `lib/track-client.ts`:
```ts
"use client";

import type { EventType } from "@/lib/analytics/events";

const VID = "cgu_vid";

export function getOrCreateVisitorId(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)cgu_vid=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()) + Math.round(Math.random() * 1e9);
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${VID}=${encodeURIComponent(id)}; path=/; max-age=${oneYear}; SameSite=Lax`;
  return id;
}

export function track(
  type: EventType,
  target?: string,
  meta?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  try {
    getOrCreateVisitorId(); // 쿠키 보장(서버가 헤더에서 읽음)
    const payload = JSON.stringify({ type, target, meta });
    const url = "/api/track";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* 수집 실패는 무시 */
  }
}
```

- [ ] **Step 2: Tracker 컴포넌트 작성**

Create `components/Tracker.tsx`:
```tsx
"use client";

import { useEffect } from "react";
import { track } from "@/lib/track-client";

export function Tracker() {
  useEffect(() => {
    track("pageview", window.location.pathname);
  }, []);
  return null;
}
```

- [ ] **Step 3: layout에 Tracker 연결**

Modify `app/layout.tsx` — import 추가 후 `<body>` 안 `<Analytics />` 옆에 `<Tracker />` 삽입:
```tsx
import { Tracker } from "@/components/Tracker";
```
그리고 body 내부:
```tsx
        <NoRightClick>{children}</NoRightClick>
        <Analytics />
        <Tracker />
```

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: 커밋**

```bash
git add lib/track-client.ts components/Tracker.tsx app/layout.tsx
git commit -m "feat: 클라이언트 track() + Tracker(페이지뷰) layout 연결"
```

---

### Task 7: CarrierList에 다운로드 / 보험사 링크 클릭 추적 연결

**Files:**
- Modify: `components/CarrierList.tsx`

**Interfaces:**
- Consumes: `track`(Task 6).
- Produces: 보험사 링크(전산·홈페이지·약관·필요서류·치과확인서) 클릭 시 `track("link_click", "<보험사명> · <라벨>")`; PDF 다운로드(`btn-pdf`/`btn-dental`) 클릭 시 `track("download", "<보험사명> · <라벨>")`.

- [ ] **Step 1: Btn에 carrier prop + onClick 추적 추가**

Modify `components/CarrierList.tsx` — 상단 import에 추가:
```tsx
import { track } from "@/lib/track-client";
```

`Btn` 컴포넌트를 carrier 인자를 받도록 수정:
```tsx
function Btn({
  label,
  href,
  cls,
  carrier,
}: {
  label: string;
  href?: string;
  cls?: string;
  carrier?: string;
}) {
  const short = shortLabel(label);
  if (!href)
    return (
      <button className="btn btn-muted" disabled>
        {short}
      </button>
    );
  const isExternal = /전산|홈페이지|필요서류|약관확인/.test(label);
  const isDownload = cls === "btn-pdf" || cls === "btn-dental";
  return (
    <a
      className={`btn ${cls || ""}`}
      href={href}
      onClick={() =>
        track(isDownload ? "download" : "link_click", `${carrier ?? ""} · ${label}`.trim())
      }
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      {...(isDownload ? { download: "" } : {})}
    >
      {short}
    </a>
  );
}
```

- [ ] **Step 2: CarrierRow에서 Btn 호출에 carrier 전달**

Modify `components/CarrierList.tsx` — `CarrierRow` 내부의 모든 `<Btn ... />` 호출에 `carrier={item.name}` 추가. 대상(공제회사 분기 + 일반 분기 양쪽 모두):
- 공제회사 분기: 홈페이지/약관확인/보험금 청구서 PDF Btn 3곳.
- 일반 분기: 전산 접속(삼성 분기 포함)/필요서류 안내/치과치료확인서/보험금 청구서 PDF/홈페이지/약관확인 Btn 전부.

예 (일반 분기 일부):
```tsx
          <Btn label="필요서류 안내" href={L.guide} cls="btn-ghost btn-compact" carrier={item.name} />
          <Btn label="치과치료확인서" href={L.dental} cls="btn-dental btn-compact" carrier={item.name} />
          <Btn label="보험금 청구서 PDF 다운로드" href={L.pdf} cls="btn-pdf" carrier={item.name} />
```
삼성생명 전산 분기의 `<Btn label="전산 접속" ... />` 두 곳, 일반 전산 `<Btn label="전산 접속" ... />`, `홈페이지`, `약관확인` 모두 동일하게 `carrier={item.name}` 추가.

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 성공. (타입 오류 없이 carrier prop 인식)

- [ ] **Step 4: 커밋**

```bash
git add components/CarrierList.tsx
git commit -m "feat: 보험사 링크 클릭·PDF 다운로드 추적 연결"
```

---

### Task 8: 계산기·검색 추적 연결 (Hero 검색, AgeCalculator, MedCalculator)

**Files:**
- Modify: `components/Hero.tsx`
- Modify: `components/AgeCalculator.tsx`
- Modify: `components/MedCalculator.tsx`

**Interfaces:**
- Consumes: `track`(Task 6).
- Produces: 검색어 입력(디바운스) 시 `track("search", query)`; 보험나이 계산 실행 시 `track("calc", "age")`; 실손 계산 실행 시 `track("calc", "med")`.

- [ ] **Step 1: Hero 검색 디바운스 추적**

Modify `components/Hero.tsx` — import 및 디바운스 effect 추가:
```tsx
import { useCallback, useEffect } from "react";
import { track } from "@/lib/track-client";
```
`Hero` 함수 본문 상단(기존 useCallback들 근처)에 추가:
```tsx
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;
    const t = setTimeout(() => track("search", q), 800);
    return () => clearTimeout(t);
  }, [searchQuery]);
```
(주의: import 줄이 이미 `useCallback`만 가져오므로 `useEffect` 추가.)

- [ ] **Step 2: AgeCalculator 계산 추적**

Modify `components/AgeCalculator.tsx`:
- 상단에 `import { track } from "@/lib/track-client";` 추가.
- 나이 계산 결과가 산출되는 지점(계산 함수/effect 내, 유효한 결과가 만들어질 때) 한 번 `track("calc", "age")` 호출. 입력마다 과다 호출되지 않도록, 계산이 "완료되어 결과를 표시할 때"의 경로에 디바운스(예: 결과 표시 effect에 800ms setTimeout) 적용:
```tsx
  useEffect(() => {
    if (!hasValidResult) return; // 실제 결과 변수/조건명으로 대체
    const t = setTimeout(() => track("calc", "age"), 800);
    return () => clearTimeout(t);
  }, [hasValidResult]);
```
구현 시 컴포넌트의 실제 "결과 존재" 상태값에 맞춰 의존성·조건을 연결한다.

- [ ] **Step 3: MedCalculator 계산 추적**

Modify `components/MedCalculator.tsx`:
- 상단에 `import { track } from "@/lib/track-client";` 추가.
- 실손 계산 결과 산출 지점에 동일 패턴으로 `track("calc", "med")` 디바운스 호출 연결.

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: 커밋**

```bash
git add components/Hero.tsx components/AgeCalculator.tsx components/MedCalculator.tsx
git commit -m "feat: 검색·보험나이·실손 계산기 사용 추적 연결"
```

---

### Task 9: `/api/admin/login` (비밀번호 → 세션 쿠키) + 로그아웃

**Files:**
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`

**Interfaces:**
- Consumes: `makeToken`(Task 4).
- Produces:
  - `POST /api/admin/login` — JSON `{ password }`. 일치 시 httpOnly 쿠키 `cgu_admin=<token>` 설정 후 `{ ok: true }`. 불일치 시 401.
  - `POST /api/admin/logout` — 쿠키 만료 후 `{ ok: true }`.

- [ ] **Step 1: 로그인 라우트 작성**

Create `app/api/admin/login/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { makeToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ ok: false, error: "not-configured" }, { status: 500 });
  }
  const body = await req.json().catch(() => null);
  if (!body || body.password !== password) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cgu_admin", makeToken(password), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
  return res;
}
```

- [ ] **Step 2: 로그아웃 라우트 작성**

Create `app/api/admin/logout/route.ts`:
```ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("cgu_admin", "", { path: "/", maxAge: 0 });
  return res;
}
```

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 성공. `/api/admin/login`, `/api/admin/logout` 라우트 표시.

- [ ] **Step 4: 커밋**

```bash
git add app/api/admin/login/route.ts app/api/admin/logout/route.ts
git commit -m "feat: /admin 로그인·로그아웃 라우트(비밀번호→세션 쿠키)"
```

---

### Task 10: `/admin` 통계 페이지 (인증 게이트 + 집계 + CSS 막대 차트 + 로그인 폼)

**Files:**
- Create: `components/admin/BarChart.tsx`
- Create: `components/admin/AdminLogin.tsx`
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `verifyToken`(Task 4), `getSupabaseAdmin`(Task 5), `dailySeries`/`topByTarget`/`topReferrers`/`totalVisitors`/`EventRow`(Task 3).
- Produces:
  - `<BarChart data={Tally[] | DailyPoint[]} ...>` — CSS 막대.
  - `<AdminLogin />` — 비밀번호 폼(클라이언트), `/api/admin/login` 호출 후 새로고침.
  - `/admin` 서버 컴포넌트 — 쿠키 검증 실패 시 `<AdminLogin />`, 성공 시 집계 대시보드. `noindex`.

- [ ] **Step 1: CSS 막대 차트 컴포넌트**

Create `components/admin/BarChart.tsx`:
```tsx
export function BarChart({
  rows,
  unit = "",
}: {
  rows: { label: string; count: number }[];
  unit?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) return <p style={{ color: "#64748b" }}>데이터 없음</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 160, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.label}
          </span>
          <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 6 }}>
            <div
              style={{
                width: `${(r.count / max) * 100}%`,
                minWidth: 2,
                height: 18,
                background: "linear-gradient(90deg,#7c3aed,#06b6d4)",
                borderRadius: 6,
              }}
            />
          </div>
          <span style={{ width: 56, textAlign: "right", fontSize: 13, fontWeight: 600 }}>
            {r.count}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 로그인 폼 컴포넌트**

Create `components/admin/AdminLogin.tsx`:
```tsx
"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      setError(true);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 320, margin: "80px auto", display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 style={{ fontWeight: 800 }}>관리자 로그인</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
      />
      {error && <p style={{ color: "#dc2626", fontSize: 13 }}>비밀번호가 올바르지 않습니다.</p>}
      <button type="submit" style={{ background: "#0f172a", color: "#fff", borderRadius: 8, padding: "10px 12px", fontWeight: 600 }}>
        로그인
      </button>
    </form>
  );
}
```

- [ ] **Step 3: /admin 서버 페이지**

Create `app/admin/page.tsx`:
```tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import {
  dailySeries,
  topByTarget,
  topReferrers,
  totalVisitors,
  type EventRow,
} from "@/lib/analytics/aggregate";
import { BarChart } from "@/components/admin/BarChart";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const token = (await cookies()).get("cgu_admin")?.value;
  if (!verifyToken(token, process.env.ADMIN_PASSWORD)) {
    return <AdminLogin />;
  }

  const { days: daysParam } = await searchParams;
  const days = Number(daysParam) || 30; // 0 또는 미지정이면 30
  const sinceIso = new Date(Date.now() - days * 86400000).toISOString();

  const { data } = await getSupabaseAdmin()
    .from("events")
    .select("created_at,type,target,visitor_id,referrer")
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true })
    .limit(100000);

  const rows = (data ?? []) as EventRow[];
  const series = dailySeries(rows);
  const pageviews = rows.filter((r) => r.type === "pageview").length;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{title}</h2>
      {children}
    </section>
  );

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px", fontFamily: "Pretendard, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>청구닷컴 이용량</h1>
        <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
          {[7, 30, 90, 3650].map((d) => (
            <a key={d} href={`/admin?days=${d}`} style={{ padding: "4px 8px", borderRadius: 6, background: d === days ? "#0f172a" : "#f1f5f9", color: d === days ? "#fff" : "#0f172a" }}>
              {d === 3650 ? "전체" : `${d}일`}
            </a>
          ))}
        </div>
      </header>

      <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
        <Stat label="페이지뷰" value={pageviews} />
        <Stat label="순방문자" value={totalVisitors(rows)} />
        <Stat label="총 이벤트" value={rows.length} />
      </div>

      <Section title="일별 페이지뷰">
        <BarChart rows={series.map((s) => ({ label: s.date, count: s.views }))} />
      </Section>
      <Section title="일별 순방문자">
        <BarChart rows={series.map((s) => ({ label: s.date, count: s.visitors }))} />
      </Section>
      <Section title="PDF 다운로드 TOP">
        <BarChart rows={topByTarget(rows, "download")} unit="회" />
      </Section>
      <Section title="보험사 링크 클릭 TOP">
        <BarChart rows={topByTarget(rows, "link_click")} unit="회" />
      </Section>
      <Section title="유입 경로 TOP">
        <BarChart rows={topReferrers(rows)} unit="회" />
      </Section>
      <Section title="검색어 TOP">
        <BarChart rows={topByTarget(rows, "search")} unit="회" />
      </Section>
      <Section title="계산기 사용">
        <BarChart rows={topByTarget(rows, "calc")} unit="회" />
      </Section>

      <form action="/api/admin/logout" method="post" style={{ marginTop: 32 }}>
        <button formAction="/api/admin/logout" style={{ fontSize: 12, color: "#64748b" }}>로그아웃</button>
      </form>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800 }}>{value.toLocaleString()}</div>
    </div>
  );
}
```
참고: 로그아웃은 단순화를 위해 링크/폼으로 둔다. `<form action>`이 POST 라우트를 직접 부르므로 동작하지만, 동작 안 하면 Task 11에서 작은 클라이언트 버튼으로 대체한다(아래 검증에서 확인).

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 성공. `/admin` 라우트가 동적(`ƒ`)으로 표시.

- [ ] **Step 5: 커밋**

```bash
git add components/admin/BarChart.tsx components/admin/AdminLogin.tsx app/admin/page.tsx
git commit -m "feat: /admin 통계 페이지(인증 게이트·집계·CSS 막대·로그인 폼)"
```

---

### Task 11: 통합 검증 · 문서화 · 배포 안내

**Files:**
- Create: `docs/analytics-setup.md`
- Modify: (검증 결과에 따라) `app/admin/page.tsx` 로그아웃 버튼

**Interfaces:**
- Consumes: 전체.
- Produces: Supabase·Vercel 환경변수 설정 가이드 문서.

- [ ] **Step 1: 전체 테스트 + 빌드**

Run:
```bash
npm test
npm run build
```
Expected: 모든 단위 테스트 통과, 빌드 성공.

- [ ] **Step 2: (환경변수 설정 시) 로컬 E2E 스모크**

`.env.local`에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` 설정 후:
```bash
npm run start
```
브라우저로 확인:
1. `http://localhost:4000` 방문 → Supabase `events`에 `pageview` 적재.
2. 보험사 PDF/링크 클릭, 검색, 계산기 사용 → 각 이벤트 적재.
3. `http://localhost:4000/admin` → 로그인 폼 → 비밀번호 입력 → 대시보드 표시.
4. 로그아웃 버튼 동작 확인. 동작 안 하면 `app/admin/page.tsx`의 로그아웃 form을 클라이언트 버튼으로 교체:
```tsx
// 대체안: 별도 클라이언트 컴포넌트에서
// fetch("/api/admin/logout", { method: "POST" }).then(() => location.reload())
```

- [ ] **Step 3: 설정 가이드 문서 작성**

Create `docs/analytics-setup.md`:
```markdown
# 이용량 수집소 설정 가이드

## 1. Supabase 프로젝트
1. https://supabase.com 가입 → New Project 생성.
2. SQL Editor에서 `supabase/migrations/0001_create_events.sql` 내용 실행.
3. Project Settings → API에서 다음을 복사:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (절대 공개 금지)

## 2. 환경변수 등록
- 로컬: `.env.local` 파일에 `.env.local.example` 형식대로 입력.
- Vercel: Project → Settings → Environment Variables에
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` 추가 후 재배포.

## 3. 확인
- 사이트 방문 후 Supabase `events` 테이블에 행이 쌓이는지 확인.
- `청구.com/admin` 접속 → `ADMIN_PASSWORD`로 로그인 → 통계 확인.

## 4. 영구 조회
- `/admin`에서 기간 "전체" 선택 시 보관된 모든 기간 조회 가능(30일 제한 없음).
- Supabase 웹 Table/SQL Editor에서 원본 직접 조회도 가능.
```

- [ ] **Step 4: 커밋**

```bash
git add docs/analytics-setup.md app/admin/page.tsx
git commit -m "docs: 이용량 수집소 설정 가이드 + 통합 검증 반영"
```

- [ ] **Step 5: 배포**

main으로 머지/푸시(기존 워크플로우)하여 Vercel 배포. **배포 전 Vercel 환경변수 3개 등록 필수** (없으면 `/api/track`·`/admin`이 조용히 실패).

---

## Self-Review (작성자 점검)

**Spec coverage:**
- §3 구조 → Task 5,6,10. §4 데이터모델 → Task 1(SQL), Task 3(EventRow). §5 수집 → Task 6,7,8. §6 /admin → Task 9,10. §7 개인정보/안정성 → Task 2(봇·IP미저장), Task 5(try/catch), Task 6(쿠키만). §8 비용 → 운영(코드 영향 없음). §9 환경변수 → Task 1,11. §10 영향파일 → 전 Task 커버. §11 열린항목(visitor 저장=쿠키, /admin 경로 유지, 봇필터=정규식) 확정됨.
- 모든 spec 요구사항에 대응 Task 존재. 갭 없음.

**Placeholder scan:** "결과 변수/조건명으로 대체"(Task 8) 및 로그아웃 대체안(Task 10/11)은 의도된 구현 시 결정 지점으로, 구체 패턴·코드 제시됨. 그 외 TBD/TODO 없음.

**Type consistency:** `EventType`(events.ts) ↔ track()/route 일치. `EventRow`(aggregate.ts) ↔ /admin select 컬럼 일치. `Tally{label,count}` ↔ BarChart props 일치. `makeToken`/`verifyToken` 시그니처 Task4↔Task9,10 일치. `getSupabaseAdmin` Task5↔Task10 일치.
