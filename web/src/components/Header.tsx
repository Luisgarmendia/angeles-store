"use client"

import { useState } from "react"
import Link from "next/link"
import { BagIcon, MenuIcon, SettingsIcon, XIcon } from "./Icons"
import { useStoreSettings } from "./store-settings-provider"

interface HeaderProps {
  cartCount: number
  onCartOpen: () => void
}

const MOBILE_LINKS = [
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/categorias", label: "Categorías" },
  { href: "/#como-comprar", label: "Cómo comprar" },
  { href: "/#contacto", label: "Contacto" },
  { href: "/envios-y-devoluciones", label: "Envíos y devoluciones" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
]

export function Header({ cartCount, onCartOpen }: HeaderProps) {
  const { store } = useStoreSettings()
  const [menuOpen, setMenuOpen] = useState(false)

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
          <Link href="/categorias" className="transition-colors hover:text-ink">
            Categorías
          </Link>
          <Link href="/#como-comprar" className="transition-colors hover:text-ink">
            Cómo comprar
          </Link>
          <Link href="/#contacto" className="transition-colors hover:text-ink">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="rounded-full p-2.5 text-ink transition-colors hover:bg-sand md:hidden"
          >
            {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
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

      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className="border-t border-ink/10 bg-cream md:hidden"
      >
        <nav aria-label="Navegación móvil" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ul className="flex flex-col">
            {MOBILE_LINKS.map((link) => (
              <li key={link.href} className="border-b border-ink/5 last:border-0">
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-sm text-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
