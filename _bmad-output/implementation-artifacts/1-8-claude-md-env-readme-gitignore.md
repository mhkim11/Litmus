# Story 1.8: CLAUDE.md + 환경변수 템플릿 + README + .gitignore (문서/설정)

Status: ready-for-dev

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

- [ ] Task 1: CLAUDE.md 생성 (AC: #1)
  - [ ] 프로젝트 루트에 `CLAUDE.md` 파일 생성
  - [ ] Architecture 문서(`_bmad-output/planning-artifacts/architecture.md`)의 "Implementation Patterns & Consistency Rules" 섹션 복사
  - [ ] Naming Patterns (DB, API, Code) 포함
  - [ ] Structure Patterns (Project Organization, Test co-location) 포함
  - [ ] Format Patterns (API Response, 에러, 날짜, JSON, Boolean) 포함
  - [ ] Communication Patterns (이벤트, State Management) 포함
  - [ ] Process Patterns (에러 처리, 로딩, 재시도, Validation) 포함
  - [ ] Enforcement Guidelines 6개 MUST 규칙 포함
  - [ ] Good/Anti-pattern 예시 포함
- [ ] Task 2: .env.local.example 생성 (AC: #2)
  - [ ] 프로젝트 루트에 `.env.local.example` 파일 생성
  - [ ] 5개 변수 템플릿 작성 (실제 값 없음, 주석으로 설명)
- [ ] Task 3: .gitignore 확인 및 보강 (AC: #3)
  - [ ] Next.js 스타터가 생성한 `.gitignore` 확인
  - [ ] `.env.local`, `.env*.local` 포함 확인 (Next.js 기본)
  - [ ] `.next`, `node_modules` 포함 확인
  - [ ] 필요시 `drizzle/custom/*.local.sql` 같은 로컬 전용 파일 추가
- [ ] Task 4: README.md 작성 (AC: #4)
  - [ ] 프로젝트 루트의 기본 `README.md` 교체 또는 편집
  - [ ] 5줄 이내로 압축:
    1. 한 줄 프로젝트 설명
    2. 로컬 실행: `bun install && bun run dev`
    3. 배포: `git push main → Vercel auto-deploy`
    4. 주요 디렉토리: `src/app/(operator)`, `src/app/[slug]`, `src/lib/{db,llm,schemas}`
    5. Setup 한 번: Neon URL + Anthropic 키 + Operator 토큰 `.env.local`에 설정, `drizzle/custom/slug_immutable.sql` 실행

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
