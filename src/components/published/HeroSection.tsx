interface HeroSectionProps {
  title: string
  subtitle: string
}

export default function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section className="text-center py-16 sm:py-24 px-6">
      <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-4">{title}</h1>
      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
    </section>
  )
}
