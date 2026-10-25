import type { Product } from "./types"

type PricedProduct = Pick<Product, "precio" | "precioAnterior">

/** Whole-percentage discount shown on cards and detail pages. */
export function discountPercent(product: PricedProduct): number | null {
  if (product.precioAnterior === null) return null
  if (product.precio <= 0 || product.precioAnterior <= product.precio) return null

  const percent = Math.round((1 - product.precio / product.precioAnterior) * 100)
  return percent > 0 ? percent : null
}

export function isDiscounted(product: PricedProduct): boolean {
  return discountPercent(product) !== null
}

/**
 * Previous price for the price being displayed. Variants can override the
 * product price; the compare-at price only applies to the base price so the
 * storefront never invents a previous price for an option.
 */
export function compareAtPrice(product: PricedProduct, price = product.precio): number | null {
  if (discountPercent(product) === null) return null
  return price === product.precio ? product.precioAnterior : null
}
