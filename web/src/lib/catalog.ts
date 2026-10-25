export type CatalogSort = "destacados" | "recientes" | "precio-asc" | "precio-desc"

export interface CatalogFilterInput {
  search: string
  category: string
  minPrice: string
  maxPrice: string
  sort: CatalogSort
  onlyDiscounted: boolean
  onlyMadeToOrder: boolean
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilterInput = {
  search: "",
  category: "Todos",
  minPrice: "",
  maxPrice: "",
  sort: "destacados",
  onlyDiscounted: false,
  onlyMadeToOrder: false,
}

export interface CategoryCount {
  name: string
  count: number
}
