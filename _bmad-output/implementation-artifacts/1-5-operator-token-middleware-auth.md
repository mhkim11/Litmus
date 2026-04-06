# Story 1.5: Operator 토큰 middleware + /auth route

Status: done

## Story

As a **Operator**,
I want **환경변수 토큰으로 Operator Console을 보호하는 middleware와 토큰 교환 route**,
so that **NFR-S5(접근 제어)가 구현되어 외부인이 Operator Console에 접근할 수 없다**.

## Acceptance Criteria

1. **Given** `.env.local`에 `OPERATOR_TOKEN=<openssl rand -hex 32로 생성한 값>`이 설정되어 있다, **When** `src/middleware.ts`에 Next.js middleware를 작성해 `(operator)` route group을 보호한다, **Then** `/operator` 류 경로 접근 시 쿠키의 `op-token`이 `OPERATOR_TOKEN`과 일치하지 않으면 401 Unauthorized가 반환된다
2. `src/app/auth/route.ts`에 GET handler가 존재해 `?token=<value>` 쿼리 파라미터를 받아 `OPERATOR_TOKEN`과 비교한다
3. 일치 시 `op-token` 쿠키를 `httpOnly, secure, sameSite=lax, maxAge 1년`으로 설정하고 `/operator`로 리다이렉트한다
4. 불일치 시 401 Unauthorized를 반환한다
5. Vercel Environment Variables에도 `OPERATOR_TOKEN`이 등록되어 있다
6. 임시 페이지 `src/app/(operator)/page.tsx`에 "Operator Console Placeholder" 텍스트가 표시되고, 토큰 없이 접근하면 차단된다

## Tasks / Subtasks

- [x] Task 1: OPERATOR_TOKEN 생성 및 설정 (AC: #1, #5)
  - [x] `openssl rand -hex 32` 실행 → 토큰 생성
  - [x] `.env.local`에 `OPERATOR_TOKEN=` 추가
  - [x] `.env.local.example`에 `OPERATOR_TOKEN=replace-with-openssl-rand-hex-32` 추가
  - [x] Vercel Dashboard → Settings → Environment Variables에 등록
- [x] Task 2: (operator) route group + placeholder 페이지 생성 (AC: #6)
  - [x] `src/app/(operator)/layout.tsx` 생성
  - [x] `src/app/(operator)/operator/page.tsx` 생성 — URL: `/operator` (route group 중첩)
- [x] Task 3: proxy.ts 작성 (AC: #1) — Next.js 16에서 middleware.ts → proxy.ts로 변경
  - [x] `src/proxy.ts` 생성 (middleware.ts 아님 — Next.js 16 breaking change)
  - [x] `op-token` 쿠키 읽어 `OPERATOR_TOKEN`과 비교
  - [x] 불일치 시 `new Response('Unauthorized', { status: 401 })`
  - [x] `matcher: ['/operator/:path*']` — 실제 URL 경로 기준
- [x] Task 4: /auth route handler 작성 (AC: #2, #3, #4)
  - [x] `src/app/auth/route.ts` 생성
  - [x] token 파라미터 비교 → 일치 시 `/operator` 리다이렉트 + httpOnly 쿠키 설정
  - [x] 불일치 시 401
- [x] Task 5: 로컬 동작 테스트 (AC: #1, #6)
  - [x] `/operator` 쿠키 없이 접속 → Unauthorized
  - [x] `/auth?token=<value>` → `/operator` 리다이렉트 + "Operator Console Placeholder" 표시
- [ ] Task 6: Vercel 배포 확인 (AC: #5)
  - [ ] git push → Vercel 자동 배포
  - [ ] 배포 URL에서 동작 확인

## Dev Notes

**Architecture 결정 7 (Operator Console 접근 제어) 전체 구현 참조.**

**middleware.ts 예시:**

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('op-token')?.value
  if (token !== process.env.OPERATOR_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/(operator)/:path*'],
}
```

**`/auth/route.ts` 예시:**

```ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (token !== process.env.OPERATOR_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }
  const response = NextResponse.redirect(new URL('/operator', req.url))
  response.cookies.set('op-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}
```

**중요한 Next.js 15 제약:**

- Middleware에서는 `cookies.get()`만 가능. `cookies.set()`은 **Route Handler 또는 Server Action에서만** 가능.
- 그래서 토큰 교환은 middleware가 아닌 `/auth` route handler에서 수행.

**보안 수준:**

- 이것은 "자물쇠 한 개" 수준의 보안 (NFR-S5). 로그인 시스템, 비밀번호 해싱, 세션 관리 아님.
- 본인용 도구 맥락에서 충분.

### Project Structure Notes

- `src/middleware.ts` — Next.js 표준 위치 (`src/` 바로 아래)
- `src/app/(operator)/` — route group, URL 경로에는 `(operator)` 포함되지 않음 (`/` 또는 `/operator` 실제 경로)
- **중요**: `(operator)/page.tsx`의 URL은 `/operator`가 아닐 수 있음. route group 내 첫 페이지가 `/`로 매핑될 수도 있으므로, 명시적 `/operator/page.tsx` 경로가 필요하면 `(operator)/operator/page.tsx`로 조정

### References

- [Source: architecture.md#Core Architectural Decisions#결정 7 (Authentication & Security)] — 전체 구현 코드
- [Source: prd.md#NFR-S5] — 토큰 접근 제어 요구
- [Source: architecture.md#Implementation Patterns#Enforcement Guidelines] — AI 어시스턴트 주의사항
- [Source: epics.md#Story 1.5] — 원본 AC

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

- 로컬 테스트: `/operator` → Unauthorized ✓
- 로컬 테스트: `/auth?token=<value>` → `/operator` 리다이렉트 + "Operator Console Placeholder" ✓

### Completion Notes List

- **Next.js 16 Breaking Change**: `middleware.ts` → `proxy.ts`, 함수명도 `middleware` → `proxy`. Story Dev Notes는 `middleware.ts`로 작성되어 있었으나 실제 구현은 `proxy.ts`로 수정.
- **Route group URL 매핑**: `(operator)/page.tsx`는 URL `/`에 매핑됨. `/operator` URL이 필요해서 `(operator)/operator/page.tsx` 구조로 작성. matcher도 `/(operator)/:path*` 아닌 `/operator/:path*` 사용.
- **Proxy 기본 runtime**: Next.js 16에서 Proxy(구 Middleware)는 Node.js runtime이 기본값. Edge runtime 제약 없음.

### File List

**생성:**
- `src/proxy.ts` — Operator 접근 제어 (Next.js 16 proxy, op-token 쿠키 검증)
- `src/app/auth/route.ts` — 토큰 교환 + 쿠키 설정 GET handler
- `src/app/(operator)/layout.tsx` — Operator route group 레이아웃
- `src/app/(operator)/operator/page.tsx` — Placeholder 페이지 (URL: /operator)

**수정:**
- `.env.local` — OPERATOR_TOKEN 추가 (gitignored)
- `.env.local.example` — OPERATOR_TOKEN 템플릿 추가
