import {
  DEFAULT_CATALOG_FILTERS,
  type CatalogFilterInput,
  type CatalogSort,
} from "./catalog"
import type { Product } from "./types"

export const CATALOG_PAGE_SIZE = 24
export const CATALOG_MAX_PAGE_SIZE = 60
export const CATALOG_SORTS: readonly CatalogSort[] = [
  "destacados",
  "recientes",
  "precio-asc",
  "precio-desc",
]

export interface CatalogPage {
  products: Product[]
  nextCursor: string | null
  total: number
}

export interface CatalogCursor {
  /** sort_order, used by the featured order. */
  s?: number
  /** Raw created_at text, kept at microsecond precision for a stable keyset. */
  c?: string
  /** price_cents, used by the price orders. */
  p?: number
  i: string
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : ""
}

/** Coerces untrusted filter input into the exact shape the catalog query uses. */
export function normalizeCatalogFilters(
  input?: Partial<CatalogFilterInput> | null,
): CatalogFilterInput {
  const raw = input ?? {}
  const sort = CATALOG_SORTS.includes(raw.sort as CatalogSort)
    ? (raw.sort as CatalogSort)
    : DEFAULT_CATALOG_FILTERS.sort

  return {
    search: cleanText(raw.search, 80),
    category: cleanText(raw.category, 80) || DEFAULT_CATALOG_FILTERS.category,
    minPrice: cleanText(raw.minPrice, 12),
    maxPrice: cleanText(raw.maxPrice, 12),
    sort,
    onlyDiscounted: raw.onlyDiscounted === true,
    onlyMadeToOrder: raw.onlyMadeToOrder === true,
  }
}

/** Converts a lempira amount typed by the user into the stored cents. */
export function priceToCents(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const amount = Number(trimmed.replace(",", "."))
  if (!Number.isFinite(amount) || amount < 0) return null

  return Math.round(amount * 100)
}

export function encodeCatalogCursor(cursor: CatalogCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url")
}

/** Decodes a client-supplied cursor; anything malformed means "start over". */
export function decodeCatalogCursor(value?: string | null): CatalogCursor | null {
  if (typeof value !== "string" || value.length === 0 || value.length > 300) return null

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown
    if (!parsed || typeof parsed !== "object") return null

    const record = parsed as Record<string, unknown>
    if (typeof record.i !== "string" || record.i.length === 0 || record.i.length > 80) {
      return null
    }

    const cursor: CatalogCursor = { i: record.i }
    if (typeof record.s === "number" && Number.isFinite(record.s)) cursor.s = record.s
    if (typeof record.c === "string" && record.c.length > 0 && record.c.length <= 40) {
      cursor.c = record.c
    }
    if (typeof record.p === "number" && Number.isFinite(record.p)) cursor.p = record.p

    return cursor
  } catch {
    return null
  }
}
