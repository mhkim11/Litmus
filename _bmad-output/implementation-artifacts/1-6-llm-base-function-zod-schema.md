# Story 1.6: LLM 호출 베이스 함수 + Zod 스키마 정의

Status: ready-for-dev

## Story

As a **Operator**,
I want **Anthropic Claude를 호출하는 단일 함수와 LandingPageData Zod 스키마 정의 (Single Source of Truth)**,
so that **이후 Epic 2의 LLM 생성 기능이 이 베이스 위에 구축될 수 있다**.

## Acceptance Criteria

1. **Given** `bun add @anthropic-ai/sdk zod`로 의존성이 설치되어 있다, **And** `.env.local`에 `ANTHROPIC_API_KEY`가 설정되어 있다, **When** `src/lib/schemas/landing.ts`에 `LandingPageData` Zod 스키마를 정의한다, **Then** 히어로 카피, 서브 카피, 3개 가치제안, CTA 문구, 이메일 폼 라벨 필드가 포함된다
2. `z.infer<typeof LandingPageData>`로 TypeScript 타입이 자동 추론된다
3. `src/lib/llm/generate.ts`에 `async function generateLanding(prompt: string, instructions?: string): Promise<LandingPageData>` 함수가 구현된다
4. 이 함수는 Anthropic SDK의 `messages.create()` + `tool_use`를 사용해 structured output을 받는다
5. 응답은 `LandingPageData.parse()`로 검증되며 실패 시 `ZodError`를 throw한다
6. 이 함수는 아직 Kill Switch나 로깅을 적용하지 않는다 (Story 1.7에서 통합)
7. 간단한 테스트 스크립트 또는 임시 route로 `generateLanding("퇴근 후 15분 코딩 챌린지")` 호출이 성공하는 것을 확인한다

## Tasks / Subtasks

