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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#catalogo" className="font-display text-2xl tracking-[0.22em] text-ink">
          {config.brand.name.toUpperCase()}
        </a>

        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <a href="#catalogo" className="transition-colors hover:text-ink">
            Catálogo
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
