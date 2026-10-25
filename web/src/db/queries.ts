import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  inArray,
  isNull,
  lt,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm"
import { getDb } from "."
import {
  adminNotifications,
  adminPushTokens,
  adminUsers,
  orderItems,
  orders,
  productVariants,
  products,
  settings,
} from "./schema"
import { DEFAULT_SETTINGS, mergeSettings } from "@/lib/settings"
import type { CatalogFilterInput, CatalogSort, CategoryCount } from "@/lib/catalog"
import {
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_PAGE_SIZE,
  decodeCatalogCursor,
  encodeCatalogCursor,
  normalizeCatalogFilters,
  priceToCents,
  type CatalogCursor,
  type CatalogPage,
} from "@/lib/catalog-query"
import type { AdminRole } from "@/lib/roles"
import type {
  AdminProduct,
  OrderPaymentStatus,
  OrderStatus,
  Product,
  ProductVariant,
  StoreSettings,
} from "@/lib/types"

export interface AdminOrder {
  id: string
  number: number
  customerName: string
  customerPhone: string
  customerAddress: string
  paymentMethod: string
  notes: string
  subtotal: number
  status: OrderStatus
  paymentStatus: OrderPaymentStatus
  pushSentAt: Date | null
  pushSuccessCount: number
  pushFailureCount: number
  pushError: string | null
  createdAt: Date
  itemCount: number
}

export interface AdminOrderItem {
  id: string
  productId: string
  productName: string
  variantLabel: string | null
  unitPrice: number
  quantity: number
  lineTotal: number
  image: string
  productExists: boolean
}

export interface AdminOrderDetail extends AdminOrder {
  items: AdminOrderItem[]
}

export interface AdminSummary {
  pendingOrders: number
  confirmedOrders: number
  pendingPayments: number
  lowStockProducts: number
  activeProducts: number
  totalSales: number
}

export interface AdminUserSummary {
  id: string
  email: string
  role: AdminRole
  createdAt: Date
}

export interface AdminNotification {
  id: string
  title: string
  body: string
  url: string
  readAt: string | null
  createdAt: string
}

function toProduct(row: typeof products.$inferSelect): Product {
  const images = row.images?.length ? row.images : row.image ? [row.image] : []

  return {
    id: row.id,
    nombre: row.name,
    precio: row.priceCents / 100,
    categoria: row.category,
    descripcion: row.description,
    imagen: images[0] ?? "",
    imagenes: images,
    stock: row.stock,
    porEncargo: row.madeToOrder,
    precioAnterior: row.compareAtPriceCents === null ? null : row.compareAtPriceCents / 100,
    creadoEn: row.createdAt.toISOString(),
    variants: [],
  }
}

function toVariant(row: typeof productVariants.$inferSelect): ProductVariant {
  return {
    id: row.id,
    label: row.label,
    stock: row.stock,
    precio: row.priceCents === null ? null : row.priceCents / 100,
    imagen: row.image,
  }
}

async function withVariants(
  rows: Array<typeof products.$inferSelect>,
): Promise<Product[]> {
  if (rows.length === 0) return []

  const variantRows = await getDb()
    .select()
    .from(productVariants)
    .where(
      inArray(
        productVariants.productId,
        rows.map((row) => row.id),
      ),
    )
    .orderBy(asc(productVariants.sortOrder))

  const byProduct = new Map<string, ProductVariant[]>()
  for (const row of variantRows) {
    const list = byProduct.get(row.productId) ?? []
    list.push(toVariant(row))
    byProduct.set(row.productId, list)
  }

  return rows.map((row) => ({
    ...toProduct(row),
    variants: byProduct.get(row.id) ?? [],
  }))
}

function catalogConditions(filters: CatalogFilterInput): SQL[] {
  const conditions: SQL[] = [eq(products.active, true)]

  if (filters.category !== "Todos") {
    conditions.push(eq(products.category, filters.category))
  }

  const term = filters.search.trim()
  if (term) {
    const pattern = `%${term}%`
    conditions.push(
      or(ilike(products.name, pattern), ilike(products.description, pattern))!,
    )
  }

  const min = priceToCents(filters.minPrice)
  const max = priceToCents(filters.maxPrice)
  const swap = min !== null && max !== null && min > max
  const low = swap ? max : min
  const high = swap ? min : max

  if (low !== null) conditions.push(gte(products.priceCents, low))
  if (high !== null) conditions.push(lte(products.priceCents, high))

  if (filters.onlyDiscounted) {
    conditions.push(
      and(
        gt(products.priceCents, 0),
        gt(products.compareAtPriceCents, products.priceCents),
      )!,
    )
  }

  if (filters.onlyMadeToOrder) {
    conditions.push(eq(products.madeToOrder, true))
  }

  return conditions
}

