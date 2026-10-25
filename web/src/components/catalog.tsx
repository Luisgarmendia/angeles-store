"use client"

import { useMemo, useState } from "react"
import { ChevronDownIcon, FilterIcon, SearchIcon } from "./Icons"
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
  const [filtersOpen, setFiltersOpen] = useState(false)

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
    filters.sort !== "destacados" ||
    filters.onlyDiscounted ||
    filters.onlyMadeToOrder

  const hiddenFilterCount =
    (filters.minPrice !== "" ? 1 : 0) +
    (filters.maxPrice !== "" ? 1 : 0) +
    (filters.sort !== "destacados" ? 1 : 0) +
    (filters.onlyDiscounted ? 1 : 0) +
    (filters.onlyMadeToOrder ? 1 : 0)

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
        <div className="flex flex-col gap-2 animate-fade-up sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Cremas y camisas</p>
            <h2 className="font-display text-4xl text-ink">La colección</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Cremas, camisas y piezas elegidas una por una. Entra al detalle y agrégalas a tu
            carrito.
          </p>
        </div>

        <div className="relative animate-fade-up" style={{ animationDelay: "60ms" }}>
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

        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <CategoryFilter
            categories={categories}
            active={filters.category}
            onChange={(category) => updateFilter("category", category)}
          />
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-3 animate-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                filtersOpen || hiddenFilterCount > 0
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
              }`}
            >
              <FilterIcon className="h-3.5 w-3.5" />
              Filtros
              {hiddenFilterCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cream px-1 text-[10px] font-medium text-ink">
                  {hiddenFilterCount}
                </span>
              )}
              <ChevronDownIcon
                className={`h-3.5 w-3.5 transition-transform ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {hasActiveFilters && !filtersOpen && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-muted transition-colors hover:text-ink"
              >
                Limpiar
              </button>
            )}
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        {filtersOpen && (
          <div
            id="catalog-filters"
            className="rounded-2xl border border-ink/10 bg-white/60 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
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
                  className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"
                  aria-label="Precio mínimo"
                />
              </label>

              <label className="flex flex-col gap-1.5">
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
                  className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"
                  aria-label="Precio máximo"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Ordenar por
                </span>
                <Select
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

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors focus-within:ring-2 focus-within:ring-rose/30 ${
                  filters.onlyDiscounted
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.onlyDiscounted}
                  onChange={(event) => updateFilter("onlyDiscounted", event.target.checked)}
                  className="sr-only"
                />
                Solo ofertas
              </label>

              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors focus-within:ring-2 focus-within:ring-rose/30 ${
                  filters.onlyMadeToOrder
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters.onlyMadeToOrder}
                  onChange={(event) => updateFilter("onlyMadeToOrder", event.target.checked)}
                  className="sr-only"
                />
                Solo por encargo
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-muted transition-colors hover:text-ink"
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full bg-ink px-5 py-2 text-xs font-medium text-cream transition-colors hover:bg-wine"
              >
                Listo
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center animate-fade-up">
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
            {filtered.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
