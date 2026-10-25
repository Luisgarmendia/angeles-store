import type { Product } from "./types"

export type CatalogSort = "destacados" | "recientes" | "precio-asc" | "precio-desc"

export interface CatalogFilterInput {
  search: string
  category: string
  minPrice: string
  maxPrice: string
  sort: CatalogSort
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilterInput = {
  search: "",
  category: "Todos",
  minPrice: "",
  maxPrice: "",
  sort: "destacados",
}

function parseAmount(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const amount = Number(trimmed.replace(",", "."))
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function dateValue(value: string): number {
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Applies the catalog search, category and price range, then sorts the result.
 * The default order is the featured order returned by the database. When the
 * user types a minimum above the maximum, the bounds are swapped so an obvious
 * typo does not produce an empty catalog.
 */
export function filterAndSortProducts(
  products: Product[],
  input: CatalogFilterInput,
): Product[] {
  const term = input.search.trim().toLowerCase()
  const min = parseAmount(input.minPrice)
  const max = parseAmount(input.maxPrice)
  const swapped = min !== null && max !== null && min > max
  const low = swapped ? max : min
  const high = swapped ? min : max

  const filtered = products.filter((product) => {
    if (input.category !== "Todos" && product.categoria !== input.category) return false

    if (
      term &&
      !`${product.nombre} ${product.descripcion}`.toLowerCase().includes(term)
    ) {
      return false
    }

    if (low !== null && product.precio < low) return false
    if (high !== null && product.precio > high) return false

    return true
  })

  const indexed = filtered.map((product, index) => ({ product, index }))

  switch (input.sort) {
    case "recientes":
      indexed.sort(
        (a, b) =>
          dateValue(b.product.creadoEn) - dateValue(a.product.creadoEn) ||
          a.index - b.index,
      )
      break
    case "precio-asc":
      indexed.sort((a, b) => a.product.precio - b.product.precio || a.index - b.index)
      break
    case "precio-desc":
      indexed.sort((a, b) => b.product.precio - a.product.precio || a.index - b.index)
      break
    default:
      break
  }

  return indexed.map((entry) => entry.product)
}
