import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { orderItems, orders, productVariants, products, settings } from "@/db/schema"
import { ALL_PAYMENT_METHODS, enabledPaymentMethods } from "./payments"
import type { CartLine, Customer, Product } from "./types"

export class OrderError extends Error {}

export interface OrderItemInput {
  productId: string
  variantId: string | null
  quantity: number
}

export interface CreatedOrder {
  number: number
  lines: CartLine[]
  total: number
}

export async function createOrderInDb(input: {
  customer: Customer
  items: OrderItemInput[]
}): Promise<CreatedOrder> {
  const db = getDb()
  const [settingsRow] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  const enabledPayments = settingsRow
    ? enabledPaymentMethods(settingsRow.data.payments)
    : ALL_PAYMENT_METHODS

  if (!enabledPayments.includes(input.customer.pago)) {
    throw new OrderError("Ese método de pago ya no está disponible. Elegí otro.")
  }

  return db.transaction(async (tx) => {
    const draftLines: Array<{
      product: Product
      variantId: string | null
      variantLabel: string | null
      unitPriceCents: number
      quantity: number
    }> = []
    let subtotalCents = 0

    for (const item of input.items) {
      const quantity = Math.floor(item.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new OrderError("Hay una cantidad inválida en tu carrito.")
      }

      const [product] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .for("update")

      if (!product || !product.active) {
        throw new OrderError("Un producto de tu carrito ya no está disponible.")
      }

      const variants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .orderBy(productVariants.sortOrder)

      const variantId = item.variantId ?? null
      let variant: (typeof variants)[number] | null = null

      if (variantId) {
        variant = variants.find((candidate) => candidate.id === variantId) ?? null
        if (!variant) {
          throw new OrderError("Una opción de tu carrito ya no está disponible.")
        }

        if (!product.madeToOrder) {
          if (variant.stock < quantity) {
            throw new OrderError(
              `No hay stock suficiente de ${product.name}${variant.label ? ` (${variant.label})` : ""}.`,
            )
          }

          await tx
            .update(productVariants)
            .set({ stock: variant.stock - quantity })
            .where(eq(productVariants.id, variant.id))
        }
      } else {
        if (variants.length > 0) {
          throw new OrderError(`Elegí una opción para ${product.name}.`)
        }
        if (!product.madeToOrder && product.stock !== null) {
          if (product.stock < quantity) {
            throw new OrderError(`No hay stock suficiente de ${product.name}.`)
          }
          await tx
            .update(products)
            .set({ stock: product.stock - quantity })
            .where(eq(products.id, product.id))
        }
      }

      const unitPriceCents = variant?.priceCents ?? product.priceCents
      const lineTotalCents = unitPriceCents * quantity
      subtotalCents += lineTotalCents

      const productSnapshot: Product = {
        id: product.id,
        nombre: product.name,
        precio: product.priceCents / 100,
        categoria: product.category,
        descripcion: product.description,
        imagen: product.images?.[0] ?? product.image,
        imagenes: product.images?.length ? product.images : product.image ? [product.image] : [],
        stock: product.stock,
        porEncargo: product.madeToOrder,
        precioAnterior:
          product.compareAtPriceCents === null ? null : product.compareAtPriceCents / 100,
        creadoEn: product.createdAt.toISOString(),
        variants: [],
      }

      draftLines.push({
        product: productSnapshot,
        variantId,
        variantLabel: variant?.label ?? null,
        unitPriceCents,
        quantity,
      })
    }

    if (draftLines.length === 0) {
      throw new OrderError("Tu carrito está vacío.")
    }

    const [order] = await tx
      .insert(orders)
      .values({
        customerName: input.customer.nombre,
        customerPhone: input.customer.telefono,
        customerAddress: input.customer.direccion,
        paymentMethod: input.customer.pago,
        notes: input.customer.notas,
        subtotalCents,
        status: "pendiente",
      })
      .returning({ id: orders.id, number: orders.number })

    await tx.insert(orderItems).values(
      draftLines.map((line) => ({
        orderId: order.id,
        productId: line.product.id,
        productName: line.product.nombre,
        variantId: line.variantId,
        variantLabel: line.variantLabel,
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
        lineTotalCents: line.unitPriceCents * line.quantity,
      })),
    )

    return {
      number: order.number,
      total: subtotalCents / 100,
      lines: draftLines.map<CartLine>((line) => ({
        product: line.product,
        variantId: line.variantId,
        variantLabel: line.variantLabel,
        unitPrice: line.unitPriceCents / 100,
        quantity: line.quantity,
      })),
    }
  })
}
