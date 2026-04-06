# Story 1.9: GitHub Actions CI 스켈레톤 + check-legal 스켈레톤 + Sentry (품질 인프라)

Status: ready-for-dev

## Story

As a **Operator**,
I want **기본 CI 파이프라인과 에러 트래킹이 자리잡음**,
so that **NFR-O3(Error tracking)와 NFR-O5(법적 가드레일 자동 검증 기반)가 충족되고, 이후 Epic 3에서 확장 가능하다**.

## Acceptance Criteria

1. **Given** Story 1.8이 완료되어 CLAUDE.md와 환경변수 템플릿이 있다, **When** `.github/workflows/ci.yml`이 작성된다, **Then** CI는 `bun install → bun run typecheck → bun run lint → bun run test` 순서로 실행된다
2. CI는 `main` 브랜치 push 및 모든 PR에 대해 트리거된다
3. `scripts/check-legal.ts`는 스켈레톤만 존재한다 (실제 grep 로직은 Epic 3 Story 3.4에서 완성). 지금은 "TODO: Epic 3 Story 3.4에서 구현" 주석과 함께 `process.exit(0)`만 수행
4. `package.json` scripts에 `"check:legal"`이 등록되어 있지만 실제로는 아직 아무것도 검증하지 않는다
5. `bun add @sentry/nextjs`로 Sentry가 설치된다
6. `src/instrumentation.ts`에 Sentry 초기화 코드가 있다 (Next.js 15 표준)
7. Sentry DSN은 환경변수 `SENTRY_DSN`에서 읽어 오며, 환경변수가 없어도 앱은 정상 작동한다

## Tasks / Subtasks

- [ ] Task 1: package.json scripts 정비 (AC: #1, #4)
  - [ ] `package.json`의 `scripts`에 다음 확인/추가:
    - `"dev": "next dev --turbopack"`
    - `"build": "next build"`
    - `"start": "next start"`
    - `"lint": "next lint"`
    - `"typecheck": "tsc --noEmit"`
    - `"test": "vitest run"` (Story 1.7에서 Vitest 이미 설치됨)
    - `"check:legal": "bun scripts/check-legal.ts"`
- [ ] Task 2: scripts/check-legal.ts 스켈레톤 (AC: #3, #4)
  - [ ] `scripts/check-legal.ts` 파일 생성
  - [ ] 주석으로 목적 설명: "Epic 3 Story 3.4에서 완성됨. 현재는 스켈레톤."
  - [ ] `console.log('check-legal: skeleton, will be implemented in Story 3.4')`
  - [ ] `process.exit(0)` — 항상 성공 종료
- [ ] Task 3: GitHub Actions CI workflow 작성 (AC: #1, #2)
  - [ ] `.github/workflows/` 디렉토리 생성
  - [ ] `.github/workflows/ci.yml` 파일 생성
  - [ ] Trigger: `on: [push: {branches: [main]}, pull_request]`
  - [ ] Job: Ubuntu 최신, Bun 설치 action 사용
  - [ ] Steps: checkout → setup bun → bun install → bun run typecheck → bun run lint → bun run test → bun run check:legal
- [ ] Task 4: Sentry 설치 및 초기화 (AC: #5, #6, #7)
  - [ ] `bun add @sentry/nextjs`
  - [ ] `src/instrumentation.ts` 파일 생성 (Next.js 15 표준 위치)
  - [ ] Sentry init 코드 작성 — DSN은 `process.env.SENTRY_DSN`
  - [ ] DSN이 없으면 조용히 초기화 스킵 (`if (!process.env.SENTRY_DSN) return`)
  - [ ] `next.config.ts`가 Sentry wrapper를 선택적으로 사용하도록 (DSN 없어도 빌드 성공)
- [ ] Task 5: CI 로컬 검증 (AC: #1)
  - [ ] 각 단계 로컬에서 실행 가능 확인:
    - `bun install` ✓
    - `bun run typecheck` ✓ (에러 없음)
    - `bun run lint` ✓ (warning/error 없음)
    - `bun run test` ✓ (Story 1.7 budget.test.ts 통과)
    - `bun run check:legal` ✓ (exit 0)
- [ ] Task 6: GitHub push 및 CI 실행 확인 (AC: #2)
  - [ ] 모든 변경사항 commit + push
  - [ ] GitHub Actions 탭에서 workflow 실행 확인
  - [ ] 모든 step 초록색 체크 확인

## Dev Notes

**CI workflow 예시 (`.github/workflows/ci.yml`):**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun run test

      - name: Check legal disclaimer
        run: bun run check:legal
```

**scripts/check-legal.ts 스켈레톤:**

```ts
// scripts/check-legal.ts
//
// TODO: Epic 3 Story 3.4에서 실제 grep 구현
// 현재는 CI 파이프라인의 자리 holder로서 성공 종료만 한다.
//
// 최종 구현: .next/server/app/[slug] 빌드 결과물에서
// "아직 출시 전" disclaimer 문구가 모든 Published Page에 포함되어 있는지
// grep으로 검증. 누락 시 process.exit(1)

console.log('check-legal: skeleton, will be implemented in Story 3.4')
process.exit(0)
```

**Sentry 초기화 (`src/instrumentation.ts`):**

```ts
// src/instrumentation.ts
export async function register() {
  if (!process.env.SENTRY_DSN) {
    return // Sentry 없이 정상 작동
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}
```

**중요**: Sentry DSN이 없어도 빌드/실행이 성공해야 함. 개발 환경에서는 DSN 없이도 작동 가능.

**CI가 아직 Lighthouse 포함 안 함**: Epic 3 Story 3.10에서 추가.

### Project Structure Notes

- `.github/workflows/ci.yml` — GitHub Actions 표준 위치
- `scripts/check-legal.ts` — 프로젝트 루트 `scripts/` 디렉토리
- `src/instrumentation.ts` — Next.js 15 표준 위치 (App Router)

### References

- [Source: architecture.md#Cross-Cutting Concerns#8 CI/Build 파이프라인] — CI 스펙
- [Source: prd.md#NFR-O3, NFR-O5] — Sentry + 법적 가드레일 자동 검증
- [Source: architecture.md#Infrastructure & Deployment] — CI 구성 참조
- [Source: epics.md#Story 1.9] — 원본 AC

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
