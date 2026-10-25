"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createOrderInDb, OrderError } from "@/lib/orders-server"
import { normalizeHonduranPhone } from "@/lib/phone"
import { canCreateOrder, recordOrder } from "@/lib/rate-limit"
import type { CartLine, Customer } from "@/lib/types"

export interface CreateOrderItemInput {
  productId: string
  variantId: string | null
  quantity: number
}

export interface CreateOrderInput {
  customer: Customer
  items: CreateOrderItemInput[]
}

export interface CreateOrderResult {
  error?: string
  id?: string
  number?: number
  lines?: CartLine[]
  total?: number
}

const PHONE_ERROR = "Escribe un teléfono hondureño válido, por ejemplo 9999-8888."
const ORDER_LIMIT_ERROR =
  "Recibimos demasiados pedidos desde tu conexión. Esperá una hora e intentá de nuevo."

function clean(value: string | undefined, maxLength: number): string {
  return (value ?? "").trim().slice(0, maxLength)
}

/** First forwarded hop, then the proxy header; "unknown" when neither is set. */
function clientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || "unknown"
}

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderResult> {
  const customer: Customer = {
    nombre: clean(input.customer.nombre, 120),
    direccion: clean(input.customer.direccion, 300),
    telefono: clean(input.customer.telefono, 30),
    pago: input.customer.pago,
    notas: clean(input.customer.notas, 500),
  }

  if (customer.nombre.length < 2) {
    return { error: "Escribe tu nombre completo." }
  }
  if (customer.direccion.length < 5) {
    return { error: "Escribe una dirección de entrega válida." }
  }

  const telefono = normalizeHonduranPhone(customer.telefono)
  if (!telefono) {
    return { error: PHONE_ERROR }
  }
  customer.telefono = telefono

  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: "Tu carrito está vacío." }
  }
  if (input.items.length > 50) {
    return { error: "El pedido tiene demasiadas líneas." }
  }

  const orderKey = `order:${clientIp(await headers())}`
  if (!canCreateOrder(orderKey)) {
    return { error: ORDER_LIMIT_ERROR }
  }

  try {
    const result = await createOrderInDb({ customer, items: input.items })
    recordOrder(orderKey)
    revalidatePath("/admin/pedidos")

    void import("@/lib/push")
      .then(({ sendOrderPushNotification }) =>
        sendOrderPushNotification({
          orderId: result.id,
          orderNumber: result.number,
          customerName: customer.nombre,
          itemCount: result.lines.reduce((total, line) => total + line.quantity, 0),
          total: result.total,
        }),
      )
      .catch(console.error)

    return result
  } catch (error) {
    if (error instanceof OrderError) {
      return { error: error.message }
    }
    console.error("Order creation failed", error)
    return { error: "No se pudo registrar el pedido. Intentá de nuevo." }
  }
}
