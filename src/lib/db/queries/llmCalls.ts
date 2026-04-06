import { drizzle } from 'drizzle-orm/neon-http'
import { getDb } from '@/lib/db/client'
import { llmCalls } from '@/lib/db/schema'

export interface LogLLMCallParams {
  ideaId?: string
  provider: string
  model: string
  promptTokens: number
  completionTokens: number
  costUsd: number
  durationMs: number
  success: boolean
  errorMessage?: string
}

export async function logLLMCall(params: LogLLMCallParams): Promise<void> {
  const db = drizzle(getDb())
  await db.insert(llmCalls).values({
    ideaId: params.ideaId ?? null,
    provider: params.provider,
    model: params.model,
    promptTokens: String(params.promptTokens),
    completionTokens: String(params.completionTokens),
    costUsd: String(params.costUsd),
    durationMs: String(params.durationMs),
    success: params.success,
    errorMessage: params.errorMessage ?? null,
  })
}

export async function getCurrentMonthLLMCost(): Promise<number> {
  const sql = getDb()
  const result =
    await sql`SELECT COALESCE(SUM(cost_usd::numeric), 0) as total FROM llm_calls WHERE created_at >= date_trunc('month', NOW())`
  return Number(result[0]?.total ?? 0)
}
