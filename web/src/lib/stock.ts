import type { Product } from "./types"

/** Stock available for a product or one of its variants. `null` means unlimited. */
export function availableStock(product: Product, variantId: string | null = null): number | null {
  if (product.porEncargo) return null

  if (variantId) {
    const variant = product.variants.find((item) => item.id === variantId)
    return variant ? variant.stock : 0
  }

  return product.stock
}

/**
 * Units a customer may buy for a product or variant. `null` means there is no
 * cap (unlimited stock or made to order); a sold-out item caps at 0.
 */
export function maxPurchasable(product: Product, variantId: string | null = null): number | null {
  const stock = availableStock(product, variantId)
  return stock === null ? null : Math.max(0, stock)
}

/** Total stock shown for the product: sum of variants, or the simple stock. */
export function productStock(product: Product): number | null {
  if (product.porEncargo) return null

  if (product.variants.length > 0) {
    return product.variants.reduce((total, variant) => total + variant.stock, 0)
  }

  return product.stock
}

export function isSoldOut(product: Product): boolean {
  const stock = productStock(product)
  return stock !== null && stock <= 0
}
