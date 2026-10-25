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

export interface OrderInput {
  brandName: string
  customer: Customer
  lines: CartLine[]
  total: number
}

/**
 * Builds the WhatsApp message with plain text and WhatsApp markdown only.
 * Emojis were removed because they render as empty boxes on some devices.
 */
export function buildOrderMessage({ brandName, customer, lines, total }: OrderInput): string {
  const rows: Array<string | null> = [
    `*NUEVO PEDIDO · ${brandName.toUpperCase()}*`,
    "",
    `*Cliente:* ${customer.nombre.trim()}`,
    customer.telefono.trim() ? `*Teléfono:* ${customer.telefono.trim()}` : null,
    `*Entrega:* ${customer.direccion.trim()}`,
    `*Pago:* ${paymentLabel(customer.pago)}`,
    customer.notas.trim() ? `*Notas:* ${customer.notas.trim()}` : null,
    "",
    "*DETALLE DEL PEDIDO*",
    ...lines.map(
      (line, index) =>
        `${index + 1}. *${line.product.nombre}* x${line.quantity} — ${formatPrice(
          line.product.precio * line.quantity,
        )}`,
    ),
    "",
    `*TOTAL PRODUCTOS:* *${formatPrice(total)}*`,
    "",
    "*Envío:* se coordina por WhatsApp y puede tener un costo extra.",
    "",
    "¡Gracias por tu compra!",
  ]

  return rows.filter((row): row is string => row !== null).join("\n")
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
