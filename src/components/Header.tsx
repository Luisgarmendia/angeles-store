import { config } from "../config"
import { BagIcon, SettingsIcon } from "./Icons"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
  onAdminOpen: () => void
}

export function Header({ cartCount, onCartOpen, onAdminOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <p className="bg-ink px-4 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-cream/90">
        Envíos a todo Honduras · Pedidos por WhatsApp
      </p>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#catalogo"
          className="font-display text-lg leading-none tracking-[0.12em] text-ink sm:text-xl sm:tracking-[0.16em] lg:text-2xl lg:tracking-[0.2em]"
        >
          {config.brand.name.toUpperCase()}
        </a>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex lg:gap-8">
          <a href="#catalogo" className="transition-colors hover:text-ink">
            Catálogo
          </a>
          <a href="#como-comprar" className="transition-colors hover:text-ink">
            Cómo comprar
          </a>
          <a href="#contacto" className="transition-colors hover:text-ink">
            Contacto
          </a>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onAdminOpen}
            className="rounded-full p-2.5 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Abrir panel de administración"
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onCartOpen}
            className="relative rounded-full p-2.5 text-ink transition-colors hover:bg-sand"
            aria-label={`Abrir carrito, ${cartCount} productos`}
          >
            <BagIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine px-1 text-[10px] font-semibold text-cream">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
