'use client'

import { trackEvent } from '@/lib/utils/tracking'

interface CTASectionProps {
  buttonText: string
  comingSoonMessage: string
  ideaId?: string
  onCtaClick?: () => void
}

export default function CTASection({ buttonText, comingSoonMessage, ideaId, onCtaClick }: CTASectionProps) {
  function handleClick() {
    if (ideaId) {
      trackEvent(ideaId, 'cta_click')
    }
    onCtaClick?.()
  }

  return (
    <section className="py-12 px-6 text-center">
      <button
        onClick={handleClick}
        className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors min-w-[44px] min-h-[44px]"
      >
        {buttonText}
      </button>
      <p className="mt-4 text-gray-500 text-sm">{comingSoonMessage}</p>
    </section>
  )
}
