import { config } from "../config"
import { ArrowRightIcon } from "./Icons"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-rose-dark">
            {config.brand.tagline}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.03] text-ink sm:text-6xl">
            Moda que te hace <span className="italic text-wine">sentir vos</span>.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            {config.brand.description}
          </p>
          <a
            href="#catalogo"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-wine"
          >
            Ver colección
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-rose/15 blur-3xl" aria-hidden="true" />
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            alt="Selección de prendas femeninas de la nueva colección"
            className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl shadow-ink/10"
          />
        </div>
      </div>
    </section>
  )
}
