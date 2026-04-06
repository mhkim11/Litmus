'use client'

import { useState } from 'react'
import { trackEvent } from '@/lib/utils/tracking'
import EmailForm from './EmailForm'

interface CTASectionProps {
  buttonText: string
  comingSoonMessage: string
  ideaId?: string
  onCtaClick?: () => void
}

export default function CTASection({ buttonText, comingSoonMessage, ideaId, onCtaClick }: CTASectionProps) {
  const [showForm, setShowForm] = useState(false)

  function handleClick() {
    if (ideaId) {
      trackEvent(ideaId, 'cta_click')
    }
    onCtaClick?.()
    if (ideaId) {
      setShowForm(true)
    }
  }

  return (
    <section className="py-12 px-6 text-center flex flex-col items-center gap-6">
      {!showForm ? (
        <>
          <button
            onClick={handleClick}
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors min-w-[44px] min-h-[44px]"
          >
            {buttonText}
          </button>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{comingSoonMessage}</p>
        </>
      ) : (
        <EmailForm ideaId={ideaId!} />
      )}
    </section>
  )
}
