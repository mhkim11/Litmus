# Story 1.7: Kill Switch 순수 함수 + 통합 + llm_calls 로깅

Status: ready-for-dev

## Story

As a **Operator**,
I want **월 예산 초과 시 LLM 호출을 차단하는 Kill Switch와 호출 로깅**,
so that **NFR-O4(비용 모니터링 + Hard Kill Switch)와 NFR-O1(LLM 호출 로그)이 구현된다**.

## Acceptance Criteria

1. **Given** Story 1.6의 `generateLanding` 함수가 존재한다, **And** `.env.local`에 `MAX_MONTHLY_USD=50`과 `KILL_SWITCH_OVERRIDE=false`가 설정되어 있다, **When** `src/lib/llm/budget.ts`에 `isBudgetExceeded(currentMonthUsage, maxBudget, overrideEnabled)` 순수 함수를 구현한다, **Then** DB 의존 없이 순수 계산만 하며 유닛 테스트가 있다
2. `src/lib/llm/gateway.ts`에 `checkAndEnforceBudget()` 함수가 `llm_calls` 테이블에서 이번 달 cost_usd 합산을 쿼리하고, 초과 시 `BudgetExceededError`를 throw한다
3. `src/lib/db/queries/llmCalls.ts`에 `logLLMCall(params)` 함수가 provider, model, tokens, cost_usd, duration_ms, success 등을 `llm_calls` 테이블에 INSERT한다
4. 이 스토리에서는 `generateLanding` 함수를 수정하지 않는다 (Story 2.4에서 통합 — Party Mode 결정 반영). 다만 gateway 함수를 독립적으로 호출 가능하도록 export한다
5. `BudgetExceededError`는 별도 클래스로 정의되어 `name`과 `usage, max` 필드를 가진다
6. `budget.test.ts` 유닛 테스트에는 다음 케이스 포함: (a) 예산 미달 — false, (b) 예산 초과 — true, (c) override 활성 — 초과해도 false
7. 임시 테스트로 DB에 cost_usd 합계가 MAX_MONTHLY_USD를 초과하는 row들을 삽입한 뒤 `checkAndEnforceBudget()` 호출이 `BudgetExceededError`로 실패하는지 확인한다

## Tasks / Subtasks

