"use client"

import { useMemo, useState } from "react"
import { SearchIcon, XIcon } from "./Icons"
import { CategoryFilter } from "./CategoryFilter"
import { ProductCard } from "./ProductCard"
import { Select } from "./Select"
import {
  DEFAULT_CATALOG_FILTERS,
  filterAndSortProducts,
  type CatalogFilterInput,
  type CatalogSort,
} from "@/lib/catalog"
import type { Product } from "@/lib/types"

const SORT_OPTIONS: Array<{ value: CatalogSort; label: string }> = [
  { value: "destacados", label: "Destacados" },
  { value: "recientes", label: "Más recientes" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
]

export function Catalog({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<CatalogFilterInput>(DEFAULT_CATALOG_FILTERS)

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.categoria)))],
    [products],
  )

  const filtered = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters],
  )

  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "Todos" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.sort !== "destacados"

  function updateFilter<K extends keyof CatalogFilterInput>(
    key: K,
    value: CatalogFilterInput[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function clearFilters() {
    setFilters(DEFAULT_CATALOG_FILTERS)
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
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Busca cremas, camisas, vestidos…"
            className="w-full rounded-full border border-ink/15 bg-white/60 py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
            aria-label="Buscar productos"
          />
        </div>

        <CategoryFilter
          categories={categories}
          active={filters.category}
          onChange={(category) => updateFilter("category", category)}
        />

        <div className="flex flex-col gap-4 border-t border-ink/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Precio mín.
              </span>
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={filters.minPrice}
                onChange={(event) => updateFilter("minPrice", event.target.value)}
                placeholder="0"
                className="w-24 rounded-full border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"
                aria-label="Precio mínimo"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Precio máx.
              </span>
              <input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={filters.maxPrice}
                onChange={(event) => updateFilter("maxPrice", event.target.value)}
                placeholder="Sin límite"
                className="w-32 rounded-full border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"
                aria-label="Precio máximo"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                Ordenar por
              </span>
              <Select
                variant="pill"
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value as CatalogSort)}
                aria-label="Ordenar productos"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-muted transition-colors hover:border-ink hover:text-ink"
              >
                <XIcon className="h-3 w-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center">
            <SearchIcon className="h-8 w-8 text-rose" />
            <p className="font-display text-2xl text-ink">No encontramos nada así</p>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Prueba con otra palabra, otro rango de precio o revisa otra categoría. Seguro hay
              algo que te va a encantar.
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