function catalogOrder(sort: CatalogSort): SQL[] {
  switch (sort) {
    case "recientes":
      return [desc(products.createdAt), desc(products.id)]
    case "precio-asc":
      return [asc(products.priceCents), asc(products.id)]
    case "precio-desc":
      return [desc(products.priceCents), desc(products.id)]
    default:
      return [asc(products.sortOrder), asc(products.createdAt), asc(products.id)]
  }
}

function catalogCursorCondition(sort: CatalogSort, cursor: CatalogCursor): SQL {
  switch (sort) {
    case "recientes": {
      if (!cursor.c) return sql`true`
      return or(
        sql`${products.createdAt} < ${cursor.c}::timestamptz`,
        and(
          sql`${products.createdAt} = ${cursor.c}::timestamptz`,
          lt(products.id, cursor.i),
        ),
      )!
    }
    case "precio-asc": {
      if (cursor.p === undefined) return sql`true`
      return or(
        gt(products.priceCents, cursor.p),
        and(eq(products.priceCents, cursor.p), gt(products.id, cursor.i)),
      )!
    }
    case "precio-desc": {
      if (cursor.p === undefined) return sql`true`
      return or(
        lt(products.priceCents, cursor.p),
        and(eq(products.priceCents, cursor.p), lt(products.id, cursor.i)),
      )!
    }
    default: {
      if (cursor.s === undefined || !cursor.c) return sql`true`
      return or(
        gt(products.sortOrder, cursor.s),
        and(
          eq(products.sortOrder, cursor.s),
          sql`${products.createdAt} > ${cursor.c}::timestamptz`,
        ),
        and(
          eq(products.sortOrder, cursor.s),
          sql`${products.createdAt} = ${cursor.c}::timestamptz`,
          gt(products.id, cursor.i),
        ),
      )!
    }
  }
}

function cursorFromRow(
  sort: CatalogSort,
  row: { id: string; sortOrder: number; priceCents: number; createdAtCursor: string },
): CatalogCursor {
  switch (sort) {
    case "recientes":
      return { c: row.createdAtCursor, i: row.id }
    case "precio-asc":
    case "precio-desc":
      return { p: row.priceCents, i: row.id }
    default:
      return { s: row.sortOrder, c: row.createdAtCursor, i: row.id }
  }
}

/**
 * Returns one keyset page of the active catalog. The cursor stores the exact
 * sort keys plus the id, so later pages never repeat or skip a product when
 * rows change between requests.
 */
export async function listCatalogPage({
  filters,
  cursor = null,
  limit = CATALOG_PAGE_SIZE,
  includeTotal = true,
}: {
  filters?: Partial<CatalogFilterInput> | null
  cursor?: string | null
  limit?: number
  includeTotal?: boolean
} = {}): Promise<CatalogPage> {
  const db = getDb()
  const normalized = normalizeCatalogFilters(filters)
  const size = Math.min(
    Math.max(Math.trunc(limit) || CATALOG_PAGE_SIZE, 1),
    CATALOG_MAX_PAGE_SIZE,
  )
  const conditions = catalogConditions(normalized)
  const decoded = decodeCatalogCursor(cursor)
  const pageConditions = decoded
    ? [...conditions, catalogCursorCondition(normalized.sort, decoded)]
    : conditions
  const where = and(...pageConditions)

  const rows = await db
    .select({
      ...getTableColumns(products),
      createdAtCursor: sql<string>`${products.createdAt}::text`,
    })
    .from(products)
    .where(where)
    .orderBy(...catalogOrder(normalized.sort))
    .limit(size + 1)

  const hasMore = rows.length > size
  const pageRows = hasMore ? rows.slice(0, size) : rows
  const items = await withVariants(pageRows)

  let total = 0
  if (includeTotal) {
    const [countRow] = await db
      .select({ value: count() })
      .from(products)
      .where(and(...conditions))
    total = Number(countRow?.value ?? 0)
  }

  const last = pageRows[pageRows.length - 1]
  const nextCursor =
    hasMore && last ? encodeCatalogCursor(cursorFromRow(normalized.sort, last)) : null

  return { products: items, nextCursor, total }
}

/** Active categories with their product count, independent of the loaded page. */
export async function listCategories(): Promise<CategoryCount[]> {
  const rows = await getDb()
    .select({ name: products.category, value: count() })
    .from(products)
    .where(eq(products.active, true))
    .groupBy(products.category)
    .orderBy(asc(products.category))

  return rows.map((row) => ({ name: row.name, count: Number(row.value) }))
}

