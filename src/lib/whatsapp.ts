import type { CartLine, Customer, PaymentMethod } from "../types"
import { formatPrice } from "./format"

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  contraentrega: "Pago contra entrega",
  transferencia: "Transferencia bancaria",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
}

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_LABELS[method]
}

/**
 * Only emoji from Unicode 6.0 (2010) and older. Newer characters such as
 * 🛍️ (2014) or 🧾 (2018) render as empty boxes on some devices.
 */
export const ORDER_EMOJI = {
  order: "📦",
  customer: "👤",
  phone: "📱",
  address: "📍",
  payment: "💳",
  notes: "📝",
  detail: "📋",
  total: "💰",
  shipping: "🚚",
  thanks: "🌷",
} as const

export interface OrderInput {
  brandName: string
  customer: Customer
  lines: CartLine[]
  total: number
}

/**
 * Builds the WhatsApp message with WhatsApp markdown and a conservative emoji
 * set so every device renders it.
 */
export function buildOrderMessage({ brandName, customer, lines, total }: OrderInput): string {
  const rows: Array<string | null> = [
    `${ORDER_EMOJI.order} *NUEVO PEDIDO · ${brandName.toUpperCase()}*`,
    "",
    `${ORDER_EMOJI.customer} *Cliente:* ${customer.nombre.trim()}`,
    customer.telefono.trim()
      ? `${ORDER_EMOJI.phone} *Teléfono:* ${customer.telefono.trim()}`
      : null,
    `${ORDER_EMOJI.address} *Entrega:* ${customer.direccion.trim()}`,
    `${ORDER_EMOJI.payment} *Pago:* ${paymentLabel(customer.pago)}`,
    customer.notas.trim() ? `${ORDER_EMOJI.notes} *Notas:* ${customer.notas.trim()}` : null,
    "",
    `${ORDER_EMOJI.detail} *DETALLE DEL PEDIDO*`,
    ...lines.map(
      (line, index) =>
        `${index + 1}. *${line.product.nombre}* x${line.quantity} — ${formatPrice(
          line.product.precio * line.quantity,
        )}`,
    ),
    "",
    `${ORDER_EMOJI.total} *TOTAL PRODUCTOS:* *${formatPrice(total)}*`,
    "",
    `${ORDER_EMOJI.shipping} *Envío:* se coordina por WhatsApp y puede tener un costo extra.`,
    "",
    `${ORDER_EMOJI.thanks} ¡Gracias por tu compra!`,
  ]

  return rows.filter((row): row is string => row !== null).join("\n")
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
