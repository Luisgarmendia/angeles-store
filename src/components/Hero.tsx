import { config } from "../config"
import { ArrowRightIcon, MessageIcon, TruckIcon, WalletIcon } from "./Icons"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-rose-dark">
            {config.brand.tagline}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.03] text-ink sm:text-6xl">
            Cuida tu piel, renueva tu <span className="italic text-wine">look</span>.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            {config.brand.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#catalogo"
              className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-sm font-medium text-cream transition-colors hover:bg-wine"
            >
              Ver cremas y camisas
              <ArrowRightIcon className="h-4 w-4" />
            </a>
            <a
              href="#como-comprar"
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 text-sm text-ink transition-colors hover:border-ink hover:bg-sand"
            >
              Cómo comprar
            </a>
          </div>

          <ul className="mt-8 grid gap-2 text-sm text-muted sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-rose-dark" />
              Envíos a todo Honduras
            </li>
            <li className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 text-rose-dark" />
              Pago contra entrega
            </li>
            <li className="flex items-center gap-2">
              <MessageIcon className="h-4 w-4 text-rose-dark" />
              Atención personalizada
            </li>
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-rose/15 blur-3xl" aria-hidden="true" />
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            alt="Selección de cremas, camisas y prendas para mujer"
            className="relative aspect-[4/5] w-full rounded-[2rem] object-cover shadow-xl shadow-ink/10"
          />
        </div>
      </div>
    </section>
  )
}
