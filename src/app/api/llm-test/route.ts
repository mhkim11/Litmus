import { NextResponse } from 'next/server'
import { generateLanding } from '@/lib/llm/generate'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await generateLanding('퇴근 후 15분 코딩 챌린지')
    return NextResponse.json(result)
  } catch (err) {
    console.error('LLM test failed:', err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
