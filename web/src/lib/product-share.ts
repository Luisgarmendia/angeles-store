import { formatPrice } from "./format"
import type { Product } from "./types"

/** Title used by WhatsApp and other link previews. */
export function productShareTitle(product: Product): string {
  return `${product.nombre} — ${formatPrice(product.precio)}`
}

/** Preview description: category plus the product description, trimmed to a safe length. */
export function productShareDescription(product: Product, maxLength = 160): string {
  const text = `${product.categoria} · ${product.descripcion}`

  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trimEnd()}…`
}
