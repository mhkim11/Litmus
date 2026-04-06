# Story 2.5: 생성 진행 상태 UI + 취소 기능

Status: review

## Story

As a **Operator**,
I want **LLM 생성 중에 진행 상태를 보고 원하면 취소할 수 있다**,
so that **FR5, FR6이 구현되고 Journey 2의 "너무 오래 걸림" 상황에서 빠져나갈 수 있다**.

## Acceptance Criteria

1. LLM 호출 시작부터 응답/에러까지 `GenerationProgress` 컴포넌트가 화면에 표시된다 (예: "아이디어를 만들고 있어요... (N초 경과)")
2. 30초 이상 경과 시 "평소보다 오래 걸립니다" 추가 안내가 표시된다 (NFR-P4)
3. "취소" 버튼이 있으며 클릭 시 `AbortController.abort()`로 진행 중인 fetch를 취소한다
4. 취소된 경우 UI는 원래 상태(PromptEditor)로 복귀한다
5. 취소 후 다시 "생성하기"를 누르면 새로 호출할 수 있다

## Tasks / Subtasks

- [x] Task 1: GenerationProgress 컴포넌트 (AC: #1, #2)
  - [x] `src/components/operator/GenerationProgress.tsx` — 경과 시간, 30초 경고, 취소 버튼
- [x] Task 2: IdeaEditor AbortController 통합 (AC: #3, #4, #5)
  - [x] callGenerate에 signal 파라미터 추가
  - [x] useRef로 AbortController 관리
  - [x] 취소 시 mutation.reset() → PromptEditor 복귀
  - [x] AbortError 구분: 에러 UI 미표시 (취소는 정상 플로우)
- [x] Task 3: 검증
  - [x] typecheck: 통과
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- AbortController: 생성 시작 시 new AbortController(), 취소 시 controller.abort()
- AbortError 구분: `err.name === 'AbortError'` → 취소로 처리 (에러 UI 미표시)
- 경과 시간: setInterval(1s) + useEffect cleanup

### References
- [Source: epics.md#Story 2.5]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List

- **PromptEditor 숨김**: 생성 중에는 PromptEditor를 숨기고 GenerationProgress만 표시. 취소/완료 후 복귀.
- **AbortError 처리**: `mutation.error?.name === 'AbortError'`로 취소 구분. 취소는 에러 UI 미표시.
- **onSettled**: AbortController ref를 null로 정리 (메모리 누수 방지).

### File List

**생성:**
- `src/components/operator/GenerationProgress.tsx` — 경과 시간 + 30초 경고 + 취소 버튼

**수정:**
- `src/components/operator/IdeaEditor.tsx` — AbortController, GenerationProgress 통합
