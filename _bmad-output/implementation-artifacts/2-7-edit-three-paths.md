# Story 2.7: 편집 3경로 (재생성 / 프롬프트 수정 / 인라인 텍스트 편집)

Status: review

## Story

As a **Operator**,
I want **생성된 결과를 세 가지 경로로 편집: (a) 같은 프롬프트로 재생성 (b) 프롬프트 수정 후 재생성 (c) 생성된 텍스트 필드 직접 인라인 편집**,
so that **FR8, FR9, FR10이 구현되며 Journey 2의 "복구" 경로가 작동한다**.

## Acceptance Criteria

1. 결과 표시 영역에 "재생성", "프롬프트 수정", "직접 편집" 3개 액션이 제공된다
2. "재생성" 클릭 시 동일한 `POST /api/ideas/[id]/generate`를 다시 호출하고 결과로 `final_page_data`를 덮어쓴다 (FR11)
3. "프롬프트 수정" 클릭 시 PromptEditor 필드가 다시 활성화되어 편집 후 재생성 가능하다
4. `src/components/operator/InlineEditor.tsx`로 생성된 각 텍스트 필드가 contentEditable 방식으로 편집 가능하다
5. 인라인 편집 결과는 blur 시 PATCH /api/ideas/[id]/draft의 `finalPageData` 필드로 저장된다
6. 편집 히스토리는 저장되지 않는다 (FR11)

## Tasks / Subtasks

- [x] Task 1: draft PATCH 확장 (AC: #5)
  - [x] `src/app/api/ideas/[id]/draft/route.ts` — `finalPageData` 필드 추가 (z.record(z.string(), z.unknown()))
  - [x] `src/lib/db/queries/ideas.ts` — `updateDraft`에 finalPageData 지원 추가
- [x] Task 2: InlineEditor 컴포넌트 (AC: #4, #5)
  - [x] `src/components/operator/InlineEditor.tsx` — contentEditable 필드들
  - [x] blur 시 PATCH /api/ideas/[id]/draft 저장
  - [x] 저장 상태 indicator
- [x] Task 3: IdeaEditor 3경로 UI (AC: #1~#3)
  - [x] viewMode 상태: 'prompting' | 'result'
  - [x] 결과 영역에 "재생성" / "프롬프트 수정" / "직접 편집" 3개 버튼
  - [x] lastPrompt/lastInstructions 추적 (재생성용)
  - [x] localPageData 상태 (인라인 편집 반영용)
  - [x] onSuccess 콜백: setLocalPageData + setViewMode('result')
- [x] Task 4: 검증
  - [x] typecheck: 통과 (Zod v4 z.record 수정)
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- IdeaEditor viewMode: initialPageData 있으면 'result', 없으면 'prompting'
- "재생성": lastPrompt/lastInstructions로 mutation.mutate
- "프롬프트 수정": setViewMode('prompting')
- InlineEditor: contentEditable → blur → fetch PATCH
- finalPageData는 JSON이므로 Zod 검증 없이 unknown으로 수신 후 저장

### References
- [Source: epics.md#Story 2.7]

## Dev Agent Record
### Agent Model Used
Claude Sonnet 4.6 via Claude Code
### Completion Notes List

- **Zod v4 z.record**: `z.record(z.unknown())` → `z.record(z.string(), z.unknown())` (v4 breaking change).
- **viewMode 초기값**: initialPageData 있으면 'result', 없으면 'prompting'.
- **"직접 편집" 토글**: 버튼 재클릭 시 편집 모드 해제 ("편집 완료" 표시).
- **lastPrompt 동기화**: onGenerate 콜백에서 setLastPrompt/setLastInstructions 호출. 재생성 시 최신 값 사용.

### File List

**생성:**
- `src/components/operator/InlineEditor.tsx` — contentEditable 인라인 편집 + blur 저장

**수정:**
- `src/app/api/ideas/[id]/draft/route.ts` — finalPageData 필드 추가
- `src/lib/db/queries/ideas.ts` — updateDraft finalPageData 지원
- `src/components/operator/IdeaEditor.tsx` — viewMode + 3경로 버튼 + localPageData + onSuccess
