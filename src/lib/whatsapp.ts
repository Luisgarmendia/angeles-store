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
 * Decorative symbols from the Basic Multilingual Plane (3 bytes or less).
 * Four-byte emoji are replaced with `�` on some devices, so the message uses
 * these instead. They still render with personality and without boxes.
 */
export const ORDER_MARKS = {
  order: "★",
  customer: "♥",
  phone: "☎",
  address: "⌂",
  payment: "✔",
  notes: "✎",
  detail: "◇",
  total: "◆",
  shipping: "➜",
  thanks: "✿",
} as const

export interface OrderInput {
  brandName: string
  customer: Customer
  lines: CartLine[]
  total: number
}

/**
 * Builds the WhatsApp message with WhatsApp markdown and basic-plane symbols
 * so every device renders it.
 */
export function buildOrderMessage({ brandName, customer, lines, total }: OrderInput): string {
  const rows: Array<string | null> = [
    `${ORDER_MARKS.order} *NUEVO PEDIDO · ${brandName.toUpperCase()}*`,
    "",
    `${ORDER_MARKS.customer} *Cliente:* ${customer.nombre.trim()}`,
    customer.telefono.trim()
      ? `${ORDER_MARKS.phone} *Teléfono:* ${customer.telefono.trim()}`
      : null,
    `${ORDER_MARKS.address} *Entrega:* ${customer.direccion.trim()}`,
    `${ORDER_MARKS.payment} *Pago:* ${paymentLabel(customer.pago)}`,
    customer.notas.trim() ? `${ORDER_MARKS.notes} *Notas:* ${customer.notas.trim()}` : null,
    "",
    `${ORDER_MARKS.detail} *DETALLE DEL PEDIDO*`,
    ...lines.map(
      (line, index) =>
        `${index + 1}. *${line.product.nombre}* x${line.quantity} — ${formatPrice(
          line.product.precio * line.quantity,
        )}`,
    ),
    "",
    `${ORDER_MARKS.total} *TOTAL PRODUCTOS:* *${formatPrice(total)}*`,
    "",
    `${ORDER_MARKS.shipping} *Envío:* se coordina por WhatsApp y puede tener un costo extra.`,
    "",
    `${ORDER_MARKS.thanks} ¡Gracias por tu compra!`,
  ]

  return rows.filter((row): row is string => row !== null).join("\n")
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
