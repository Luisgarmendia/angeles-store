"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { canManageStore, type AdminRole } from "@/lib/roles"

const TABS = [
  { href: "/admin", label: "Resumen", ownerOnly: false },
  { href: "/admin/productos", label: "Productos", ownerOnly: false },
  { href: "/admin/pedidos", label: "Pedidos", ownerOnly: false },
  { href: "/admin/tienda", label: "Tienda", ownerOnly: true },
  { href: "/admin/usuarios", label: "Usuarios", ownerOnly: true },
]

export function AdminTabs({ role }: { role: AdminRole }) {
  const pathname = usePathname()
  const tabs = TABS.filter((tab) => !tab.ownerOnly || canManageStore(role))

  return (
    <nav
      className="flex w-full gap-1 overflow-x-auto overscroll-x-contain rounded-full bg-sand p-1 [scrollbar-width:none] sm:w-fit [&::-webkit-scrollbar]:hidden"
      aria-label="Secciones del panel"
    >
      {tabs.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-center text-sm transition-colors sm:px-5 ${
              active ? "bg-ink text-cream" : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
