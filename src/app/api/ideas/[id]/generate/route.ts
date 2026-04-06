import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateLanding } from '@/lib/llm/generate'
import { updateIdeaGeneration } from '@/lib/db/queries/ideas'
import type { LandingPageData } from '@/lib/schemas/landing'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const RequestSchema = z.object({
  prompt: z.string().min(1),
  instructions: z.string().optional(),
})

async function generateWithRetry(
  prompt: string,
  instructions?: string
): Promise<LandingPageData> {
  try {
    return await generateLanding(prompt, instructions)
  } catch {
    // 1회 자동 재시도 (NFR-R3)
    return await generateLanding(prompt, instructions)
  }
}

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

    const { prompt, instructions } = parsed.data
    const pageData = await generateWithRetry(prompt, instructions)

    await updateIdeaGeneration(id, prompt, pageData, instructions)

    return NextResponse.json(pageData)
  } catch (err) {
    console.error('Generate failed:', err)
    return NextResponse.json(
      { error: 'Generation failed', code: 'GENERATE_ERROR' },
      { status: 500 }
    )
  }
}