/** Hydrates only the products referenced by the local cart. */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const clean = [...new Set(ids)]
    .filter((id) => typeof id === "string" && id.length > 0 && id.length <= 80)
    .slice(0, 100)

  if (clean.length === 0) return []

  const rows = await getDb()
    .select()
    .from(products)
    .where(and(inArray(products.id, clean), eq(products.active, true)))

  return withVariants(rows)
}

/** Lightweight entries for the sitemap; no descriptions or variants. */
export async function listProductSitemapEntries(): Promise<
  Array<{ id: string; updatedAt: string }>
> {
  const rows = await getDb()
    .select({ id: products.id, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.active, true))

  return rows.map((row) => ({ id: row.id, updatedAt: row.updatedAt.toISOString() }))
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

  const base = await withVariants(rows)

  return base.map((product, index) => ({
    ...product,
    active: rows[index].active,
    sortOrder: rows[index].sortOrder,
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

  if (!rows[0]) return null
  const [product] = await withVariants(rows)
  return product ?? null
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
  const db = getDb()
  const size = Math.min(Math.max(Math.trunc(limit) || 4, 1), 12)

  const sameRows = await db
    .select()
    .from(products)
    .where(and(eq(products.active, true), eq(products.category, product.categoria)))
    .orderBy(asc(products.sortOrder), asc(products.createdAt))
    .limit(size + 1)

  const same = (await withVariants(sameRows))
    .filter((item) => item.id !== product.id)
    .slice(0, size)

  if (same.length >= size) return same

  const restRows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.active, true),
        ne(products.category, product.categoria),
        ne(products.id, product.id),
      ),
    )
    .orderBy(asc(products.sortOrder), asc(products.createdAt))
    .limit(size - same.length)

  return [...same, ...(await withVariants(restRows))]
}

export async function listOrders(
  status?: OrderStatus,
  query = "",
): Promise<AdminOrder[]> {
  const db = getDb()
  const filters = []
  const term = query.trim()

  if (status) filters.push(eq(orders.status, status))
  if (term) {
    const matches = [
      ilike(orders.customerName, `%${term}%`),
      ilike(orders.customerPhone, `%${term}%`),
      ilike(orders.customerAddress, `%${term}%`),
    ]
    const number = Number(term)
    if (/^\d+$/.test(term) && Number.isSafeInteger(number) && number > 0) {
      matches.push(eq(orders.number, number))
    }
    filters.push(or(...matches))
  }

  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      customerAddress: orders.customerAddress,
      paymentMethod: orders.paymentMethod,
      notes: orders.notes,
      subtotalCents: orders.subtotalCents,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      pushSentAt: orders.pushSentAt,
      pushSuccessCount: orders.pushSuccessCount,
      pushFailureCount: orders.pushFailureCount,
      pushError: orders.pushError,
      createdAt: orders.createdAt,
      itemCount: sql<number>`count(${orderItems.id})::int`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(filters.length > 0 ? and(...filters) : undefined)
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt))

  return rows.map((row) => ({
    ...row,
    subtotal: row.subtotalCents / 100,
  }))
}

export async function getOrder(id: string): Promise<AdminOrderDetail | null> {
  const db = getDb()
  const [row] = await db
    .select({
      id: orders.id,
      number: orders.number,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      customerAddress: orders.customerAddress,
      paymentMethod: orders.paymentMethod,
      notes: orders.notes,
      subtotalCents: orders.subtotalCents,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      pushSentAt: orders.pushSentAt,
      pushSuccessCount: orders.pushSuccessCount,
      pushFailureCount: orders.pushFailureCount,
      pushError: orders.pushError,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1)

  if (!row) return null

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      variantLabel: orderItems.variantLabel,
      unitPriceCents: orderItems.unitPriceCents,
      quantity: orderItems.quantity,
      lineTotalCents: orderItems.lineTotalCents,
      linkedProductId: products.id,
      productImage: products.image,
      productImages: products.images,
    })
    .from(orderItems)
    .leftJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.id))

  return {
    ...row,
    subtotal: row.subtotalCents / 100,
    itemCount: items.length,
    items: items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      variantLabel: item.variantLabel,
      unitPrice: item.unitPriceCents / 100,
      quantity: item.quantity,
      lineTotal: item.lineTotalCents / 100,
      image: item.productImages?.[0] ?? item.productImage ?? "",
      productExists: item.linkedProductId !== null,
    })),
  }
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const db = getDb()

  const [orderTotals] = await db
    .select({
      pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pendiente')::int`,
      confirmedOrders: sql<number>`count(*) filter (where ${orders.status} = 'confirmado')::int`,
      pendingPayments: sql<number>`count(*) filter (where ${orders.paymentStatus} = 'pendiente' and ${orders.status} <> 'cancelado')::int`,
      totalSalesCents: sql<string>`coalesce(sum(${orders.subtotalCents}) filter (where ${orders.status} <> 'cancelado'), 0)::bigint`,
    })
    .from(orders)

  const [productTotals] = await db
    .select({
      activeProducts: sql<number>`count(*) filter (where ${products.active})::int`,
      lowStockProducts: sql<number>`count(*) filter (where ${products.active} and not ${products.madeToOrder} and ${products.stock} between 1 and 3)::int`,
    })
    .from(products)

  return {
    pendingOrders: orderTotals.pendingOrders,
    confirmedOrders: orderTotals.confirmedOrders,
    pendingPayments: orderTotals.pendingPayments,
    lowStockProducts: productTotals.lowStockProducts,
    activeProducts: productTotals.activeProducts,
    totalSales: Number(orderTotals.totalSalesCents) / 100,
  }
}

