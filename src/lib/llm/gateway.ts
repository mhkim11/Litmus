import { isBudgetExceeded } from './budget'
import { getCurrentMonthLLMCost } from '@/lib/db/queries/llmCalls'

export class BudgetExceededError extends Error {
  constructor(
    public usage: number,
    public max: number
  ) {
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
