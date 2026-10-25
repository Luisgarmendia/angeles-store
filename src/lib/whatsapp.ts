import type { CartLine, Customer, PaymentMethod } from "../types"
import { formatPrice } from "./format"

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
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

export function buildOrderMessage({ brandName, customer, lines, total }: OrderInput): string {
  const rows: Array<string | null> = [
    `🛒 *NUEVO PEDIDO — ${brandName.toUpperCase()}*`,
    "",
    `👤 *Cliente:* ${customer.nombre.trim()}`,
    customer.telefono.trim() ? `📞 *Teléfono:* ${customer.telefono.trim()}` : null,
    `📍 *Dirección:* ${customer.direccion.trim()}`,
    `💳 *Método de Pago:* ${paymentLabel(customer.pago)}`,
    customer.notas.trim() ? `📝 *Notas:* ${customer.notas.trim()}` : null,
    "",
    "📦 *DETALLE DEL PEDIDO:*",
    ...lines.map(
      (line, index) =>
        `${index + 1}. *${line.product.nombre}* x${line.quantity} - ${formatPrice(
          line.product.precio * line.quantity,
        )}`,
    ),
    "",
    `💰 *TOTAL A PAGAR:* *${formatPrice(total)}*`,
  ]

  return rows.filter((row): row is string => row !== null).join("\n")
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
