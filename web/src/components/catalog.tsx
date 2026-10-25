"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "./Icons"
import { CategoryFilter } from "./CategoryFilter"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/lib/types"

export function Catalog({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.categoria)))],
    [products],
  )

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.categoria === category
      const matchesTerm =
        !term ||
        product.nombre.toLowerCase().includes(term) ||
        product.descripcion.toLowerCase().includes(term)
      return matchesCategory && matchesTerm
    })
  }, [products, search, category])

  function clearFilters() {
    setSearch("")
    setCategory("Todos")
  }

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
      <div className="flex flex-col gap-5 border-t border-ink/10 pt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Cremas y camisas</p>
            <h2 className="font-display text-4xl text-ink">La colección</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Cremas, camisas y piezas elegidas una por una. Entra al detalle y agrégalas a tu
            carrito.
          </p>
        </div>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Busca cremas, camisas, vestidos…"
            className="w-full rounded-full border border-ink/15 bg-white/60 py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
            aria-label="Buscar productos"
          />
        </div>

        <CategoryFilter categories={categories} active={category} onChange={setCategory} />

        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center">
            <SearchIcon className="h-8 w-8 text-rose" />
            <p className="font-display text-2xl text-ink">No encontramos nada así</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Prueba con otra palabra o revisa otra categoría. Seguro hay algo que te va a encantar.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 rounded-full border border-ink px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-cream"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
