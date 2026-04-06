interface HeroSectionProps {
  title: string
  subtitle: string
}

export default function HeroSection({ title, subtitle }: HeroSectionProps) {
  return (
    <section className="text-center py-16 px-6">
      <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{title}</h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
    </section>
  )
}
