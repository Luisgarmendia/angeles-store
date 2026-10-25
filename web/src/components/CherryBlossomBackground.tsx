import type { CSSProperties } from "react"

const PETALS = Array.from({ length: 18 }, (_, index) => ({
  left: (index * 37 + 11) % 100,
  size: 8 + (index % 5) * 2,
  delay: -(index * 1.7),
  duration: 14 + (index % 7) * 2,
  drift: (index % 2 === 0 ? 1 : -1) * (18 + (index % 4) * 12),
  opacity: 0.18 + (index % 4) * 0.06,
}))

/** Decorative falling cherry-blossom petals behind the storefront content. */
export function CherryBlossomBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="petal"
          style={
            {
              left: `${petal.left}%`,
              width: petal.size,
              height: petal.size,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              "--petal-drift": `${petal.drift}px`,
              "--petal-opacity": petal.opacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
