import { notFound } from 'next/navigation'
import { getIdeaById } from '@/lib/db/queries/ideas'
import type { LandingPageData } from '@/lib/schemas/landing'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuickPreviewPage({ params }: Props) {
  const { id } = await params
  const idea = await getIdeaById(id)

  if (!idea) notFound()

  const pageData = idea.finalPageData as LandingPageData | null

  if (!pageData) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">아직 생성된 내용이 없습니다.</p>
          <a href={`/operator/ideas/${id}`} className="text-sm text-blue-600 hover:underline">
            ← 편집 페이지로 돌아가기
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto px-6 py-16 flex flex-col gap-12">
      {/* Operator 전용 배너 */}
      <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-xs text-amber-700 flex items-center justify-between">
        <span>⚠️ Operator 전용 Quick Preview — 방문자에게 보이지 않습니다</span>
        <a href={`/operator/ideas/${id}`} className="underline hover:text-amber-900">
          편집으로 돌아가기
        </a>
      </div>

      {/* Hero */}
      <section className="text-center flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-gray-900">{pageData.hero.title}</h1>
        <p className="text-lg text-gray-600">{pageData.hero.subtitle}</p>
      </section>

      {/* Value Props */}
      <section className="flex flex-col gap-6">
        {pageData.valueProps.map((vp, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-800 mb-1">{vp.title}</h3>
            <p className="text-gray-600 text-sm">{vp.description}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center flex flex-col gap-3">
        <button className="mx-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg text-lg">
          {pageData.cta.buttonText}
        </button>
        <p className="text-sm text-gray-500">{pageData.cta.comingSoonMessage}</p>
      </section>
    </main>
  )
}
