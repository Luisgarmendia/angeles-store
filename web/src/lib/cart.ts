import type { CartItem, CartLine, Product } from "./types"

export function lineKey(productId: string, variantId: string | null = null): string {
  return `${productId}:${variantId ?? ""}`
}

function sameLine(item: CartItem, productId: string, variantId: string | null): boolean {
  return item.productId === productId && (item.variantId ?? null) === variantId
}

/** Adds units of a product (and optional variant), merging into the same line. */
export function addToCart(
  cart: CartItem[],
  productId: string,
  variantId: string | null = null,
  quantity = 1,
): CartItem[] {
  const amount = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1
  const existing = cart.find((item) => sameLine(item, productId, variantId))

  if (existing) {
    return cart.map((item) =>
      sameLine(item, productId, variantId)
        ? { ...item, quantity: item.quantity + amount }
        : item,
    )
  }

  return [...cart, { productId, variantId, quantity: amount }]
}

export function removeFromCart(
  cart: CartItem[],
  productId: string,
  variantId: string | null = null,
): CartItem[] {
  return cart.filter((item) => !sameLine(item, productId, variantId))
}

export function setQuantity(
  cart: CartItem[],
  productId: string,
  variantId: string | null,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return removeFromCart(cart, productId, variantId)
  return cart.map((item) =>
    sameLine(item, productId, variantId) ? { ...item, quantity } : item,
  )
}

/**
 * Keeps a cart line within the purchasable limit. `null` means no cap, so the
 * cart is returned untouched; a cap of 0 removes the line.
 */
export function capLineQuantity(
  cart: CartItem[],
  productId: string,
  variantId: string | null,
  max: number | null,
): CartItem[] {
  if (max === null) return cart
  if (max <= 0) return removeFromCart(cart, productId, variantId)

  return cart.map((item) =>
    sameLine(item, productId, variantId) && item.quantity > max
      ? { ...item, quantity: Math.min(item.quantity, max) }
      : item,
  )
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0)
}

export function cartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    if (!product) return []

    const variantId = item.variantId ?? null
    if (product.variants.length > 0 && !variantId) return []

    const variant = variantId
      ? product.variants.find((candidate) => candidate.id === variantId)
      : null
    if (variantId && !variant) return []

    return [
      {
        product,
        variantId,
        variantLabel: variant?.label ?? null,
        unitPrice: variant?.precio ?? product.precio,
        quantity: item.quantity,
      },
    ]
  })
}

export function cartTotal(cart: CartItem[], products: Product[]): number {
  return cartLines(cart, products).reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0,
  )
}
