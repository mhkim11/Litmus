# Story 2.6: Draft 자동저장 (blur + 10s idle) + 저장 실패 경로

Status: review

## Story

As a **Operator**,
I want **편집 중인 프롬프트/지시문이 blur 또는 10초 idle 시 자동 저장되며, 저장 실패 시 명확한 안내와 복구 경로**,
so that **NFR-R4 충족 및 네트워크 장애·서버 오류 상황에서도 데이터 손실이 방지된다**.

## Acceptance Criteria

1. `src/lib/hooks/useDraftAutoSave.ts` 커스텀 훅이 (a) blur 시 즉시, (b) 10초 debounce로 자동 PATCH
2. `src/app/api/ideas/[id]/draft/route.ts` PATCH handler — `{ finalPrompt?, finalInstructions? }` Zod 검증 후 UPDATE
3. PromptEditor 컴포넌트가 이 훅을 사용하며 저장 중·완료 indicator 표시 ("저장됨" / "저장 중...")
4. 저장 실패 시 "❌ 저장 실패" + "다시 저장" 버튼 노출
5. 저장 실패 상태에서 페이지 이탈 시 `beforeunload` 브라우저 경고
6. 저장 성공 시 `beforeunload` 리스너 해제
7. 새로고침/재접속 시 최신 draft 복원 (Server Component에서 DB 조회 → initialPrompt 전달)

## Tasks / Subtasks

- [x] Task 1: DB 쿼리 + PATCH route (AC: #2)
  - [x] `src/lib/db/queries/ideas.ts` — `updateDraft()` 함수
  - [x] `src/app/api/ideas/[id]/draft/route.ts` — PATCH handler
- [x] Task 2: useDraftAutoSave 훅 (AC: #1, #5, #6)
  - [x] blur trigger: saveNow() 외부 노출
  - [x] 10초 debounce: prompt/instructions 변경 → useEffect + setTimeout
  - [x] status: 'idle' | 'saving' | 'saved' | 'error'
  - [x] beforeunload: error 상태일 때만 등록/해제
- [x] Task 3: PromptEditor 업데이트 (AC: #3, #4)
  - [x] ideaId prop 추가
  - [x] onBlur에서 saveNow() 호출
  - [x] 저장 indicator("저장됨"/"저장 중...") + "다시 저장" 버튼
- [x] Task 4: IdeaEditor ideaId → PromptEditor 전달
- [x] Task 5: 검증
  - [x] typecheck: 통과
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- useDraftAutoSave는 `ideaId`, `prompt`, `instructions`를 받음
- debounce: useEffect + setTimeout(10000) + cleanup
- beforeunload: `error` 상태일 때만 window.addEventListener
- AC #7: Server Component(page.tsx)가 이미 initialPrompt 전달 중 — 추가 구현 불필요

### References
- [Source: epics.md#Story 2.6]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List

- **debounce 재트리거 방지**: status === 'saving' 중에는 debounce 타이머 설정 안 함.
- **latestRef 패턴**: debounce 콜백이 stale closure 갖지 않도록 항상 최신 값 참조.
- **AC #7 (draft 복원)**: Server Component(page.tsx)가 initialPrompt/initialInstructions 전달 중 — 별도 구현 불필요.
- **'use client' directive**: 훅 파일에 추가 (Next.js App Router 규칙).

### File List

**생성:**
- `src/lib/hooks/useDraftAutoSave.ts` — blur + debounce 자동저장 훅
- `src/app/api/ideas/[id]/draft/route.ts` — PATCH /api/ideas/[id]/draft

**수정:**
- `src/lib/db/queries/ideas.ts` — updateDraft() 추가
- `src/components/operator/PromptEditor.tsx` — ideaId prop, onBlur, 저장 indicator
- `src/components/operator/IdeaEditor.tsx` — ideaId → PromptEditor 전달
