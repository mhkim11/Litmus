# Story 2.4: Kill Switch 통합 + llm_calls 로깅 연결

Status: review

## Story

As a **Operator**,
I want **Story 2.3의 생성 경로에 Kill Switch와 LLM 호출 로깅이 통합됨**,
so that **FR55와 NFR-O1, NFR-O4가 완전히 구현되어 비용 폭주로부터 안전하다**.

## Acceptance Criteria

1. **Given** Story 2.3의 generate route가 동작하고 Story 1.7의 `checkAndEnforceBudget`, `logLLMCall`이 존재한다, **When** `src/app/api/ideas/[id]/generate/route.ts`가 업데이트된다, **Then** `generateLanding` 호출 직전에 `checkAndEnforceBudget()`가 호출된다
2. `BudgetExceededError`가 throw되면 429 상태로 `{ error, code: 'BUDGET_EXCEEDED', usage, max }` 반환한다
3. LLM 호출 완료 직후 (성공/실패 무관) `logLLMCall()`이 provider, model, promptTokens, completionTokens, costUsd, durationMs, success, errorMessage 필드로 llm_calls 테이블에 기록한다
4. 비용 계산은 Anthropic 공개 단가 기준으로 `src/lib/llm/pricing.ts` 모듈에 하드코딩된 값을 사용한다 (모델별)
5. UI는 `code: 'BUDGET_EXCEEDED'` 응답 수신 시 "이번 달 LLM 예산을 초과했습니다." 안내 표시

## Tasks / Subtasks

- [x] Task 1: pricing.ts 생성 (AC: #4)
  - [x] `src/lib/llm/pricing.ts` — 모델별 입력/출력 단가 ($/token)
  - [x] `calcCostUsd(model, promptTokens, completionTokens): number`
- [x] Task 2: generateLanding 반환값 확장 (AC: #3)
  - [x] `src/lib/llm/generate.ts` — `{ pageData, promptTokens, completionTokens }` 반환으로 변경
- [x] Task 3: generate route 업데이트 (AC: #1~#4)
  - [x] checkAndEnforceBudget() 선행 호출
  - [x] BudgetExceededError → 429
  - [x] 생성 전후 시간 측정 (durationMs)
  - [x] logLLMCall() 성공/실패 무관 finally 블록에서 호출
- [x] Task 4: IdeaEditor UI (AC: #5)
  - [x] BUDGET_EXCEEDED 코드 수신 시 안내 메시지 표시
- [x] Task 5: 검증
  - [x] typecheck: 통과
  - [x] lint: 에러/경고 없음
  - [x] test: 3/3 통과

## Dev Notes

- `generateLanding` 반환 타입 변경: `Promise<LandingPageData>` → `Promise<{ pageData: LandingPageData, promptTokens: number, completionTokens: number }>`
- pricing.ts: claude-sonnet-4-6 기준 입력 $3/1M, 출력 $15/1M
- durationMs: `Date.now()` 전후 차이

### References

- [Source: epics.md#Story 2.4]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6 via Claude Code

### Completion Notes List

- **generateLanding 반환 타입 변경**: `Promise<LandingPageData>` → `Promise<GenerateResult>`. route handler에서 `result.pageData`로 접근.
- **finally 블록 로깅**: 성공/실패 무관 logLLMCall 호출. logLLMCall 자체 실패는 `.catch(console.error)`로 무시 (로깅 실패가 생성 응답에 영향 안 줌).
- **BudgetExceededError 클라이언트**: IdeaEditor에 동명 클래스 정의 (서버 코드 공유 불가). code 필드로 구분.
- **예산 초과 시 "다시 생성" 버튼 없음**: 예산 초과는 사용자가 해결해야 하므로 재시도 버튼 미표시.

### File List

**생성:**
- `src/lib/llm/pricing.ts` — 모델별 Anthropic 단가 + calcCostUsd()

**수정:**
- `src/lib/llm/generate.ts` — GenerateResult 타입, promptTokens/completionTokens 반환
- `src/app/api/ideas/[id]/generate/route.ts` — Kill Switch + logLLMCall 통합
- `src/components/operator/IdeaEditor.tsx` — BUDGET_EXCEEDED UI 처리
