# Story 1.3: Drizzle 설정 + 4 테이블 스키마 마이그레이션

Status: review

## Story

As a **Operator**,
I want **Drizzle ORM으로 4개 테이블(ideas, events, email_collections, llm_calls)의 스키마를 정의하고 Neon에 마이그레이션**,
so that **이후 모든 Story가 안정된 DB 스키마 위에서 구현될 수 있다**.

## Acceptance Criteria

1. **Given** Story 1.2까지 Neon DB 연결이 확인된 상태, **When** `bun add drizzle-orm @neondatabase/serverless && bun add -D drizzle-kit`로 의존성을 설치한다, **Then** `drizzle.config.ts`가 프로젝트 루트에 생성되어 Neon DATABASE_URL을 참조한다
2. `src/lib/db/schema.ts`에 `ideas`, `events`, `email_collections`, `llm_calls` 4개 테이블이 Architecture 문서의 스키마와 정확히 일치하게 정의된다
3. `ideas` 테이블에 `published_at TIMESTAMP` 컬럼이 포함된다 (nullable, 발행 시점 기록용)
4. `bunx drizzle-kit generate`로 첫 마이그레이션 SQL 파일이 `drizzle/` 디렉토리에 생성된다
5. `bunx drizzle-kit migrate`로 Neon에 마이그레이션이 적용되고 4개 테이블이 실제로 생성된다
6. 각 테이블의 인덱스(`ideas_slug_idx`, `events_idea_id_created_at_idx`, `email_collections_idea_email_idx`, `llm_calls_created_at_idx`)가 포함되어 있다
7. `ideas.status` 컬럼이 enum 타입 `'draft' | 'active' | 'archived'`로 정의되고 기본값이 `'draft'`이다

## Tasks / Subtasks

