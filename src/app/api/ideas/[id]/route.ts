import { NextRequest, NextResponse } from 'next/server'
import { getIdeaById, deleteIdea } from '@/lib/db/queries/ideas'

export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const idea = await getIdeaById(id)

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (idea.status !== 'archived') {
      return NextResponse.json(
        {
          error: 'Only archived ideas can be deleted. Please archive first.',
          code: 'NOT_ARCHIVED',
        },
        { status: 409 }
      )
    }

    await deleteIdea(id)
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('[delete idea] error:', error)
    return NextResponse.json({ error: '삭제에 실패했습니다.' }, { status: 500 })
  }
}
