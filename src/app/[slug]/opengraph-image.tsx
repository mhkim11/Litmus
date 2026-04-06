import { ImageResponse } from 'next/og'
import { getIdeaBySlug } from '@/lib/db/queries/ideas'
import type { LandingPageData } from '@/lib/schemas/landing'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const idea = await getIdeaBySlug(slug)
  const title = idea
    ? ((idea.finalPageData as LandingPageData)?.hero?.title ?? slug)
    : slug

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: '60px',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
