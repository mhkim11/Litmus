# Story 2.3: LLM 호출 + structured output + Zod 검증 (순수 생성 경로)

Status: review

## Story

As a **Operator**,
I want **"생성하기" 버튼이 실제 LLM 호출로 연결되어 랜딩페이지 데이터를 받아오는 기본 경로**,
so that **FR3, FR4, FR7, FR53 적용이 구현된다. Kill Switch 통합은 Story 2.4에서 분리 처리**.

## Acceptance Criteria

1. **Given** Story 1.6의 `generateLanding` 함수가 존재한다, **When** `src/app/api/ideas/[id]/generate/route.ts`에 POST handler가 구현된다, **Then** 이 handler는 Node runtime으로 `export const runtime = 'nodejs'` 명시
2. request body에서 `{ prompt, instructions? }`를 Zod로 검증한다
3. `generateLanding(prompt, instructions)`를 호출하며 실패 시 1회 자동 재시도 (NFR-R3)
4. 반환된 `LandingPageData`를 `ideas` 테이블의 `final_prompt`, `final_instructions`, `final_page_data` 컬럼에 저장 (UPDATE)
5. 최종 응답은 `LandingPageData` JSON을 반환한다
6. PromptEditor 컴포넌트(2.2)가 "생성하기" 버튼 클릭 시 TanStack Query `useMutation`으로 이 API를 호출한다
7. 2회 재시도 실패 시 에러가 UI에 표시되며 "다시 생성" 버튼이 나타난다 (FR7)
8. 이 스토리 완료 시점에 Kill Switch는 아직 미적용 (Story 2.4에서 해결)

## Tasks / Subtasks

- [x] Task 1: TanStack Query Provider 설정
  - [x] `src/app/providers.tsx` — QueryClientProvider (Client Component)
  - [x] `src/app/(operator)/layout.tsx` — Provider 적용
- [x] Task 2: DB 쿼리 함수 추가 (AC: #4)
  - [x] `src/lib/db/queries/ideas.ts` — `updateIdeaGeneration()` 함수 추가
- [x] Task 3: generate route handler (AC: #1~#5)
  - [x] `src/app/api/ideas/[id]/generate/route.ts`
  - [x] Zod 검증, 1회 재시도, DB UPDATE, LandingPageData 반환
- [x] Task 4: PromptEditor + IdeaEditor 업데이트 (AC: #6, #7)
  - [x] `src/components/operator/IdeaEditor.tsx` — Client Component, useMutation 관리
  - [x] PromptEditor에서 ideaId prop 제거 (IdeaEditor가 API 호출 담당)
  - [x] 로딩/에러/"다시 생성" 버튼/결과 표시
  - [x] `src/app/(operator)/operator/ideas/[id]/page.tsx` — IdeaEditor 사용
- [x] Task 5: 검증
  - [x] typecheck: 통과
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- `@tanstack/react-query` v5 사용
- Provider는 `(operator)/layout.tsx`에만 적용 (operator 전용)
- 1회 재시도: try/catch → catch에서 재시도 (총 2회 시도)
- `export const runtime = 'nodejs'` — LLM 호출은 Node.js runtime 필요
- Kill Switch 미적용: generateLanding 직접 호출 (Story 2.4에서 gateway로 교체)

### References

- [Source: epics.md#Story 2.3]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Debug Log References

### Completion Notes List

- **IdeaEditor 분리**: PromptEditor(순수 UI) + IdeaEditor(useMutation + 상태관리)로 분리. PromptEditor에서 ideaId 제거 — API 호출은 IdeaEditor 책임.
- **1회 재시도**: try/catch 구조로 총 2회 시도. 두 번째 실패 시 상위 catch에서 500 반환.
- **TanStack Query retry: false**: 기본 retry 비활성화. 재시도는 서버 route handler에서 처리.
- **initialPageData**: 페이지 재접속 시 기존 생성 결과 복원 지원.

### File List

**생성:**
- `src/app/providers.tsx` — QueryClientProvider
- `src/app/api/ideas/[id]/generate/route.ts` — POST /api/ideas/[id]/generate
- `src/components/operator/IdeaEditor.tsx` — useMutation + 결과 표시 (Client)

**수정:**
- `src/app/(operator)/layout.tsx` — Providers 적용
- `src/lib/db/queries/ideas.ts` — updateIdeaGeneration 추가
- `src/components/operator/PromptEditor.tsx` — ideaId prop 제거
- `src/app/(operator)/operator/ideas/[id]/page.tsx` — IdeaEditor 사용