- [ ] Task 1: 환경변수 설정 (AC: #1)
  - [ ] `.env.local`에 `MAX_MONTHLY_USD=50` 추가
  - [ ] `.env.local`에 `KILL_SWITCH_OVERRIDE=false` 추가
  - [ ] `.env.local.example`에도 템플릿 추가 (주석 포함)
  - [ ] Vercel Environment Variables에 동일 등록
- [ ] Task 2: budget.ts 순수 함수 작성 (AC: #1)
  - [ ] `src/lib/llm/budget.ts` 파일 생성
  - [ ] `isBudgetExceeded(currentMonthUsage: number, maxBudget: number, overrideEnabled: boolean): boolean` 구현
  - [ ] override true면 항상 false 반환
  - [ ] 아니면 `currentMonthUsage >= maxBudget` 반환
- [ ] Task 3: BudgetExceededError 클래스 정의 (AC: #5)
  - [ ] `src/lib/llm/gateway.ts` 또는 `src/lib/llm/errors.ts` 파일에 정의
  - [ ] `class BudgetExceededError extends Error`
  - [ ] `constructor(public usage: number, public max: number)`
  - [ ] `this.name = 'BudgetExceededError'`
  - [ ] 메시지 예: "LLM monthly budget exceeded: $X.XX / $Y.YY"
- [ ] Task 4: logLLMCall 쿼리 함수 (AC: #3)
  - [ ] `src/lib/db/queries/llmCalls.ts` 파일 생성
  - [ ] Drizzle ORM으로 `llm_calls` 테이블 import
  - [ ] `logLLMCall(params: { ideaId?, provider, model, promptTokens, completionTokens, costUsd, durationMs, success, errorMessage? })` 구현
  - [ ] INSERT 수행 후 반환값 없음 (또는 새 row id 반환)
- [ ] Task 5: getCurrentMonthLLMCost 쿼리 함수 (AC: #2)
  - [ ] `src/lib/db/queries/llmCalls.ts`에 추가
  - [ ] `getCurrentMonthLLMCost(): Promise<number>` 구현
  - [ ] `SELECT COALESCE(SUM(cost_usd), 0) FROM llm_calls WHERE created_at >= date_trunc('month', NOW())`
  - [ ] 반환값을 Number로 변환
- [ ] Task 6: checkAndEnforceBudget 통합 함수 (AC: #2, #4)
  - [ ] `src/lib/llm/gateway.ts`에 구현
  - [ ] `async function checkAndEnforceBudget(): Promise<void>` 시그니처
  - [ ] `const usage = await getCurrentMonthLLMCost()`
  - [ ] `const max = Number(process.env.MAX_MONTHLY_USD ?? 50)`
  - [ ] `const override = process.env.KILL_SWITCH_OVERRIDE === 'true'`
  - [ ] `if (isBudgetExceeded(usage, max, override)) throw new BudgetExceededError(usage, max)`
- [ ] Task 7: budget.test.ts 유닛 테스트 (AC: #6)
  - [ ] Vitest 설치 확인 (Story 1.9에서 CI 추가 전이라도 로컬 실행 가능)
  - [ ] `bun add -D vitest` (이미 있으면 스킵)
  - [ ] `src/lib/llm/budget.test.ts` 파일 생성
  - [ ] 3개 테스트 케이스 작성 (a) under budget (b) over budget (c) override enabled
  - [ ] `bunx vitest run src/lib/llm/budget.test.ts` 실행 → 3/3 pass
- [ ] Task 8: 통합 테스트 (AC: #7)
  - [ ] 임시 SQL로 `llm_calls` 테이블에 cost_usd 합계가 $50 초과하는 row 삽입
    - 예: `INSERT INTO llm_calls (provider, model, prompt_tokens, completion_tokens, cost_usd, duration_ms, success) VALUES ('anthropic', 'claude-sonnet-4-5', 1000, 1000, 55.00, 1000, true)`
  - [ ] 임시 route `/api/budget-test` 또는 스크립트에서 `checkAndEnforceBudget()` 호출
  - [ ] `BudgetExceededError` 발생 확인
  - [ ] 테스트 row 삭제: `DELETE FROM llm_calls WHERE cost_usd = 55.00`

## Dev Notes

**Architecture 결정 4 (Kill Switch 구현) + Testability Concern 9 참조.**

**순수 함수 분리 이유 (Testability Boundary):**

- `isBudgetExceeded`는 DB 의존 없는 순수 함수 → mock 불필요 유닛 테스트
- `checkAndEnforceBudget`은 통합 함수 → DB 의존, 통합 테스트 또는 수동 검증

**budget.ts 코드 예시:**

```ts
// src/lib/llm/budget.ts
export function isBudgetExceeded(
  currentMonthUsage: number,
  maxBudget: number,
  overrideEnabled: boolean
): boolean {
  if (overrideEnabled) return false
  return currentMonthUsage >= maxBudget
}
```

**budget.test.ts 코드 예시:**

```ts
// src/lib/llm/budget.test.ts
import { describe, it, expect } from 'vitest'
import { isBudgetExceeded } from './budget'

describe('isBudgetExceeded', () => {
  it('returns false when usage is under budget', () => {
    expect(isBudgetExceeded(30, 50, false)).toBe(false)
  })

  it('returns true when usage equals or exceeds budget', () => {
    expect(isBudgetExceeded(50, 50, false)).toBe(true)
    expect(isBudgetExceeded(60, 50, false)).toBe(true)
  })

  it('returns false when override is enabled regardless of usage', () => {
    expect(isBudgetExceeded(60, 50, true)).toBe(false)
    expect(isBudgetExceeded(1000, 50, true)).toBe(false)
  })
})
```

**gateway.ts checkAndEnforceBudget 예시:**

```ts
// src/lib/llm/gateway.ts
import { isBudgetExceeded } from './budget'
import { getCurrentMonthLLMCost } from '@/lib/db/queries/llmCalls'

export class BudgetExceededError extends Error {
  constructor(public usage: number, public max: number) {
    super(`LLM monthly budget exceeded: $${usage.toFixed(2)} / $${max.toFixed(2)}`)
    this.name = 'BudgetExceededError'
  }
}

export async function checkAndEnforceBudget(): Promise<void> {
  const usage = await getCurrentMonthLLMCost()
  const max = Number(process.env.MAX_MONTHLY_USD ?? 50)
  const override = process.env.KILL_SWITCH_OVERRIDE === 'true'

  if (isBudgetExceeded(usage, max, override)) {
    throw new BudgetExceededError(usage, max)
  }
}
```

**중요한 결정**: Story 2.4 (Party Mode 분할)에서 generateLanding이 checkAndEnforceBudget를 호출하도록 통합됨. 이 스토리에서는 함수를 만들기만 하고 generate.ts는 수정 안 함.

### Project Structure Notes

- `src/lib/llm/budget.ts` — 순수 함수 (Testability)
- `src/lib/llm/budget.test.ts` — co-location 원칙 (CLAUDE.md)
- `src/lib/llm/gateway.ts` — 통합 함수
- `src/lib/db/queries/llmCalls.ts` — DB 쿼리 레이어 (DB 접근 경계)

### References

- [Source: architecture.md#Core Architectural Decisions#결정 4] — Kill Switch 순수+통합 분리
- [Source: architecture.md#Cross-Cutting Concerns#9 Testability Boundaries] — 비즈니스 로직 분리 원칙
- [Source: prd.md#FR55, NFR-O4, NFR-O1] — 요구사항
- [Source: architecture.md#Implementation Patterns#Structure Patterns] — 테스트 co-location
- [Source: epics.md#Story 1.7] — 원본 AC

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
