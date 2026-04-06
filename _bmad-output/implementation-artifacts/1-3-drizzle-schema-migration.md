# Story 1.3: Drizzle 설정 + 4 테이블 스키마 마이그레이션

Status: ready-for-dev

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

- [ ] Task 1: Drizzle 의존성 설치 (AC: #1)
  - [ ] `bun add drizzle-orm`
  - [ ] `bun add -D drizzle-kit @types/node`
- [ ] Task 2: drizzle.config.ts 작성 (AC: #1)
  - [ ] 프로젝트 루트에 `drizzle.config.ts` 생성
  - [ ] `schema: './src/lib/db/schema.ts'`, `out: './drizzle'`, `dialect: 'postgresql'`, `dbCredentials: { url: process.env.DATABASE_URL! }` 설정
- [ ] Task 3: schema.ts 작성 — ideas 테이블 (AC: #2, #3, #7)
  - [ ] `src/lib/db/schema.ts` 파일 생성
  - [ ] `ideas` 테이블 정의: id (uuid PK), slug (text unique), status (text enum default draft), final_prompt, final_instructions, final_page_data (jsonb), noindex (boolean default true), created_at, updated_at, archived_at, **published_at**
- [ ] Task 4: schema.ts — events 테이블 (AC: #2)
  - [ ] `events` 테이블 정의: id (uuid PK), idea_id (uuid FK cascade), event_type (text enum), metadata (jsonb), created_at
- [ ] Task 5: schema.ts — email_collections 테이블 (AC: #2)
  - [ ] `email_collections` 테이블 정의: id (uuid PK), idea_id (uuid FK cascade), email (text), created_at
- [ ] Task 6: schema.ts — llm_calls 테이블 (AC: #2)
  - [ ] `llm_calls` 테이블 정의: id (uuid PK), idea_id (uuid FK set null), provider, model, prompt_tokens, completion_tokens, cost_usd (numeric), duration_ms (numeric), success (boolean), error_message, created_at
- [ ] Task 7: 인덱스 정의 (AC: #6)
  - [ ] `ideas_slug_idx` (unique on slug)
  - [ ] `ideas_status_idx` (index on status)
  - [ ] `events_idea_id_created_at_idx` (compound index)
  - [ ] `events_event_type_idx`
  - [ ] `email_collections_idea_email_idx` (unique compound)
  - [ ] `llm_calls_created_at_idx`
- [ ] Task 8: 마이그레이션 생성 및 적용 (AC: #4, #5)
  - [ ] `bunx drizzle-kit generate` 실행 → `drizzle/0000_*.sql` 파일 생성 확인
  - [ ] `bunx drizzle-kit migrate` 실행 → Neon에 스키마 적용
  - [ ] Neon Dashboard 또는 `bunx drizzle-kit studio`로 4개 테이블 생성 확인

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
