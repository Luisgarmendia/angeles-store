"use server"

import { revalidatePath } from "next/cache"
import { createOrderInDb, OrderError } from "@/lib/orders-server"
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
  number?: number
  lines?: CartLine[]
  total?: number
}

function clean(value: string | undefined, maxLength: number): string {
  return (value ?? "").trim().slice(0, maxLength)
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
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { error: "Tu carrito está vacío." }
  }
  if (input.items.length > 50) {
    return { error: "El pedido tiene demasiadas líneas." }
  }

  try {
    const result = await createOrderInDb({ customer, items: input.items })
    revalidatePath("/admin/pedidos")
    return result
  } catch (error) {
    if (error instanceof OrderError) {
      return { error: error.message }
    }
    console.error("Order creation failed", error)
    return { error: "No se pudo registrar el pedido. Intentá de nuevo." }
  }
}
