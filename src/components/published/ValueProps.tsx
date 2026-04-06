interface ValueProp {
  title: string
  description: string
}

interface ValuePropsProps {
  items: ValueProp[]
}

export default function ValueProps({ items }: ValuePropsProps) {
  return (
    <section className="py-12 px-6 max-w-3xl mx-auto">
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-6 bg-white">
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
