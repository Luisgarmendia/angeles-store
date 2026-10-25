"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, desc, eq, isNotNull, sql } from "drizzle-orm"
import { getDb } from "@/db"
import { orderItems, orders, productVariants, products, settings } from "@/db/schema"
import { destroySession, requireAdmin, requireOwner } from "@/lib/auth"
import { PAYMENT_OPTIONS, isPaymentMethod } from "@/lib/payments"
import { normalizeHonduranPhone } from "@/lib/phone"
import { isOrderStatus, isPaymentStatus } from "@/lib/orders"
import type { OrderPaymentStatus, OrderStatus, StoreSettings } from "@/lib/types"

export interface FormState {
  error?: string
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function parsePriceToCents(value: string): number | null {
  const cleaned = value.replace(/[^\d.,]/g, "").trim()
  if (!cleaned) return null

  const lastComma = cleaned.lastIndexOf(",")
  const lastDot = cleaned.lastIndexOf(".")
  let normalized = cleaned

  if (lastComma > -1 && lastDot > -1) {
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "")
  } else if (lastComma > -1) {
    const decimals = cleaned.length - lastComma - 1
    normalized = decimals === 3 ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".")
  }

  const amount = Number(normalized)
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) return null

  return Math.round(amount * 100)
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

interface VariantInput {
  id?: string
  label: string
  stock: number
  priceCents: number | null
  image: string | null
}

const MAX_GALLERY_IMAGES = 8

function parseImages(raw: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length > MAX_GALLERY_IMAGES) return null

    const urls: string[] = []
    for (const entry of parsed) {
      if (typeof entry !== "string") return null
      const url = entry.trim()
      if (!url || !isHttpUrl(url) || urls.includes(url)) return null
      urls.push(url)
    }

    return urls
  } catch {
    return null
  }
}

function parseVariantInputs(raw: string): VariantInput[] | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length > 50) return null

    const labels = new Set<string>()
    const variants: VariantInput[] = []

    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") return null
      const record = entry as Record<string, unknown>
      const label = typeof record.label === "string" ? record.label.trim() : ""
      const stock = Number(record.stock)
      const id = typeof record.id === "string" && record.id.length > 0 ? record.id : undefined

      if (!label || label.length > 80 || labels.has(label)) return null
      if (!Number.isInteger(stock) || stock < 0 || stock > 1_000_000) return null
      labels.add(label)

      let priceCents: number | null = null
      if (record.price !== undefined && record.price !== null && String(record.price).trim() !== "") {
        priceCents = parsePriceToCents(String(record.price))
        if (priceCents === null) return null
      }

      let image: string | null = null
      if (record.image !== undefined && record.image !== null) {
        const rawImage = String(record.image).trim()
        if (rawImage) {
          if (!isHttpUrl(rawImage)) return null
          image = rawImage
        }
      }

      variants.push({ id, label, stock, priceCents, image })
    }

    return variants
  } catch {
    return null
  }
}

export async function logoutAction(): Promise<void> {
  await requireAdmin()
  await destroySession()
  redirect("/admin/login")
}

export async function saveProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()

  const id = text(formData, "id")
  const name = text(formData, "name")
  const category = text(formData, "category")
  const description = text(formData, "description")
  const price = parsePriceToCents(text(formData, "price"))
  const compareAtRaw = text(formData, "compareAtPrice")
  const active = formData.get("active") === "on"
  const madeToOrder = formData.get("madeToOrder") === "on"
  const images = parseImages(text(formData, "images") || "[]")
  const variants = parseVariantInputs(text(formData, "variants") || "[]")
  const stockRaw = text(formData, "stock")
  const image = images?.[0] ?? ""

  if (name.length < 2 || name.length > 120) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." }
  }
  if (category.length < 2 || category.length > 60) {
    return { error: "La categoría debe tener entre 2 y 60 caracteres." }
  }
  if (description.length < 5 || description.length > 1000) {
    return { error: "La descripción debe tener entre 5 y 1000 caracteres." }
  }
  if (price === null) {
    return { error: "Escribe un precio mayor a cero, por ejemplo 1,290.00." }
  }

  const compareAt = compareAtRaw ? parsePriceToCents(compareAtRaw) : null
  if (compareAtRaw && compareAt === null) {
    return { error: "El precio anterior debe ser mayor a cero, por ejemplo 590.00." }
  }
  if (compareAt !== null && compareAt <= price) {
    return { error: "El precio anterior debe ser mayor al precio actual para mostrar el descuento." }
  }

  if (images === null) {
    return {
      error: `Revisá la galería: hasta ${MAX_GALLERY_IMAGES} fotos con URL http(s), sin repetir.`,
    }
  }
  if (variants === null) {
    return { error: "Revisá las opciones: etiqueta y stock son obligatorios y no se pueden repetir." }
  }

  let stock: number | null = null
  if (stockRaw !== "") {
    const parsed = Number(stockRaw)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 1_000_000) {
      return { error: "El stock debe ser un número entero mayor o igual a cero." }
    }
    stock = parsed
  }
  if (variants.length > 0) stock = null
  if (madeToOrder) stock = null

  const db = getDb()

  try {
    await db.transaction(async (tx) => {
      let productId = id

      if (id) {
        const updated = await tx
          .update(products)
          .set({
            name,
            priceCents: price,
            category,
            description,
            image,
            images,
            active,
            stock,
            madeToOrder,
            compareAtPriceCents: compareAt,
            updatedAt: new Date(),
          })
          .where(eq(products.id, id))
          .returning({ id: products.id })

        if (updated.length === 0) throw new Error("Ese producto ya no existe.")
      } else {
        productId = randomUUID()
        const [last] = await tx
          .select({ sortOrder: products.sortOrder })
          .from(products)
          .orderBy(desc(products.sortOrder))
          .limit(1)

        await tx.insert(products).values({
          id: productId,
          name,
          priceCents: price,
          category,
          description,
          image,
          images,
          active,
          stock,
          madeToOrder,
          compareAtPriceCents: compareAt,
          sortOrder: (last?.sortOrder ?? 0) + 1,
        })
      }

      const existingVariants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, productId))
      const submittedIds = new Set(variants.flatMap((variant) => (variant.id ? [variant.id] : [])))

      for (const existing of existingVariants) {
        if (!submittedIds.has(existing.id)) {
          await tx.delete(productVariants).where(eq(productVariants.id, existing.id))
        }
      }

      for (const [index, variant] of variants.entries()) {
        if (variant.id) {
          const belongs = existingVariants.some((item) => item.id === variant.id)
          if (!belongs) throw new Error("Una opción no pertenece a este producto.")
          await tx
            .update(productVariants)
            .set({
              label: variant.label,
              stock: variant.stock,
              priceCents: variant.priceCents,
              image: variant.image,
              sortOrder: index,
            })
            .where(
              and(
                eq(productVariants.id, variant.id),
                eq(productVariants.productId, productId),
              ),
            )
        } else {
          await tx.insert(productVariants).values({
            productId,
            label: variant.label,
            stock: variant.stock,
            priceCents: variant.priceCents,
            image: variant.image,
            sortOrder: index,
          })
        }
      }
    })
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "No se pudo guardar el producto.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/admin/productos")
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = text(formData, "id")
  if (!id) redirect("/admin/productos")

  await getDb().delete(products).where(eq(products.id, id))
  revalidatePath("/", "layout")
  redirect("/admin/productos")
}

