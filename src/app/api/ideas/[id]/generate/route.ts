import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateLanding } from '@/lib/llm/generate'
import { checkAndEnforceBudget, BudgetExceededError } from '@/lib/llm/gateway'
import { calcCostUsd } from '@/lib/llm/pricing'
import { updateIdeaGeneration } from '@/lib/db/queries/ideas'
import { logLLMCall } from '@/lib/db/queries/llmCalls'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MODEL = 'claude-sonnet-4-6'

const RequestSchema = z.object({
  prompt: z.string().min(1),
  instructions: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', code: 'VALIDATION_ERROR' },
        { status: 422 }
      )
    }

    // Kill Switch 확인
    await checkAndEnforceBudget()

    const { prompt, instructions } = parsed.data
    const startTime = Date.now()
    let promptTokens = 0
    let completionTokens = 0
    let success = false
    let errorMessage: string | undefined

    try {
      // 1회 자동 재시도 (NFR-R3)
      let result
      try {
        result = await generateLanding(prompt, instructions)
      } catch {
        result = await generateLanding(prompt, instructions)
      }

      promptTokens = result.promptTokens
      completionTokens = result.completionTokens
      success = true

      await updateIdeaGeneration(id, prompt, result.pageData, instructions)

      return NextResponse.json(result.pageData)
    } catch (genErr) {
      errorMessage = genErr instanceof Error ? genErr.message : 'Unknown error'
      throw genErr
    } finally {
      // 성공/실패 무관 로깅
      const durationMs = Date.now() - startTime
      const costUsd = calcCostUsd(MODEL, promptTokens, completionTokens)
      await logLLMCall({
        ideaId: id,
        provider: 'anthropic',
        model: MODEL,
        promptTokens,
        completionTokens,
        costUsd,
        durationMs,
        success,
        errorMessage,
      }).catch((err) => console.error('logLLMCall failed:', err))
    }
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json(
        { error: '이번 달 LLM 예산을 초과했습니다.', code: 'BUDGET_EXCEEDED', usage: err.usage, max: err.max },
        { status: 429 }
      )
    }
    console.error('Generate failed:', err)
    return NextResponse.json(
      { error: 'Generation failed', code: 'GENERATE_ERROR' },
      { status: 500 }
    )
  }
}
