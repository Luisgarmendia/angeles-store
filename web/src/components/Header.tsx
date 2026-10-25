"use client"

import Link from "next/link"
import { BagIcon, SettingsIcon } from "./Icons"
import { useStoreSettings } from "./store-settings-provider"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
}

export function Header({ cartCount, onCartOpen }: HeaderProps) {
  const { store } = useStoreSettings()

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <p className="bg-ink px-4 py-2 text-center text-[10px] uppercase tracking-[0.2em] text-cream/90">
        Envíos a todo Honduras · Pedidos por WhatsApp
      </p>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/#catalogo"
          className="font-display text-lg leading-none tracking-[0.12em] text-ink sm:text-xl sm:tracking-[0.16em] lg:text-2xl lg:tracking-[0.2em]"
        >
          {store.name.toUpperCase()}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex lg:gap-8">
          <Link href="/#catalogo" className="transition-colors hover:text-ink">
            Catálogo
          </Link>
          <Link href="/#como-comprar" className="transition-colors hover:text-ink">
            Cómo comprar
          </Link>
          <Link href="/#contacto" className="transition-colors hover:text-ink">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/admin"
            className="rounded-full p-2.5 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Abrir panel de administración"
          >
            <SettingsIcon className="h-5 w-5" />
          </Link>
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
