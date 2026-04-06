import { notFound } from 'next/navigation'
import { getIdeaBySlug } from '@/lib/db/queries/ideas'
import HeroSection from '@/components/published/HeroSection'
import ValueProps from '@/components/published/ValueProps'
import CTASection from '@/components/published/CTASection'
import TrackingBoundary from '@/components/published/TrackingBoundary'
import type { LandingPageData } from '@/lib/schemas/landing'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function PublishedPage({ params }: Props) {
  const { slug } = await params
  const idea = await getIdeaBySlug(slug)

  if (!idea) notFound()

  const pageData = idea.finalPageData as LandingPageData

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <TrackingBoundary ideaId={idea.id} />
      <HeroSection title={pageData.hero.title} subtitle={pageData.hero.subtitle} />
      <ValueProps items={pageData.valueProps} />
      <CTASection
        ideaId={idea.id}
        buttonText={pageData.cta.buttonText}
        comingSoonMessage={pageData.cta.comingSoonMessage}
      />
    </main>
  )
}