export async function saveSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner()

  const storeName = text(formData, "storeName")
  if (storeName.length < 2 || storeName.length > 80) {
    return { error: "El nombre de la tienda debe tener entre 2 y 80 caracteres." }
  }

  const storeAddress = text(formData, "storeAddress")
  if (storeAddress.length > 200) {
    return { error: "La dirección no puede superar 200 caracteres." }
  }

  const storeDescription = text(formData, "storeDescription")
  if (storeDescription.length > 600) {
    return { error: "La descripción no puede superar 600 caracteres." }
  }

  const whatsapp = normalizeHonduranPhone(text(formData, "whatsapp"))
  if (!whatsapp) {
    return { error: "El WhatsApp debe tener 8 dígitos hondureños, por ejemplo 9999-8888." }
  }

  const headline = text(formData, "headline")
  if (!headline) {
    return { error: "Escribe el título principal de la portada." }
  }

  const image = text(formData, "image")
  if (image && !isHttpUrl(image)) {
    return { error: "La foto de portada debe ser una URL http(s) o quedar vacía." }
  }

  const selected = new Set(formData.getAll("payments").filter(isPaymentMethod))
  const payments = PAYMENT_OPTIONS.filter((option) => selected.has(option.id)).map(
    (option) => option.id,
  )
  if (payments.length === 0) {
    return { error: "Deja al menos un método de pago activo." }
  }

  const data: StoreSettings = {
    store: {
      name: storeName,
      address: storeAddress,
      description: storeDescription,
    },
    whatsapp,
    instagram: text(formData, "instagram"),
    facebook: text(formData, "facebook"),
    tiktok: text(formData, "tiktok"),
    payments,
    hero: {
      tagline: text(formData, "tagline"),
      headline,
      accent: text(formData, "accent"),
      description: text(formData, "description"),
      ctaLabel: text(formData, "ctaLabel"),
      secondaryLabel: text(formData, "secondaryLabel"),
      trust: [text(formData, "trust0"), text(formData, "trust1"), text(formData, "trust2")],
      image,
      imageAlt: text(formData, "imageAlt"),
    },
  }

  const db = getDb()
  await db
    .insert(settings)
    .values({ id: 1, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.id,
      set: { data, updatedAt: new Date() },
    })

  revalidatePath("/", "layout")
  redirect("/admin/tienda?ok=1")
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = text(formData, "id")
  const statusValue = text(formData, "status")

  if (!id || !isOrderStatus(statusValue)) redirect("/admin/pedidos")

  const status: OrderStatus = statusValue
  const db = getDb()
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1)

  if (!order) redirect("/admin/pedidos")
  if (order.status === "cancelado" && status !== "cancelado") {
    redirect(`/admin/pedidos/${id}?error=reopen`)
  }

  await db.transaction(async (tx) => {
    if (status === "cancelado" && order.status !== "cancelado") {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id))

      for (const item of items) {
        if (item.variantId) {
          await tx
            .update(productVariants)
            .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
            .where(eq(productVariants.id, item.variantId))
        } else {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${item.quantity}` })
            .where(and(eq(products.id, item.productId), isNotNull(products.stock)))
        }
      }
    }

    await tx
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
  })

  revalidatePath("/admin/pedidos")
  redirect(`/admin/pedidos/${id}?ok=status`)
}

export async function updatePaymentStatusAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = text(formData, "id")
  const paymentStatusValue = text(formData, "paymentStatus")

  if (!id || !isPaymentStatus(paymentStatusValue)) redirect("/admin/pedidos")

  const paymentStatus: OrderPaymentStatus = paymentStatusValue
  const updated = await getDb()
    .update(orders)
    .set({ paymentStatus, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning({ id: orders.id })

  if (updated.length === 0) redirect("/admin/pedidos")

  revalidatePath("/admin")
  revalidatePath("/admin/pedidos")
  redirect(`/admin/pedidos/${id}?ok=payment`)
}