- [x] Task 1: Drizzle 의존성 설치 (AC: #1)
  - [x] `bun add drizzle-orm` → drizzle-orm@0.45.2 설치
  - [x] `bun add -D drizzle-kit @types/node` → drizzle-kit@0.31.10, @types/node@25.5.2 설치
- [x] Task 2: drizzle.config.ts 작성 (AC: #1)
  - [x] 프로젝트 루트에 `drizzle.config.ts` 생성
  - [x] `schema: './src/lib/db/schema.ts'`, `out: './drizzle'`, `dialect: 'postgresql'`, `dbCredentials: { url: process.env.DATABASE_URL }` 설정
  - [x] **추가**: drizzle-kit이 Next.js `.env.local`을 자동 로드하지 않아 수동 env 로딩 로직 포함 (inline, dotenv 의존성 회피)
- [x] Task 3: schema.ts 작성 — ideas 테이블 (AC: #2, #3, #7)
  - [x] `src/lib/db/schema.ts` 파일 생성
  - [x] `ideas` 테이블 정의: id (uuid PK), slug (text nullable — draft 상태 허용), status (text enum draft/active/archived, default draft), final_prompt, final_instructions, final_page_data (jsonb), noindex (boolean default true), created_at, updated_at, **published_at**, archived_at (모두 timestamptz)
- [x] Task 4: schema.ts — events 테이블 (AC: #2)
  - [x] `events` 테이블 정의: id (uuid PK), idea_id (uuid FK cascade), event_type (text enum: page_view/cta_click/email_submit/invalid_email), metadata (jsonb), created_at
- [x] Task 5: schema.ts — email_collections 테이블 (AC: #2)
  - [x] `email_collections` 테이블 정의: id (uuid PK), idea_id (uuid FK cascade), email (text), created_at
- [x] Task 6: schema.ts — llm_calls 테이블 (AC: #2)
  - [x] `llm_calls` 테이블 정의: id (uuid PK), idea_id (uuid FK set null), provider, model, prompt_tokens, completion_tokens (numeric), cost_usd (numeric(10,6)), duration_ms (numeric), success (boolean), error_message, created_at
- [x] Task 7: 인덱스 정의 (AC: #6)
  - [x] `ideas_slug_idx` (unique on slug) ✓
  - [x] `ideas_status_idx` (index on status) ✓
  - [x] `ideas_updated_at_idx` (보너스 — Dashboard ORDER BY 최적화) ✓
  - [x] `events_idea_id_created_at_idx` (compound index) ✓
  - [x] `events_event_type_idx` ✓
  - [x] `email_collections_idea_email_idx` (unique compound) ✓
  - [x] `llm_calls_created_at_idx` ✓
- [x] Task 8: 마이그레이션 생성 및 적용 (AC: #4, #5)
  - [x] `bunx drizzle-kit generate` 실행 → `drizzle/0000_tan_sharon_carter.sql` 파일 생성 확인
  - [x] `bunx drizzle-kit migrate` 실행 → Neon에 스키마 적용 성공 (`[✓] migrations applied successfully!`)
  - [x] `information_schema` 직접 쿼리로 4 테이블 존재 확인: email_collections, events, ideas, llm_calls
  - [x] `ideas` 11개 컬럼 + 기본값 모두 확인
  - [x] `pg_indexes` 쿼리로 모든 인덱스 (PK 포함 11개) 존재 확인
  - [x] `/api/db-ping` 여전히 정상 작동 확인 (기존 기능 회귀 없음)

## Dev Notes

**Architecture 결정 8 (Core Architectural Decisions) 참조:** 정확한 스키마 정의가 architecture.md에 있음. 그대로 복사.

**핵심 스키마 특징:**

- `ideas.finalPageData`는 `jsonb` + `$type<LandingPageData>()` (Story 1.6에서 Zod 타입과 연결)
- `ideas.noindex`는 기본값 `true` (FR54, NFR-SEO 회피)
- `events.eventType`은 `'page_view' | 'cta_click' | 'email_submit' | 'invalid_email'` union
- `email_collections`에 `(idea_id, email)` unique index — 중복 방지 (FR38)
- `llm_calls`의 `cost_usd`는 `numeric(10, 6)` (6자리 소수점)
- `onDelete: 'cascade'`: events, email_collections
- `onDelete: 'set null'`: llm_calls (비용 기록 보존)
- **`published_at` 컬럼**: Party Mode 추가 — Story 3.2에서 Publish 시 NOW() 기록, Story 4.3 시간 기반 상태 메시지가 참조

**slug 불변성**: 이 스토리에서는 unique index만 생성. Postgres 트리거는 Story 1.4에서 별도 마이그레이션으로 추가.

**Drizzle 컨벤션 (Architecture Implementation Patterns):**

- 테이블명 snake_case 복수형, TypeScript 프로퍼티는 camelCase
- Drizzle의 column mapping 기능으로 자동 변환

### Project Structure Notes

- `src/lib/db/schema.ts` — Drizzle 스키마 파일 (단일)
- `drizzle/` — 자동 생성 마이그레이션 SQL (commit)
- `drizzle/custom/` — 디렉토리만 미리 생성 (Story 1.4에서 사용)

### References

- [Source: architecture.md#Core Architectural Decisions#결정 8 (Data Architecture)] — 완전한 스키마 코드 참조
- [Source: architecture.md#Data Boundaries] — DB 접근 경계 규칙
- [Source: prd.md#FR48, FR49] — 스키마 요구사항
- [Source: epics.md#Story 1.3] — 원본 AC

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (1M context) via Claude Code

### Debug Log References

- `drizzle-kit generate` 출력: 4 tables / 5 indexes / 3 fks parsed correctly
- `drizzle-kit migrate` 출력: `[✓] migrations applied successfully!`
- information_schema 검증 스크립트 (임시, 완료 후 삭제됨)

### Completion Notes List

- **Nullable slug**: `slug`를 `NOT NULL`이 아닌 nullable로 설정. 이유: Story 2.1에서 draft 상태 아이디어는 slug 없이 생성되고, Story 3.2 publish 시점에 slug가 할당됨. `uniqueIndex`는 Postgres에서 다중 NULL을 허용하므로 안전함.
- **Nullable final_prompt / final_page_data**: 마찬가지로 draft 시작 시점에는 비어있음. Story 2.1에서 빈 draft row 생성 허용.
- **Forward reference 회피**: `final_page_data`의 jsonb 타입에 `LandingPageData` (Story 1.6에서 생성 예정)를 import하면 모듈 순환 발생. Placeholder 타입 `Record<string, unknown>` 사용하고 쿼리/쓰기 시점 캐스팅. Architecture Cross-Cutting Concern #7 (SSoT) 원칙은 유지 — schemas/landing.ts가 여전히 Single Source of Truth.
- **timestamptz 사용**: 모든 timestamp 컬럼에 `withTimezone: true` 적용. UTC 저장, 브라우저에서 로컬 표시하는 Architecture Format Pattern과 정합.
- **보너스 인덱스**: `ideas_updated_at_idx` 추가 (AC에 명시 없음). Dashboard가 `ORDER BY updated_at DESC`로 정렬하므로 필수 최적화. Epic 4 Story 4.1에서 활용.
- **drizzle.config.ts의 수동 env 로딩**: `drizzle-kit`은 CLI로 실행되어 Next.js 환경변수 로더를 사용하지 못함. `dotenv` 패키지 추가하는 대신 config 파일 내부에서 `.env.local`을 직접 파싱하는 로직 포함. 외부 의존성 증가 없이 해결.
- **`@types/node` 버전 변경**: `^20` → `^25.5.2`로 자동 업그레이드됨. Bun이 최신 버전 선호. Next.js 16 + Node 20+ 요구사항과 호환.
- **Blocked postinstalls 경고**: `sharp`, `unrs-resolver` 3 postinstalls 차단됨. `package.json`의 `ignoreScripts`에 명시되어 있어 의도된 동작. 이미지 변환(sharp)은 이 프로젝트에 불필요 ("이미지 없음" 제품 철학).
- **신뢰성 검증**: `information_schema.tables`, `information_schema.columns`, `pg_indexes`를 직접 쿼리해 DB 상태를 확인. drizzle-kit 출력만 믿지 않고 실제 DB 상태를 조회했음.

### File List

**생성:**
- `drizzle.config.ts` — Drizzle Kit 설정 (env 로딩 inline)
- `src/lib/db/schema.ts` — 4 테이블 Drizzle 스키마 (ideas, events, email_collections, llm_calls) + TypeScript 타입 export
- `drizzle/0000_tan_sharon_carter.sql` — 자동 생성된 초기 마이그레이션
- `drizzle/meta/` — drizzle-kit 메타데이터 (자동 관리)

**수정:**
- `package.json` — drizzle-orm, drizzle-kit, @types/node 추가
- `bun.lock` — 의존성 반영

**삭제:** 없음

**DB 변경 (Neon Seoul):**
- `public.email_collections` 테이블 생성 (4 컬럼, 1 unique index, 1 FK)
- `public.events` 테이블 생성 (5 컬럼, 2 index, 1 FK)
- `public.ideas` 테이블 생성 (11 컬럼, 3 index)
- `public.llm_calls` 테이블 생성 (11 컬럼, 1 index, 1 FK)
- Drizzle 마이그레이션 추적 테이블 (`__drizzle_migrations` in `drizzle` schema) 생성

### Change Log

- 2026-04-06: Story 1.3 완료 — Drizzle ORM 설정 + 4 테이블 스키마 + Neon 마이그레이션 적용 + 실제 DB 상태 검증. `published_at` 컬럼 포함. 스키마 파일은 Architecture 결정 8과 정합.
