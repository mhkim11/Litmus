import { notFound } from 'next/navigation'
import { getIdeaById } from '@/lib/db/queries/ideas'
import HeroSection from '@/components/published/HeroSection'
import ValueProps from '@/components/published/ValueProps'
import CTASection from '@/components/published/CTASection'
import LegalDisclaimerFooter from '@/components/published/LegalDisclaimerFooter'
import type { LandingPageData } from '@/lib/schemas/landing'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PreviewPage({ params }: Props) {
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
    <>
      {/* Operator 전용 배너 */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center justify-between">
        <span>👁️ 미리보기 모드 — 방문자가 보게 될 화면입니다</span>
        <a href={`/operator/ideas/${id}`} className="underline hover:text-amber-900">
          편집으로 돌아가기
        </a>
      </div>
      <main className="min-h-screen bg-white flex flex-col">
        <HeroSection title={pageData.hero.title} subtitle={pageData.hero.subtitle} />
        <ValueProps items={pageData.valueProps} />
        <CTASection
          buttonText={pageData.cta.buttonText}
          comingSoonMessage={pageData.cta.comingSoonMessage}
        />
        <LegalDisclaimerFooter />
      </main>
    </>
  )
}