- [ ] Task 1: 의존성 설치 및 환경변수 설정 (AC: #1)
  - [ ] `bun add @anthropic-ai/sdk zod`
  - [ ] Anthropic Console에서 API 키 발급 (credit $5 이상 필요)
  - [ ] `.env.local`에 `ANTHROPIC_API_KEY=<key>` 추가
  - [ ] `.env.local.example`에 `ANTHROPIC_API_KEY=your-anthropic-api-key` 템플릿 추가
  - [ ] Vercel Environment Variables에도 등록
- [ ] Task 2: LandingPageData Zod 스키마 작성 (AC: #1, #2)
  - [ ] `src/lib/schemas/landing.ts` 파일 생성
  - [ ] `LandingPageData` 스키마 정의:
    - `hero`: object { title: string, subtitle: string }
    - `valueProps`: array of 3 object { title: string, description: string }
    - `cta`: object { buttonText: string, comingSoonMessage: string }
    - `emailForm`: object { label: string, placeholder: string, consentText: string }
  - [ ] `export type LandingPageData = z.infer<typeof LandingPageData>`
- [ ] Task 3: generateLanding 함수 작성 (AC: #3, #4, #5, #6)
  - [ ] `src/lib/llm/generate.ts` 파일 생성
  - [ ] Anthropic SDK 초기화 (API 키는 `process.env.ANTHROPIC_API_KEY` 직접 참조)
  - [ ] `generateLanding(prompt, instructions?)` 함수 구현
  - [ ] `anthropic.messages.create()` 호출 시 `tools` 파라미터에 `LandingPageData` 스키마 기반 tool 정의
  - [ ] 응답에서 tool_use block 찾아 input 추출
  - [ ] `LandingPageData.parse(toolInput)`로 검증
  - [ ] Zod 검증 실패 시 throw (상위에서 처리)
  - [ ] Kill Switch 관련 import/호출 없음 (Story 1.7에서 추가)
- [ ] Task 4: 테스트 호출 확인 (AC: #7)
  - [ ] 임시 route `src/app/api/llm-test/route.ts` 생성 (GET handler)
  - [ ] 하드코딩된 프롬프트("퇴근 후 15분 코딩 챌린지")로 `generateLanding` 호출
  - [ ] 반환된 `LandingPageData`를 JSON으로 응답
  - [ ] 로컬 `bun run dev` → `localhost:3000/api/llm-test` 접근
  - [ ] 유효한 JSON 응답 확인 (hero, valueProps, cta, emailForm 필드 존재)
  - [ ] 테스트 후 이 route는 Story 1.7에서 재사용 또는 Story 2.3 전에 제거

## Dev Notes

**Architecture 결정 1, 2 참조:**

- 결정 1: **LLM Provider Abstraction 제거 (YAGNI)** — 함수 1개가 경계
- 결정 2: **Anthropic tool_use + Zod 검증** (OpenAI response_format 대신)

**LandingPageData Zod 스키마 예시:**

```ts
// src/lib/schemas/landing.ts
import { z } from 'zod'

export const LandingPageData = z.object({
  hero: z.object({
    title: z.string().min(1).max(200),
    subtitle: z.string().min(1).max(500),
  }),
  valueProps: z.array(
    z.object({
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(300),
    })
  ).length(3),
  cta: z.object({
    buttonText: z.string().min(1).max(50),
    comingSoonMessage: z.string().min(1).max(200),
  }),
  emailForm: z.object({
    label: z.string().min(1).max(100),
    placeholder: z.string().min(1).max(100),
    consentText: z.string().min(1).max(300),
  }),
})

export type LandingPageData = z.infer<typeof LandingPageData>
```

**generateLanding 함수 구조:**

```ts
// src/lib/llm/generate.ts
import Anthropic from '@anthropic-ai/sdk'
import { LandingPageData } from '@/lib/schemas/landing'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const systemPrompt = `You are a landing page copywriter. Generate a complete landing page structure in Korean based on the user's one-line idea. Use the create_landing_page tool to return structured data.`

export async function generateLanding(
  prompt: string,
  instructions?: string
): Promise<LandingPageData> {
  const userMessage = instructions
    ? `아이디어: ${prompt}\n\n추가 지시사항: ${instructions}`
    : `아이디어: ${prompt}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929', // 또는 최신 Claude Sonnet
    max_tokens: 2048,
    system: systemPrompt,
    tools: [
      {
        name: 'create_landing_page',
        description: 'Create a structured landing page for the given idea',
        input_schema: {
          type: 'object',
          properties: {
            hero: { /* ... Zod 스키마를 JSON Schema로 변환 */ },
            // ... 나머지 필드
          },
          required: ['hero', 'valueProps', 'cta', 'emailForm'],
        },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
    tool_choice: { type: 'tool', name: 'create_landing_page' },
  })

  const toolUse = response.content.find((block) => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('LLM did not use the expected tool')
  }

  return LandingPageData.parse(toolUse.input)
}
```

**JSON Schema 변환**: `zod-to-json-schema` 라이브러리 또는 수동 정의. 수동 권장 (명시적).

**Note**: Kill Switch, 재시도, 로깅은 Story 1.7 / 2.3 / 2.4에서 추가. 이 스토리는 "순수 호출"만.

### Project Structure Notes

- `src/lib/schemas/landing.ts` — Single Source of Truth (Architecture Cross-Cutting Concern #7)
- `src/lib/llm/generate.ts` — 함수 1개 = 경계 (Decision 1 YAGNI)
- 임시 `/api/llm-test` route는 Story 1.7 완료 후 제거 고려

### References

- [Source: architecture.md#Core Architectural Decisions#결정 1, 결정 2] — LLM 함수 경계, Structured Output 전략
- [Source: architecture.md#Cross-Cutting Concerns#7] — Single Source of Truth (Schema)
- [Source: prd.md#FR3, FR4] — LLM 생성 및 검증 요구
- [Source: prd.md#NFR-P4] — LLM 응답 p95 30초 (이 스토리에서는 측정 불요, 참조만)
- [Source: epics.md#Story 1.6] — 원본 AC

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
