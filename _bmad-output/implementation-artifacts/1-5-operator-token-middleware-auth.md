# Story 1.5: Operator 토큰 middleware + /auth route

Status: ready-for-dev

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

- [ ] Task 1: OPERATOR_TOKEN 생성 및 설정 (AC: #1, #5)
  - [ ] 터미널에서 `openssl rand -hex 32` 실행 → 토큰 복사
  - [ ] `.env.local`에 `OPERATOR_TOKEN=<생성된 값>` 추가
  - [ ] `.env.local.example`에 `OPERATOR_TOKEN=replace-with-openssl-rand-hex-32` 추가 (값 없이 템플릿만)
  - [ ] Vercel Dashboard → Settings → Environment Variables에 동일 값 등록
- [ ] Task 2: (operator) route group + placeholder 페이지 생성 (AC: #6)
  - [ ] `src/app/(operator)/` 디렉토리 생성
  - [ ] `src/app/(operator)/page.tsx` 생성 — "Operator Console Placeholder" 텍스트만 표시
  - [ ] `src/app/(operator)/layout.tsx` 생성 — 기본 레이아웃 (후속 스토리에서 확장)
- [ ] Task 3: middleware 작성 (AC: #1)
  - [ ] `src/middleware.ts` 생성
  - [ ] `NextRequest`에서 `op-token` 쿠키 읽기
  - [ ] `OPERATOR_TOKEN`과 비교, 불일치 시 `new Response('Unauthorized', { status: 401 })`
  - [ ] `export const config = { matcher: ['/(operator)/:path*'] }` 설정 — route group 전체 보호
- [ ] Task 4: /auth route handler 작성 (AC: #2, #3, #4)
  - [ ] `src/app/auth/route.ts` 생성
  - [ ] GET handler 구현: `req.nextUrl.searchParams.get('token')` 읽기
  - [ ] `OPERATOR_TOKEN`과 비교
  - [ ] 일치: `NextResponse.redirect(new URL('/operator', req.url))` + `response.cookies.set('op-token', ...)` (httpOnly, secure, sameSite=lax, path=/, maxAge=60*60*24*365)
  - [ ] 불일치: `new Response('Unauthorized', { status: 401 })`
- [ ] Task 5: 로컬 동작 테스트 (AC: #1, #6)
  - [ ] `bun run dev`
  - [ ] 쿠키 없이 `http://localhost:3000/operator` 접속 → 401
  - [ ] `http://localhost:3000/auth?token=<OPERATOR_TOKEN값>` 접속 → `/operator`로 리다이렉트 + 쿠키 설정
  - [ ] `/operator`에서 "Operator Console Placeholder" 표시 확인
  - [ ] 쿠키 삭제 후 `/operator` 재접속 → 401
- [ ] Task 6: Vercel 배포 확인 (AC: #5)
  - [ ] git push → Vercel 자동 배포
  - [ ] 배포 URL에서 `/auth?token=<value>` → 쿠키 설정 확인
  - [ ] `/operator` 접근 확인

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
