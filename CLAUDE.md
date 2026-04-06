@AGENTS.md

# Implementation Patterns & Consistency Rules

AI 어시스턴트가 코드를 생성할 때 매번 다른 결정을 내릴 수 있는 **12개 충돌 지점**을 식별했고, 각각에 대해 단 하나의 선택을 확정한다. 아래 모든 규칙을 항상 따른다.

## Naming Patterns

**Database (Drizzle + Postgres):**
- 테이블명: `snake_case` + 복수형 — `ideas`, `events`, `email_collections`, `llm_calls`
- 컬럼명: `snake_case` — `final_prompt`, `created_at`, `idea_id`
- Drizzle TypeScript 프로퍼티명: `camelCase` — `finalPrompt`, `createdAt`, `ideaId`
- 외래 키: `<참조_테이블_단수>_id` — `idea_id`
- 인덱스명: `<테이블>_<컬럼>_idx` — `ideas_slug_idx`, `events_idea_id_created_at_idx`

**API (Next.js Route Handlers):**
- 엔드포인트: `/api/<리소스_복수>` — `/api/ideas`, `/api/events`
- 개별 리소스: `/api/<리소스>/[id]`
- 서브리소스/액션: `/api/<리소스>/[id]/<액션>` — `/api/ideas/[id]/publish`
- 쿼리 파라미터: `camelCase` — `?status=archived&sortBy=createdAt`

**Code (TypeScript/React):**
- 파일명 — React 컴포넌트: `PascalCase.tsx` — `IdeaCard.tsx`
- 파일명 — 유틸/훅/서비스: `camelCase.ts` — `generateLanding.ts`
- 파일명 — Route Handler: `route.ts` (Next.js 고정)
- 디렉토리명: `kebab-case` — `src/lib/llm/`
- 함수명: `camelCase`, React 컴포넌트명: `PascalCase`
- 상수: `SCREAMING_SNAKE_CASE` — `MAX_MONTHLY_USD`
- 타입/인터페이스: `PascalCase` — `LandingPageData`
- Enum-like: TypeScript union `'draft' | 'active' | 'archived'` (NOT `enum`)

## Structure Patterns

**Project Organization:**
```
src/
  app/
    (operator)/       # Route group, proxy로 보호
    [slug]/           # Published Page (public)
    api/              # Route Handlers
    auth/route.ts     # 토큰 → 쿠키 설정
  lib/
    db/
      client.ts       # Neon 클라이언트 (lazy init)
      schema.ts       # Drizzle 스키마
      queries/        # 재사용 쿼리 함수
    llm/
      generate.ts     # 메인 LLM 호출
      budget.ts       # 순수 함수 (isBudgetExceeded)
      gateway.ts      # 통합 (checkAndEnforceBudget)
    schemas/
      landing.ts      # Zod: LandingPageData (SSoT)
  components/
    operator/
    published/
    shared/
```

**테스트 파일 위치:** `*.test.ts`는 소스 파일과 동일 디렉토리에 co-locate (`__tests__/` 사용 안 함).

**환경 파일:**
- `.env.local` — 개발 시크릿 (git ignore)
- `.env.local.example` — 템플릿 (git commit)
- `.env.production` — 사용 안 함 (Vercel 대시보드에서 관리)

## Format Patterns

**API Response:**
```ts
// ✅ Good — 데이터 직접 반환
return NextResponse.json({ id: '...', slug: '...', status: 'active' })

// ❌ Bad — wrapper 금지
return NextResponse.json({ data: { id: '...' }, error: null })
```

**에러 응답:** `{ error: string, code?: string }`
```ts
return NextResponse.json({ error: 'Idea not found', code: 'NOT_FOUND' }, { status: 404 })
```

**HTTP 상태 코드:**
- `200` — GET/PATCH 성공, `201` — POST 생성, `204` — DELETE
- `400` — 잘못된 요청, `401` — 인증 실패, `404` — 없음
- `422` — Zod validation 실패, `429` — Kill Switch, `500` — 서버 에러

**날짜/시간:** DB → 클라이언트는 ISO 8601, 표시는 `toLocaleString('ko-KR')`. 저장은 UTC.

**JSON 필드:** 요청/응답 JSON은 `camelCase`. Boolean은 `true`/`false` (`1`/`0` 금지).

## Communication Patterns

**이벤트 수집:**
- Event type: `snake_case` — `page_view`, `cta_click`, `email_submit`, `invalid_email`
- `POST /api/events` body: `{ ideaId, eventType, metadata? }`
- 타임스탬프는 서버 시간 (클라이언트 시간 무시)
- `navigator.sendBeacon` 실패 시 `fetch(..., { keepalive: true })` fallback

**State Management:**
- 서버 상태: TanStack Query (`useQuery`, `useMutation`)
- 로컬 편집 상태: Zustand store
- URL 상태: Next.js router

## Process Patterns

**에러 처리:** 모든 Route Handler는 최상위 try/catch. Zod 에러는 422.

**로딩 상태:** TanStack Query의 `isPending`, `isError` 활용. 전역 로딩 상태 만들지 않음.

**재시도:** LLM 호출 1회 자동 재시도, 이후 사용자 버튼. TanStack Query 4xx 재시도 안 함.

**Validation:** 클라이언트는 blur 시, Route Handler는 즉시. DB 쓰기 전 별도 검증 없음.

## Enforcement Guidelines

**All AI Agents MUST:**

1. **이 섹션의 모든 규칙을 암묵적으로 적용**한다. 새 파일·함수·쿼리를 만들 때 반드시 여기 정의된 명명·구조·형식을 따른다.
2. **규칙에 없는 경우**는 기존 코드베이스의 패턴을 답습한다. 새로운 패턴을 도입하지 않는다.
3. **규칙과 충돌하는 상황**이 발생하면 **사용자에게 물어본다.** 자체 판단으로 규칙을 깨지 않는다.
4. **Zod 스키마(`src/lib/schemas/`)는 Single Source of Truth**이다. 중복 타입 정의 금지.
5. **테스트 파일은 co-location**이다. `__tests__` 디렉토리 만들지 않는다.
6. **환경변수 접근은 `process.env.XXX` 직접**. 래퍼 모듈 만들지 않는다 (YAGNI).

## Anti-Patterns (금지)

- ❌ `return { data, error: null }` wrapper (direct return 사용)
- ❌ `snake_case` 변수명 in TypeScript (`camelCase` 사용)
- ❌ `enum` 타입 (TypeScript union 사용)
- ❌ `__tests__` 디렉토리 (co-location 사용)
- ❌ Provider abstraction interface (함수 1개가 경계)
- ❌ Global loading 상태 store (TanStack Query 사용)
- ❌ `new Date().toString()` (ISO 사용)
- ❌ `localStorage.setItem('draft', ...)` (서버 저장 사용)

## Next.js 16 Breaking Changes

- `middleware.ts` → `proxy.ts`, 함수명 `middleware` → `proxy`
- Middleware는 deprecated, 파일명은 반드시 `proxy.ts`
