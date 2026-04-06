import { notFound } from 'next/navigation'
import { getIdeaById } from '@/lib/db/queries/ideas'
import IdeaEditor from '@/components/operator/IdeaEditor'
import type { LandingPageData } from '@/lib/schemas/landing'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function IdeaEditPage({ params }: Props) {
  const { id } = await params
  const idea = await getIdeaById(id)

  if (!idea) {
    notFound()
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <a href="/operator" className="text-sm text-blue-600 hover:underline">
          ← Operator Console
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-8">아이디어 편집</h1>
      <IdeaEditor
        ideaId={idea.id}
        initialPrompt={idea.finalPrompt ?? ''}
        initialInstructions={idea.finalInstructions ?? ''}
        initialPageData={(idea.finalPageData as LandingPageData) ?? null}
      />
    </main>
  )
}
