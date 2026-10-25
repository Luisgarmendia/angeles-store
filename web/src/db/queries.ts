import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm"
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

  return withVariants(rows)
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
  const all = await listProducts()
  const others = all.filter((item) => item.id !== product.id)
  const same = others.filter((item) => item.categoria === product.categoria)
  const rest = others.filter((item) => item.categoria !== product.categoria)
  return [...same, ...rest].slice(0, limit)
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
