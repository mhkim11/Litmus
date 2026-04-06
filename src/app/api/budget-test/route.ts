import { NextResponse } from 'next/server'
import { checkAndEnforceBudget, BudgetExceededError } from '@/lib/llm/gateway'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await checkAndEnforceBudget()
    return NextResponse.json({ ok: true, message: 'Budget not exceeded' })
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json(
        { ok: false, error: err.message, usage: err.usage, max: err.max },
        { status: 429 }
      )
    }
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
