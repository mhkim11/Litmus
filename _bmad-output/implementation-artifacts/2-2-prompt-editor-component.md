# Story 2.2: PromptEditor 컴포넌트 (프롬프트 + 지시문 2-field)

Status: review

## Story

As a **Operator**,
I want **한 줄 프롬프트와 선택적 지시문을 입력하는 편집 UI**,
so that **FR1, FR2(프롬프트 입력과 지시문 분리)가 구현된다**.

## Acceptance Criteria

1. **Given** Story 2.1에서 draft가 생성된 후 `/operator/ideas/[id]`에 진입한 상태, **When** `src/components/operator/PromptEditor.tsx` 컴포넌트가 구현된다, **Then** 이 컴포넌트는 두 개의 textarea를 제공한다: "프롬프트" (필수, 한 줄) + "지시문 (선택)" (여러 줄)
2. 각 textarea는 명시적 `<label>`과 연결되어 있다 (NFR-A3)
3. "생성하기" 버튼이 있으며, 프롬프트가 비어 있으면 비활성화된다
4. 현재 컴포넌트는 서버 호출을 하지 않고 로컬 state만 관리한다 (실제 생성은 Story 2.3에서 연결)
5. 컴포넌트는 `'use client'` 지시자로 클라이언트 컴포넌트이다
6. `/operator/ideas/[id]` 페이지가 존재하여 PromptEditor를 렌더링한다

## Tasks / Subtasks

- [x] Task 1: PromptEditor 컴포넌트 (AC: #1~#5)
  - [x] `src/components/operator/PromptEditor.tsx` — 'use client', 2개 textarea + label + 생성하기 버튼
  - [x] prompt 비어있으면 버튼 disabled
  - [x] props: `ideaId`, `initialPrompt?`, `initialInstructions?`, `onGenerate?: (prompt, instructions?) => void`
- [x] Task 2: 아이디어 편집 페이지 (AC: #6)
  - [x] `src/app/(operator)/operator/ideas/[id]/page.tsx` — Server Component
  - [x] DB에서 idea 조회 (getIdeaById), 없으면 notFound()
  - [x] PromptEditor 렌더링 (initialPrompt, initialInstructions 전달)
- [x] Task 3: 검증
  - [x] typecheck: 통과
  - [x] lint: 경고 1개 (ideaId 미사용 — Story 2.3에서 사용 예정), 에러 없음
  - [x] test: 3/3 통과

## Dev Notes

- PromptEditor는 로컬 state만 관리 (Story 2.3에서 onGenerate 연결)
- `<label htmlFor="prompt">` + `<textarea id="prompt">` 패턴 (NFR-A3)
- `getIdeaById`는 Story 2.1에서 이미 구현됨

### References

- [Source: epics.md#Story 2.2]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

### Completion Notes List

- **params async**: Next.js 16에서 `params`가 `Promise<{ id: string }>`로 변경됨. `await params` 필요.
- **ideaId lint warning**: `_ideaId` 미사용 경고 — Story 2.3에서 실제 API 호출 시 사용 예정.
- **onGenerate prop**: 현재 undefined 상태로 전달 — Story 2.3에서 useMutation 콜백으로 연결.

### File List

**생성:**
- `src/components/operator/PromptEditor.tsx` — 프롬프트/지시문 입력 컴포넌트 (Client)
- `src/app/(operator)/operator/ideas/[id]/page.tsx` — 아이디어 편집 페이지 (Server)

**수정:**
