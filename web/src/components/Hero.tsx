import type { HeroContent } from "@/lib/types"
import { ArrowRightIcon, MessageIcon, TruckIcon, WalletIcon } from "./Icons"
import { ProductImage } from "./ProductImage"

const TRUST_ICONS = [TruckIcon, WalletIcon, MessageIcon]

interface HeroProps {
  hero: HeroContent
}

export function Hero({ hero }: HeroProps) {
  const trustItems = hero.trust
    .map((item, index) => ({ label: item.trim(), Icon: TRUST_ICONS[index] ?? MessageIcon }))
    .filter(({ label }) => label.length > 0)

  const accent = hero.accent.trim()
  const headline =
    accent && hero.headline.trimEnd().endsWith(accent)
      ? hero.headline.trimEnd().slice(0, -accent.length).trimEnd()
      : hero.headline

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div className="animate-fade-up">
          {hero.tagline && (
            <p className="text-xs uppercase tracking-[0.32em] text-rose-dark">{hero.tagline}</p>
          )}
          <h1 className="mt-4 font-display text-5xl leading-[1.03] text-ink sm:text-6xl">
            {headline}
            {accent && (
              <>
                {headline ? " " : null}
                <span className="italic text-wine">{accent}</span>
              </>
            )}
          </h1>
          {hero.description && (
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              {hero.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-wine"
            >
              {hero.ctaLabel || "Ver catálogo"}
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href="#como-comprar"
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm text-ink transition-colors hover:border-ink hover:bg-sand"
            >
              {hero.secondaryLabel || "Cómo comprar"}
            </a>
          </div>

          {trustItems.length > 0 && (
            <ul className="mt-8 grid gap-2 text-sm text-muted sm:grid-cols-3">
              {trustItems.map(({ label, Icon }, index) => (
                <li key={`${index}-${label}`} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-rose-dark" />
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="absolute -inset-6 rounded-full bg-rose/15 blur-3xl" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl shadow-ink/10">
            <ProductImage
              src={hero.image}
              alt={hero.imageAlt || hero.tagline || "Portada de la tienda"}
              className="h-full w-full animate-hero-zoom object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
