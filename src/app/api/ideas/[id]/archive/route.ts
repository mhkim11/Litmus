import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { archiveIdea, restoreIdea, getIdeaById } from '@/lib/db/queries/ideas'

export const runtime = 'nodejs'

const bodySchema = z.object({
  action: z.enum(['archive', 'restore']),
})

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }

    const idea = await getIdeaById(id)
    if (!idea) {
      return NextResponse.json({ error: 'Idea not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (parsed.data.action === 'archive') {
      if (idea.status !== 'active') {
        return NextResponse.json(
          { error: 'Only active ideas can be archived', code: 'INVALID_STATUS' },
          { status: 409 }
        )
      }
      await archiveIdea(id)
      return NextResponse.json({ id, status: 'archived', archivedAt: new Date().toISOString() })
    } else {
      if (idea.status !== 'archived') {
        return NextResponse.json(
          { error: 'Only archived ideas can be restored', code: 'INVALID_STATUS' },
          { status: 409 }
        )
      }
      await restoreIdea(id)
      return NextResponse.json({ id, status: 'active' })
    }
  } catch (error) {
    console.error('[archive] error:', error)
    return NextResponse.json({ error: '처리에 실패했습니다.' }, { status: 500 })
  }
}
