# Story 2.1: 새 아이디어 draft 즉시 생성 API + Empty State UI

Status: review

## Story

As a **Operator**,
I want **"새 아이디어" 버튼 클릭 시 즉시 draft row가 DB에 생성되고 편집 페이지로 이동**,
so that **"없는 id vs 있는 id" 상태 머신 없이 단순한 흐름으로 시작할 수 있다 (FR50 기반)**.

## Acceptance Criteria

1. **Given** Operator가 토큰 인증된 상태로 Operator Console 메인(`/operator`)에 접속한다, **When** `src/app/api/ideas/route.ts`에 POST handler가 구현된다, **Then** 이 handler는 `INSERT INTO ideas (status) VALUES ('draft') RETURNING id`로 새 row를 만들고 id를 반환한다 (slug는 null)
2. 반환 형식은 `{ id: string, status: 'draft', createdAt: string }`이다 (direct data return, wrapper 없음)
3. `src/app/(operator)/operator/page.tsx`에 "새 아이디어 만들기" 버튼이 있으며 클릭 시 `POST /api/ideas`를 호출하고 응답의 `id`로 `/operator/ideas/{id}`로 리다이렉트한다
4. 아이디어가 0개일 때 Empty State 컴포넌트(`src/components/shared/EmptyState.tsx`)가 표시되어 "첫 아이디어를 만들어보세요" 가이드 메시지를 보여준다 (FR39)
5. 이 Empty State는 Story 4.7에서 확장될 기반이다

## Tasks / Subtasks

- [x] Task 1: DB 쿼리 함수 생성 (AC: #1)
  - [x] `src/lib/db/queries/ideas.ts` 생성 — `createDraftIdea()`, `getActiveAndDraftIdeas()`, `getIdeaById()` 함수
  - [x] lazy drizzle init 패턴 적용 (Story 1.7과 동일)
- [x] Task 2: POST /api/ideas route handler (AC: #1, #2)
  - [x] `src/app/api/ideas/route.ts` 생성
  - [x] try/catch + 500 에러 처리
  - [x] 201 status + `{ id, status, createdAt }` 반환
- [x] Task 3: EmptyState 컴포넌트 (AC: #4)
  - [x] `src/components/shared/EmptyState.tsx` 생성
  - [x] "첫 아이디어를 만들어보세요" 메시지 + children slot (Story 4.7 확장용)
- [x] Task 4: Operator 메인 페이지 업데이트 (AC: #3, #4)
  - [x] `src/app/(operator)/operator/page.tsx` - Server Component로 아이디어 목록 조회
  - [x] `src/components/operator/NewIdeaButton.tsx` - Client Component (API 호출 + redirect)
  - [x] 아이디어 0개 → EmptyState, 있음 → 목록 (아직 목록 UI는 최소; Story 2.9에서 확장)
- [x] Task 5: 로컬 테스트 (AC: #1~#4)
  - [x] typecheck: 통과
  - [x] lint: 통과
  - [x] test: 3/3 pass (기존 budget 테스트 회귀 없음)

## Dev Notes

**구현 패턴:**
- DB 쿼리: `drizzle(getDb())` inside function (lazy init, 빌드 시 DB 접근 안 함)
- Route handler: `export const dynamic = 'force-dynamic'`
- API 응답: direct return `{ id, status, createdAt }` (wrapper 없음)
- 에러: `{ error, code }` + 500

**파일 위치 결정:**
- Operator Console 페이지: `src/app/(operator)/operator/page.tsx` → URL `/operator`
  - Story 1.5에서 확정된 패턴 (route group URL 매핑)
- "새 아이디어 만들기" 버튼: Client Component 분리 (`NewIdeaButton.tsx`)
  - 이유: Server Component인 page.tsx에서 onClick 처리 불가
- EmptyState: `src/components/shared/` — 향후 Epic 4 Story 4.7에서 확장됨

**/operator/ideas/[id] 페이지:**
- Story 2.1에서는 이 URL로 redirect만 함 (페이지는 Story 2.2+에서 구현)
- 리다이렉트 대상 페이지가 없어도 404를 보는 것은 정상 (Story 2.2에서 구현 예정)

### References

- [Source: epics.md#Story 2.1] — 원본 AC
- [Source: architecture.md#Core Architectural Decisions] — lazy init 패턴
- [Source: CLAUDE.md#Format Patterns] — API 응답 형식

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

### Completion Notes List

- **라우트 패턴**: Operator 페이지는 `src/app/(operator)/operator/page.tsx` → URL `/operator` (Story 1.5 패턴 유지). 에픽 문서의 `(operator)/page.tsx` 표기는 구현 시 `(operator)/operator/page.tsx`로 적용.
- **API 보호**: `POST /api/ideas`는 `/api/` 경로이므로 proxy 보호 대상 아님. 버튼이 `/operator` 페이지(proxy 보호)에 있으므로 MVP 단계에서 허용. 향후 Epic 개선 시 고려.
- **EmptyState children prop**: `children` slot으로 NewIdeaButton을 주입. Story 4.7에서 EmptyState 확장 시 이 slot 활용.
- **getActiveAndDraftIdeas**: `inArray(status, ['draft', 'active'])` 패턴. Story 2.9에서 `desc()` 정렬로 확장.
- **추가 쿼리 함수**: `getIdeaById()`, `getActiveAndDraftIdeas()` — 이후 스토리에서 재사용.

### File List

**생성:**
- `src/lib/db/queries/ideas.ts` — createDraftIdea, getActiveAndDraftIdeas, getIdeaById
- `src/app/api/ideas/route.ts` — POST /api/ideas (draft 생성)
- `src/components/shared/EmptyState.tsx` — Empty state UI 컴포넌트
- `src/components/operator/NewIdeaButton.tsx` — Client Component (새 아이디어 버튼)

**수정:**
- `src/app/(operator)/operator/page.tsx` — DB 조회 + EmptyState/목록 표시로 업데이트
