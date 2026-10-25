"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
  { href: "/admin", label: "Productos" },
  { href: "/admin/ajustes", label: "Ajustes" },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <nav className="flex w-full gap-1 rounded-full bg-sand p-1 sm:w-fit" aria-label="Secciones del panel">
      {TABS.map((tab) => {
        const active = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 rounded-full px-5 py-2 text-center text-sm transition-colors sm:flex-none ${
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
