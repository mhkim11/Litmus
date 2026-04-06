interface CTASectionProps {
  buttonText: string
  comingSoonMessage: string
  onCtaClick?: () => void
}

export default function CTASection({ buttonText, comingSoonMessage, onCtaClick }: CTASectionProps) {
  return (
    <section className="py-12 px-6 text-center">
      <button
        onClick={onCtaClick}
        className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl text-lg hover:bg-blue-700 transition-colors min-w-[44px] min-h-[44px]"
      >
        {buttonText}
      </button>
      <p className="mt-4 text-gray-500 text-sm">{comingSoonMessage}</p>
    </section>
  )
}
