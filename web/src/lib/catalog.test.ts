import { describe, expect, it } from "vitest"
import { DEFAULT_CATALOG_FILTERS, filterAndSortProducts } from "./catalog"
import type { Product } from "./types"

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id,
    nombre: id,
    precio: 100,
    categoria: "Cremas",
    descripcion: "",
    imagen: "",
    imagenes: [],
    stock: null,
    porEncargo: false,
    precioAnterior: null,
    creadoEn: "2026-01-01T00:00:00.000Z",
    variants: [],
    ...overrides,
  }
}

describe("filterAndSortProducts", () => {
  const catalog: Product[] = [
    product("c1", {
      nombre: "Crema de día",
      precio: 480,
      creadoEn: "2026-01-01T00:00:00.000Z",
    }),
    product("s1", {
      nombre: "Camisa blanca",
      categoria: "Camisas",
      precio: 590,
      creadoEn: "2026-03-01T00:00:00.000Z",
    }),
    product("c2", {
      nombre: "Crema de noche",
      precio: 520,
      creadoEn: "2026-02-01T00:00:00.000Z",
    }),
  ]

  it("keeps the featured order by default", () => {
    expect(filterAndSortProducts(catalog, DEFAULT_CATALOG_FILTERS).map((item) => item.id)).toEqual([
      "c1",
      "s1",
      "c2",
    ])
  })

  it("filters by an inclusive price range", () => {
    const result = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      minPrice: "480",
      maxPrice: "520",
    })

    expect(result.map((item) => item.id)).toEqual(["c1", "c2"])
  })

  it("swaps inverted price bounds", () => {
    const result = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      minPrice: "520",
      maxPrice: "480",
    })

    expect(result.map((item) => item.id)).toEqual(["c1", "c2"])
  })

  it("ignores an invalid price input", () => {
    const result = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      minPrice: "abc",
    })

    expect(result).toHaveLength(3)
  })

  it("combines search and category", () => {
    const result = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      search: "noche",
      category: "Cremas",
    })

    expect(result.map((item) => item.id)).toEqual(["c2"])
  })

  it("sorts by insertion date, newest first", () => {
    const result = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      sort: "recientes",
    })

    expect(result.map((item) => item.id)).toEqual(["s1", "c2", "c1"])
  })

  it("sorts by price in both directions", () => {
    const ascending = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      sort: "precio-asc",
    })
    const descending = filterAndSortProducts(catalog, {
      ...DEFAULT_CATALOG_FILTERS,
      sort: "precio-desc",
    })

    expect(ascending.map((item) => item.id)).toEqual(["c1", "c2", "s1"])
    expect(descending.map((item) => item.id)).toEqual(["s1", "c2", "c1"])
  })
})