export async function listAdminUsers(): Promise<AdminUserSummary[]> {
  return getDb()
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      role: adminUsers.role,
      createdAt: adminUsers.createdAt,
    })
    .from(adminUsers)
    .orderBy(asc(adminUsers.createdAt))
}

export async function countOwners(): Promise<number> {
  const db = getDb()
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(adminUsers)
    .where(eq(adminUsers.role, "owner"))

  return row?.count ?? 0
}

export async function listPushTokens(): Promise<string[]> {
  const rows = await getDb()
    .select({ token: adminPushTokens.token })
    .from(adminPushTokens)

  return rows.map((row) => row.token)
}

export async function listPushTokensForUser(userId: string): Promise<string[]> {
  const rows = await getDb()
    .select({ token: adminPushTokens.token })
    .from(adminPushTokens)
    .where(eq(adminPushTokens.userId, userId))

  return rows.map((row) => row.token)
}

export async function registerPushToken(userId: string, token: string): Promise<void> {
  await getDb()
    .insert(adminPushTokens)
    .values({ userId, token })
    .onConflictDoUpdate({
      target: adminPushTokens.token,
      set: { userId, updatedAt: new Date() },
    })
}

export async function deletePushToken(userId: string, token: string): Promise<void> {
  await getDb()
    .delete(adminPushTokens)
    .where(and(eq(adminPushTokens.userId, userId), eq(adminPushTokens.token, token)))
}

export async function deletePushTokens(tokens: string[]): Promise<void> {
  if (tokens.length === 0) return

  await getDb().delete(adminPushTokens).where(inArray(adminPushTokens.token, tokens))
}

export async function listAdminUserIds(): Promise<string[]> {
  const rows = await getDb().select({ id: adminUsers.id }).from(adminUsers)
  return rows.map((row) => row.id)
}

export async function createAdminNotifications(
  rows: Array<{
    userId: string
    orderId: string
    title: string
    body: string
    url: string
  }>,
): Promise<void> {
  if (rows.length === 0) return

  await getDb().insert(adminNotifications).values(rows)
}

export async function listAdminNotifications(
  userId: string,
  limit = 20,
): Promise<AdminNotification[]> {
  const rows = await getDb()
    .select({
      id: adminNotifications.id,
      title: adminNotifications.title,
      body: adminNotifications.body,
      url: adminNotifications.url,
      readAt: adminNotifications.readAt,
      createdAt: adminNotifications.createdAt,
    })
    .from(adminNotifications)
    .where(eq(adminNotifications.userId, userId))
    .orderBy(desc(adminNotifications.createdAt))
    .limit(limit)

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    url: row.url,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  }))
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(adminNotifications)
    .where(and(eq(adminNotifications.userId, userId), isNull(adminNotifications.readAt)))

  return row?.count ?? 0
}

export async function markNotificationsRead(
  userId: string,
  ids: string[],
): Promise<void> {
  if (ids.length === 0) return

  await getDb()
    .update(adminNotifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(adminNotifications.userId, userId),
        inArray(adminNotifications.id, ids),
        isNull(adminNotifications.readAt),
      ),
    )
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await getDb()
    .update(adminNotifications)
    .set({ readAt: new Date() })
    .where(and(eq(adminNotifications.userId, userId), isNull(adminNotifications.readAt)))
}

export async function updateOrderPushResult(
  id: string,
  result: {
    sentAt: Date | null
    successCount: number
    failureCount: number
    error: string | null
  },
): Promise<void> {
  await getDb()
    .update(orders)
    .set({
      pushSentAt: result.sentAt,
      pushSuccessCount: result.successCount,
      pushFailureCount: result.failureCount,
      pushError: result.error,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
}
