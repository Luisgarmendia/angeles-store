import type { CSSProperties } from "react"

const PETALS = Array.from({ length: 22 }, (_, index) => ({
  left: (index * 37 + 11) % 100,
  size: 10 + (index % 6) * 3,
  delay: -(index * 1.3),
  duration: 11 + (index % 6) * 2,
  drift: (index % 2 === 0 ? 1 : -1) * (30 + (index % 4) * 20),
  opacity: 0.32 + (index % 5) * 0.07,
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
