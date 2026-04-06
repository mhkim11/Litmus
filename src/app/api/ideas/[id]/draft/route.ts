import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateDraft } from '@/lib/db/queries/ideas'

export const dynamic = 'force-dynamic'

const RequestSchema = z.object({
  finalPrompt: z.string().optional(),
  finalInstructions: z.string().optional(),
  finalPageData: z.record(z.string(), z.unknown()).optional(),
})

export async function PATCH(
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

    await updateDraft(id, parsed.data)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Draft save failed:', err)
    return NextResponse.json(
      { error: 'Failed to save draft', code: 'SAVE_ERROR' },
      { status: 500 }
    )
  }
}
