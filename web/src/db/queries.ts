import { and, asc, eq, ilike, or } from "drizzle-orm"
import { getDb } from "."
import { products, settings } from "./schema"
import { DEFAULT_SETTINGS, mergeSettings } from "@/lib/settings"
import type { AdminProduct, Product, StoreSettings } from "@/lib/types"

function toProduct(row: typeof products.$inferSelect): Product {
  return {
    id: row.id,
    nombre: row.name,
    precio: row.priceCents / 100,
    categoria: row.category,
    descripcion: row.description,
    imagen: row.image,
  }
}

export async function listProducts({
  query = "",
  includeInactive = false,
}: {
  query?: string
  includeInactive?: boolean
} = {}): Promise<Product[]> {
  const db = getDb()
  const filters = []

  if (!includeInactive) filters.push(eq(products.active, true))
  if (query.trim()) {
    const term = `%${query.trim()}%`
    filters.push(
      or(
        ilike(products.name, term),
        ilike(products.category, term),
        ilike(products.description, term),
      ),
    )
  }

  const rows = await db
    .select()
    .from(products)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(products.sortOrder), asc(products.createdAt))

  return rows.map(toProduct)
}

export async function listAdminProducts(query = ""): Promise<AdminProduct[]> {
  const db = getDb()
  const term = query.trim() ? `%${query.trim()}%` : null
  const rows = await db
    .select()
    .from(products)
    .where(
      term
        ? or(
            ilike(products.name, term),
            ilike(products.category, term),
            ilike(products.description, term),
          )
        : undefined,
    )
    .orderBy(asc(products.sortOrder), asc(products.createdAt))

  return rows.map((row) => ({
    ...toProduct(row),
    active: row.active,
    sortOrder: row.sortOrder,
  }))
}

export async function getProduct(
  id: string,
  { includeInactive = false }: { includeInactive?: boolean } = {},
): Promise<Product | null> {
  const db = getDb()
  const rows = await db
    .select()
    .from(products)
    .where(includeInactive ? eq(products.id, id) : and(eq(products.id, id), eq(products.active, true)))
    .limit(1)

  return rows[0] ? toProduct(rows[0]) : null
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const db = getDb()
  const rows = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return mergeSettings(rows[0]?.data ?? DEFAULT_SETTINGS)
}

export async function listRecommendations(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const all = await listProducts()
  const others = all.filter((item) => item.id !== product.id)
  const same = others.filter((item) => item.categoria === product.categoria)
  const rest = others.filter((item) => item.categoria !== product.categoria)
  return [...same, ...rest].slice(0, limit)
}
