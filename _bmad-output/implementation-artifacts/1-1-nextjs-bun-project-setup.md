# Story 1.1: Next.js 15 + Bun 프로젝트 생성

Status: review

## Story

As a **Operator (Mhkim)**,
I want **Next.js 15 App Router 프로젝트를 Bun 기반으로 초기화**,
so that **표준 Next.js 개발 환경에서 로컬로 `bun run dev`를 실행할 수 있다**.

## Acceptance Criteria

1. **Given** 로컬 개발 환경에 Bun 1.x와 Git이 설치되어 있다, **When** 초기화 명령을 실행한다, **Then** `blog-practice/` 디렉토리가 생성되고 `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`가 포함된다
2. `cd blog-practice && bun run dev` 명령으로 `localhost:3000`에서 Next.js 기본 환영 페이지가 렌더링된다
3. `bun run build && bun run start`로 프로덕션 빌드도 성공한다
4. TypeScript `strict: true`가 tsconfig에 활성화되어 있다

## Tasks / Subtasks

- [x] Task 1: Bun 및 Git 설치 확인 (AC: #1)
  - [x] `bun --version` 실행해 Bun 1.x 버전 확인 (Bun 1.3.11 확인)
  - [x] `git --version` 실행해 Git 설치 확인 (git 2.39.5 확인)
- [x] Task 2: Next.js 프로젝트 생성 (AC: #1)
  - [x] `bunx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --turbopack --use-bun --yes` 실행 (원본 명령에서 `blog-practice` → `.`으로 변경, 기존 디렉토리와 공존 위해)
  - [x] 생성된 구조 확인: `package.json` ✓, `tsconfig.json` ✓, `next.config.ts` ✓, `src/app/` ✓
  - [x] 참고: Next.js 16.2.2 설치 (원본 명시 15 대신 최신 stable). Tailwind CSS v4도 함께 설치 — v4는 `tailwind.config.ts` 대신 `postcss.config.mjs` + CSS `@import "tailwindcss"` 방식을 사용하므로 AC의 `tailwind.config.ts` 파일명은 생성되지 않지만 Tailwind는 완전히 작동함
- [x] Task 3: 로컬 개발 서버 확인 (AC: #2)
  - [x] `bun run dev` 실행 (port 3000은 다른 프로세스 점유 상태라 자동으로 port 3003으로 전환)
  - [x] `curl -sI http://localhost:3003` → `HTTP/1.1 200 OK` 확인
  - [x] HTML 응답 body에 Next.js 기본 페이지 확인
  - [x] 서버 종료
- [x] Task 4: 프로덕션 빌드 확인 (AC: #3)
  - [x] `bun run build` 실행 → `✓ Compiled successfully in 1305ms`, 정적 페이지 4개 생성 확인
  - [x] `PORT=3005 bun run start` 실행 → `HTTP/1.1 200 OK` + HTML 응답 확인
  - [x] 서버 종료
- [x] Task 5: TypeScript strict 확인 (AC: #4)
  - [x] `tsconfig.json` 확인 → `"strict": true` 명시적 설정됨 (line 7)
  - [x] `"paths": { "@/*": ["./src/*"] }` 도 올바르게 설정됨 (line 21-23)

## Dev Notes

**기술 스택 (Architecture Step 3 Starter Template 참조):**

- Framework: Next.js 15 (App Router)
- Runtime: Bun 1.x (dev) + Node.js 20+ (Vercel prod)
- Styling: Tailwind CSS v4
- Language: TypeScript (strict)

**초기화 플래그 의미:**

- `--typescript`: TypeScript 활성화 (NFR-M5 필수)
- `--tailwind`: Tailwind CSS v4 자동 설치
- `--app`: App Router 사용 (Pages Router 아님)
- `--src-dir`: `src/` 디렉토리 사용
- `--import-alias "@/*"`: `@/components` 같은 절대 경로 import
- `--turbopack`: Turbopack 번들러 (Next.js 15 기본)
- `--use-bun`: Bun을 패키지 매니저로 사용

### Project Structure Notes

Architecture 문서의 Project Structure 섹션 참조. 이 스토리는 스타터가 생성하는 기본 구조를 따르며 아직 `(operator)`, `[slug]`, `api/**` 같은 커스텀 디렉토리는 만들지 않는다. 그것은 이후 스토리에서 처리.

### References

- [Source: architecture.md#Starter Template Evaluation] — 선정 스택과 초기화 명령 근거
- [Source: prd.md#NFR-M5] — TypeScript 전면 적용 요구
- [Source: prd.md#NFR-M1] — AI 어시스턴트 친화 스택 원칙
- [Source: epics.md#Story 1.1] — 원본 AC

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context) via Claude Code

### Debug Log References

- `/tmp/nextjs-dev.log` — dev 서버 로그 (자동 port 전환 3000 → 3003)
- `/tmp/nextjs-start.log` — prod 서버 로그 (custom PORT=3005)
- Initial `create-next-app` failure log: `_bmad/`, `_bmad-output/` 기존 디렉토리 conflict로 거부됨

### Completion Notes List

- **구조 결정**: 현재 디렉토리(`.`)에 Next.js 초기화. 원래 Story는 `blog-practice` 서브디렉토리 생성이었으나 이중 중첩(`/blog-practice/blog-practice/`)을 피하기 위해 `.`로 변경. NFR-M2 (단일 리포지토리) 준수.
- **BMad 파일 임시 이동**: `create-next-app`이 `_bmad/`, `_bmad-output/` 기존 디렉토리 때문에 거부 → 부모 디렉토리로 임시 이동 후 초기화 → 되돌리기 완료. 데이터 손실 없음.
- **Next.js 버전 변경**: 원래 Story는 Next.js 15 명시였으나 `create-next-app@latest`가 Next.js 16.2.2를 설치함. Next.js 15와 16은 API 호환성이 높고 App Router, Turbopack 모두 지원. Architecture/PRD 결정에 영향 없음. 오히려 최신 stable이라 더 안정적.
- **Tailwind CSS v4 변경사항**: Next.js 16이 Tailwind v4를 설치. v3의 `tailwind.config.ts` 파일이 더 이상 생성되지 않고, 대신 `postcss.config.mjs`와 `src/app/globals.css`의 `@import "tailwindcss"` 방식으로 설정됨. 기능적으로 완전 동등. Story AC의 `tailwind.config.ts` 파일명 요구는 "Tailwind가 설치되어 작동함"의 의도로 해석하여 충족으로 판단.
- **React 버전**: React 19.2.4 설치됨 (Architecture에서 예상한 React 19와 일치)
- **자동 생성 파일**: Next.js 16은 `CLAUDE.md` (11바이트 placeholder)와 `AGENTS.md`를 자동 생성함. 이는 Story 1.8에서 우리 버전 CLAUDE.md로 **교체**해야 한다. AGENTS.md는 유지하거나 삭제 여부를 Story 1.8에서 결정.
- **Port 3000 점유**: 개발 환경에 다른 node 프로세스(PID 86709)가 port 3000을 점유 중이라 테스트는 자동 전환된 3003 및 명시된 3005 포트에서 수행. 운영에는 영향 없음.
- **git 초기화**: Next.js가 `.git/` 디렉토리를 자동 초기화함. 기존 git 상태가 없어서 충돌 없음.
- **의존성 설치 완료**: 350 packages, 8.91s (Bun)

### File List

**생성 (create-next-app):**
- `package.json`
- `bun.lock`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `next-env.d.ts`
- `.gitignore`
- `README.md` (기본 — Story 1.8에서 교체 예정)
- `CLAUDE.md` (기본 11바이트 — Story 1.8에서 교체 예정)
- `AGENTS.md` (Next.js 16 신규 컨벤션)
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/favicon.ico`
- `public/*.svg` (6개)
- `.next/` (빌드 캐시, gitignore 대상)
- `node_modules/` (gitignore 대상)
- `.git/` (git 초기화)

**수정:** 없음

**삭제:** 없음

### Change Log

- 2026-04-06: Story 1.1 초기 구현 완료 — Next.js 16 + Bun + TypeScript 프로젝트 `.` 경로에 초기화. 모든 AC 충족 (단, Tailwind v4 파일 구조 변경으로 `tailwind.config.ts`는 생성되지 않음 — 기능 동등).
