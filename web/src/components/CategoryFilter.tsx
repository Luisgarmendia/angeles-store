"use client"

import { useState } from "react"
import type { CategoryCount } from "@/lib/catalog"
import { ChevronDownIcon } from "./Icons"

const COLLAPSED_COUNT = 9

interface CategoryFilterProps {
  categories: CategoryCount[]
  active: string
  onChange: (category: string) => void
}

export function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  const [expanded, setExpanded] = useState(false)

  const all = ["Todos", ...categories.map((category) => category.name)]
  const collapsed = all.slice(0, COLLAPSED_COUNT)
  const visible = expanded
    ? all
    : collapsed.includes(active) || !all.includes(active)
      ? collapsed
      : [...collapsed.slice(0, COLLAPSED_COUNT - 1), active]
  const hidden = all.length - COLLAPSED_COUNT

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((category) => {
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

      {(hidden > 0 || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dashed border-ink/25 px-4 py-2 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-ink/50 hover:text-ink"
        >
          {expanded ? "Ver menos" : `Ver todas (${categories.length})`}
          <ChevronDownIcon
            className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  )
}
