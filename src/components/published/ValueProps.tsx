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
          <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
