import type { CartItem, CartLine, Product } from "./types"

/** Adds units of a product, merging into the existing line when present. */
export function addToCart(cart: CartItem[], productId: string, quantity = 1): CartItem[] {
  const amount = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1
  const existing = cart.find((item) => item.productId === productId)
  if (existing) {
    return cart.map((item) =>
      item.productId === productId ? { ...item, quantity: item.quantity + amount } : item,
    )
  }
  return [...cart, { productId, quantity: amount }]
}

export function removeFromCart(cart: CartItem[], productId: string): CartItem[] {
  return cart.filter((item) => item.productId !== productId)
}

export function setQuantity(cart: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return removeFromCart(cart, productId)
  return cart.map((item) => (item.productId === productId ? { ...item, quantity } : item))
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.quantity, 0)
}

export function cartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return product ? [{ product, quantity: item.quantity }] : []
  })
}

export function cartTotal(cart: CartItem[], products: Product[]): number {
  return cartLines(cart, products).reduce(
    (total, line) => total + line.product.precio * line.quantity,
    0,
  )
}
