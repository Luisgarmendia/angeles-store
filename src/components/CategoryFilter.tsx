interface CategoryFilterProps {
  categories: string[]
  active: string
  onChange: (category: string) => void
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const isActive = category === active
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={isActive}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
              isActive
                ? "border-ink bg-ink text-cream"
                : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
