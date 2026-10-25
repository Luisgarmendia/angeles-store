import type { SelectHTMLAttributes } from "react"
import { ChevronDownIcon } from "./Icons"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "field" | "pill"
}

const SHAPES = {
  field: "w-full rounded-xl px-4",
  pill: "rounded-full px-4",
} as const

export function Select({
  variant = "field",
  className = "",
  children,
  ...props
}: SelectProps) {
  const wrapper = variant === "pill" ? "relative inline-flex" : "relative"

  return (
    <div className={wrapper}>
      <select
        {...props}
        className={`${SHAPES[variant]} appearance-none border border-ink/15 bg-white/60 py-2.5 pr-10 text-sm text-ink outline-none transition-colors focus:border-rose focus:ring-2 focus:ring-rose/20 ${className}`}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </div>
  )
}
