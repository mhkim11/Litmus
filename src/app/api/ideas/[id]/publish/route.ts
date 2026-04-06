import { NextRequest, NextResponse } from 'next/server'
import { getIdeaById, publishIdea, republishIdea } from '@/lib/db/queries/ideas'
import { generateSlug } from '@/lib/utils/slug'

export const runtime = 'nodejs'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const idea = await getIdeaById(id)

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found', code: 'NOT_FOUND' }, { status: 404 })
    }

    if (!idea.finalPageData) {
      return NextResponse.json(
        { error: '생성된 콘텐츠가 없습니다. 먼저 생성해주세요.', code: 'NO_CONTENT' },
        { status: 400 }
      )
    }

    const origin = new URL(request.url).origin

    let result: { id: string; slug: string; publishedAt: string }

    if (idea.slug) {
      // Re-publish: slug and published_at are immutable
      result = await republishIdea(id)
    } else {
      // First-time publish: generate slug
      const slug = generateSlug()
      result = await publishIdea(id, slug)
    }

    const publishedUrl = `${origin}/${result.slug}`

    return NextResponse.json({
      id: result.id,
      slug: result.slug,
      publishedUrl,
      publishedAt: result.publishedAt,
    })
  } catch (error) {
    console.error('[publish] error:', error)
    return NextResponse.json({ error: '발행에 실패했습니다.' }, { status: 500 })
  }
}
