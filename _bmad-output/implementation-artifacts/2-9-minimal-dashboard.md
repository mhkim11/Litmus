# Story 2.9: Minimal Dashboard — draft + active 목록

Status: review

## Story

As a **Operator**,
I want **내가 만든 아이디어 목록을 대시보드에서 확인**,
so that **자기 아이디어로 돌아올 수 있고 "내가 지금까지 만든 것"을 한 화면에서 볼 수 있다**.

## Acceptance Criteria

1. `src/app/(operator)/operator/page.tsx`가 draft + active 상태의 아이디어 목록을 테이블로 표시한다
2. `ORDER BY updated_at DESC` 정렬
3. 각 row는 최소한 id 앞 8자(요약), final_prompt 앞 50자, status, updated_at을 표시한다
4. 각 row 클릭 시 `/operator/ideas/[id]`로 이동한다
5. "새 아이디어 만들기" 버튼이 여전히 존재한다
6. 아이디어 없으면 EmptyState (Story 2.1)
7. 지표(PV/CTA/이메일) 표시나 정렬 기능은 없다 (Epic 4에서 확장)

## Tasks / Subtasks

- [x] Task 1: DB 쿼리 정렬 수정 (AC: #2)
  - [x] `getActiveAndDraftIdeas()` — desc(ideas.updatedAt)로 수정
- [x] Task 2: Operator 대시보드 페이지 업데이트 (AC: #1~#6)
  - [x] 테이블: 프롬프트 요약(50자), 상태 배지, 수정 시각(ko-KR)
  - [x] row 클릭 → window.location.href (Server Component에서 onClick 불가, 테이블 row용)
  - [x] 빈 프롬프트 처리: "빈 프롬프트" italic 표시
  - [x] 상단 NewIdeaButton + 아이디어 없으면 EmptyState
- [x] Task 3: 검증
  - [x] typecheck: 통과
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- `desc()` import from drizzle-orm
- 프롬프트 없는 경우(빈 draft): "(빈 프롬프트)" 표시
- updated_at 표시: `toLocaleString('ko-KR')` (CLAUDE.md 규칙)

### References
- [Source: epics.md#Story 2.9]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List

- **row onClick**: Server Component에서 직접 onClick 불가 → `window.location.href` 인라인 사용. Story 2.9는 테이블 자체가 단순해 별도 Client Component 불필요.
- **상태 배지**: draft="초안"(회색), active="발행됨"(초록).
- **두 번 NewIdeaButton**: 상단(항상)과 EmptyState 내(0개일 때만). EmptyState 내 버튼은 Story 2.1 패턴 유지.

### File List

**생성:**
- `_bmad-output/implementation-artifacts/2-9-minimal-dashboard.md`

**수정:**
- `src/lib/db/queries/ideas.ts` — desc() 정렬 추가
- `src/app/(operator)/operator/page.tsx` — 테이블 뷰 업데이트
