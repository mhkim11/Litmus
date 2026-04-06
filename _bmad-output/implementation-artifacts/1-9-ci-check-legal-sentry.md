# Story 1.9: GitHub Actions CI 스켈레톤 + check-legal 스켈레톤 + Sentry (품질 인프라)

Status: done

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

- [x] Task 1: package.json scripts 정비 (AC: #1, #4)
  - [x] dev, build, start, lint, typecheck, test, check:legal 스크립트 추가
  - [x] lint: `next lint` → `eslint .` (Next.js 16에서 next lint 명령 없음)
- [x] Task 2: scripts/check-legal.ts 스켈레톤 (AC: #3, #4)
  - [x] `scripts/check-legal.ts` 생성, process.exit(0) 스켈레톤
- [x] Task 3: GitHub Actions CI workflow 작성 (AC: #1, #2)
  - [x] `.github/workflows/ci.yml` 생성
  - [x] main push + PR 트리거
  - [x] oven-sh/setup-bun@v2 사용
- [x] Task 4: Sentry 설치 및 초기화 (AC: #5, #6, #7)
  - [x] @sentry/nextjs@10.47.0 설치
  - [x] `src/instrumentation.ts` — SENTRY_DSN 없으면 조용히 스킵
- [x] Task 5: CI 로컬 검증 (AC: #1)
  - [x] typecheck ✓, lint ✓, test 3/3 ✓, check:legal ✓
- [ ] Task 6: GitHub push 및 CI 실행 확인 (AC: #2)
  - [ ] GitHub Actions 탭에서 초록색 체크 확인

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

Claude Sonnet 4.6 via Claude Code

### Debug Log References

- typecheck: 통과
- lint: `require()` → ES import 변환 후 통과 (drizzle.config.ts)
- test: 3/3 pass
- check:legal: exit 0

### Completion Notes List

- **next lint 없음**: Next.js 16에서 `next lint` CLI 명령이 제거됨. `eslint .` 직접 실행으로 대체.
- **drizzle.config.ts require() 수정**: 린트 에러로 발견 — `require('node:fs')` → `import fs from 'node:fs'` 상단으로 이동.
- **Sentry edge import**: `@sentry/nextjs/edge`가 없어 `@sentry/nextjs`로 통일.

### File List

**생성:**
- `.github/workflows/ci.yml` — GitHub Actions CI
- `scripts/check-legal.ts` — 스켈레톤 (Story 3.4에서 완성)
- `src/instrumentation.ts` — Sentry 초기화 (DSN 없으면 스킵)

**수정:**
- `package.json` — scripts 추가, @sentry/nextjs 추가
- `drizzle.config.ts` — require() → ES import 변환
- `bun.lock` — 업데이트
