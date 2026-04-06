# Story 1.8: CLAUDE.md + 환경변수 템플릿 + README + .gitignore (문서/설정)

Status: done

## Story

As a **Operator**,
I want **AI 어시스턴트 가이드와 프로젝트 메타 문서가 자리잡음**,
so that **Claude Code/Cursor가 세션 시작 시마다 규칙을 자동 로드하고 NFR-M4(미니멀 README)가 충족된다**.

## Acceptance Criteria

1. **Given** Epic 1의 Story 1.1~1.7이 완료되었다, **When** Architecture 문서의 "Implementation Patterns & Consistency Rules" 섹션을 프로젝트 루트의 `CLAUDE.md`로 복사한다, **Then** `CLAUDE.md`는 Naming/Structure/Format/Communication/Process Patterns와 Enforcement Guidelines 6개 MUST 규칙을 포함한다
2. `.env.local.example` 파일이 `DATABASE_URL`, `ANTHROPIC_API_KEY`, `OPERATOR_TOKEN`, `MAX_MONTHLY_USD`, `KILL_SWITCH_OVERRIDE` 5개 변수 템플릿과 주석으로 작성되어 있다
3. `.gitignore`에 `.env.local`, `.next`, `node_modules` 등이 적절히 추가되어 있다
4. `README.md`가 5줄 이내로 (1) 로컬 실행법 (2) 배포 방법 (3) 주요 디렉토리 구조 (4) 주요 의존성 목적을 기록한다

## Tasks / Subtasks

- [x] Task 1: CLAUDE.md 생성 (AC: #1)
  - [x] Naming Patterns (DB, API, Code) 포함
  - [x] Structure Patterns (Project Organization, Test co-location) 포함
  - [x] Format Patterns (API Response, 에러, 날짜, JSON, Boolean) 포함
  - [x] Communication Patterns, Process Patterns 포함
  - [x] Enforcement Guidelines 6개 MUST 규칙 포함
  - [x] Anti-patterns 목록 포함
  - [x] Next.js 16 Breaking Changes (middleware → proxy) 추가
- [x] Task 2: .env.local.example 완성 (AC: #2)
  - [x] 5개 변수 + SENTRY_DSN 선택 항목 포함
- [x] Task 3: .gitignore 확인 (AC: #3)
  - [x] `.env*`, `!.env.local.example` 이미 올바르게 설정됨
  - [x] `.next/`, `node_modules` 포함 확인
- [x] Task 4: README.md 작성 (AC: #4)
  - [x] Setup 4단계, Deploy, Structure, Stack 간결하게 정리

## Dev Notes

**CLAUDE.md의 중요성:**

- Claude Code 세션 시작 시 자동으로 로드되어 AI 어시스턴트의 행동을 결정한다
- 이 파일이 없으면 Architecture의 Implementation Patterns가 무력화됨
- Mhkim은 비개발자이므로, AI가 일관된 코드를 생성하는 유일한 보증 수단

**.env.local.example 예시:**

```bash
# Neon Postgres connection string (from neon.tech dashboard)
DATABASE_URL=postgres://user:pass@host/db?sslmode=require

# Anthropic Claude API key (from console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-...

# Operator Console access token (generate: openssl rand -hex 32)
OPERATOR_TOKEN=your-64-char-hex-token

# Monthly LLM budget cap in USD (Kill Switch threshold)
MAX_MONTHLY_USD=50

# Set to 'true' to bypass Kill Switch (emergency override)
KILL_SWITCH_OVERRIDE=false

# Optional: Sentry DSN for error tracking
# SENTRY_DSN=
```

**README.md 예시 (5줄):**

```markdown
# blog-practice

1인용 아이디어 검증 랜딩페이지 도구. 한 줄 아이디어를 AI 랜딩페이지로 변환하고 광고로 검증.

**Local**: `bun install && bun run dev` (requires Neon + Anthropic + Operator token in `.env.local` — see `.env.local.example`)
**Deploy**: Push to `main` → Vercel auto-deploys (env vars set in Vercel Dashboard)
**Setup once**: Apply `drizzle/custom/slug_immutable.sql` in Neon SQL Editor after first migration.
**Structure**: `src/app/(operator)` (console), `src/app/[slug]` (published pages), `src/lib/{db,llm,schemas}` (logic).
```

**5줄 제약**: NFR-M4 "미니멀 README" 준수. 상세는 CLAUDE.md + planning-artifacts 문서에 있음.

### Project Structure Notes

- `CLAUDE.md` — 프로젝트 루트 (Claude Code 자동 로드 위치)
- `.cursorrules` — 선택. Cursor 사용자면 동일 내용 복사
- `.env.local.example` — 커밋됨 (템플릿)
- `.env.local` — 커밋 안 됨 (실제 값)

### References

- [Source: architecture.md#Implementation Patterns & Consistency Rules] — CLAUDE.md 본문 원본
- [Source: prd.md#NFR-M4] — README 미니멀 요구
- [Source: prd.md#NFR-M1] — AI 어시스턴트 친화 스택 (CLAUDE.md의 존재 이유)
- [Source: epics.md#Story 1.8] — 원본 AC

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

### Completion Notes List

- **Next.js 16 Breaking Change 추가**: `middleware.ts` → `proxy.ts` 변경사항을 CLAUDE.md에 명시. 미래 AI 세션에서 잘못된 파일명 사용 방지.
- **CLAUDE.md = @AGENTS.md + 규칙**: `@AGENTS.md` 참조 유지 (Next.js 16 가이드 읽기 지시)하면서 Implementation Patterns를 추가.

### File List

**수정:**
- `CLAUDE.md` — Implementation Patterns & Consistency Rules 전체 추가
- `.env.local.example` — 5개 변수 + SENTRY_DSN 완성
- `README.md` — Setup/Deploy/Structure/Stack 간결 정리
