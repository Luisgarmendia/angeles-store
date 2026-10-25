import { describe, expect, it } from "vitest"
import { DEFAULT_CATALOG_FILTERS } from "./catalog"
import {
  decodeCatalogCursor,
  encodeCatalogCursor,
  normalizeCatalogFilters,
  priceToCents,
} from "./catalog-query"

describe("normalizeCatalogFilters", () => {
  it("returns the defaults for empty input", () => {
    expect(normalizeCatalogFilters()).toEqual(DEFAULT_CATALOG_FILTERS)
  })

  it("trims and clamps untrusted strings", () => {
    const filters = normalizeCatalogFilters({
      search: `  ${"a".repeat(120)}  `,
      category: "  Cremas  ",
      minPrice: " 100 ",
      maxPrice: " 200 ",
      sort: "precio-asc",
      onlyDiscounted: true,
      onlyMadeToOrder: false,
    })

    expect(filters.search).toHaveLength(80)
    expect(filters.category).toBe("Cremas")
    expect(filters.minPrice).toBe("100")
    expect(filters.maxPrice).toBe("200")
    expect(filters.sort).toBe("precio-asc")
    expect(filters.onlyDiscounted).toBe(true)
    expect(filters.onlyMadeToOrder).toBe(false)
  })

  it("falls back to the default sort and category", () => {
    const filters = normalizeCatalogFilters({
      sort: "nope" as never,
      category: "   ",
    })

    expect(filters.sort).toBe("destacados")
    expect(filters.category).toBe("Todos")
  })
})

describe("priceToCents", () => {
  it("converts lempiras to cents and accepts commas", () => {
    expect(priceToCents("480")).toBe(48000)
    expect(priceToCents("480,5")).toBe(48050)
    expect(priceToCents("  ")).toBeNull()
    expect(priceToCents("-1")).toBeNull()
    expect(priceToCents("abc")).toBeNull()
  })
})

describe("catalog cursors", () => {
  it("round-trips a featured cursor with microsecond precision", () => {
    const cursor = { s: 3, c: "2026-10-25 21:15:28.123456+00", i: "c1" }

    expect(decodeCatalogCursor(encodeCatalogCursor(cursor))).toEqual(cursor)
  })

  it("round-trips a price cursor", () => {
    const cursor = { p: 48000, i: "c2" }

    expect(decodeCatalogCursor(encodeCatalogCursor(cursor))).toEqual(cursor)
  })

  it("rejects malformed cursors", () => {
    expect(decodeCatalogCursor(null)).toBeNull()
    expect(decodeCatalogCursor("")).toBeNull()
    expect(decodeCatalogCursor("not-base64")).toBeNull()
    expect(
      decodeCatalogCursor(Buffer.from(JSON.stringify({ s: 1 })).toString("base64url")),
    ).toBeNull()
  })
})
