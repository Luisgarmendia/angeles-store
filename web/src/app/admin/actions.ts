"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { desc, eq } from "drizzle-orm"
import { getDb } from "@/db"
import { products, settings } from "@/db/schema"
import { destroySession, requireAdmin } from "@/lib/auth"
import { PAYMENT_OPTIONS, isPaymentMethod } from "@/lib/payments"
import { normalizeHonduranPhone } from "@/lib/phone"
import type { StoreSettings } from "@/lib/types"

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
  const image = text(formData, "image")
  const price = parsePriceToCents(text(formData, "price"))
  const active = formData.get("active") === "on"

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
  if (image && !isHttpUrl(image)) {
    return { error: "La imagen debe ser una URL http(s) o quedar vacía." }
  }

  const db = getDb()

  if (id) {
    const updated = await db
      .update(products)
      .set({
        name,
        priceCents: price,
        category,
        description,
        image,
        active,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning({ id: products.id })

    if (updated.length === 0) return { error: "Ese producto ya no existe." }
  } else {
    const [last] = await db
      .select({ sortOrder: products.sortOrder })
      .from(products)
      .orderBy(desc(products.sortOrder))
      .limit(1)

    await db.insert(products).values({
      id: randomUUID(),
      name,
      priceCents: price,
      category,
      description,
      image,
      active,
      sortOrder: (last?.sortOrder ?? 0) + 1,
    })
  }

  revalidatePath("/", "layout")
  redirect("/admin")
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin()

  const id = text(formData, "id")
  if (!id) redirect("/admin")

  await getDb().delete(products).where(eq(products.id, id))
  revalidatePath("/", "layout")
  redirect("/admin")
}

export async function saveSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin()

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
  redirect("/admin/ajustes?ok=1")
}
