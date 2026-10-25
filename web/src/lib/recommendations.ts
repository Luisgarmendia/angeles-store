import type { Product } from "./types"

/**
 * Recommends products for a detail page: same category first, then the rest of
 * the catalog, never the product being viewed.
 */
export function recommendProducts(
  products: Product[],
  productId: string,
  limit = 4,
): Product[] {
  const current = products.find((product) => product.id === productId)
  if (!current || limit <= 0) return []

  const others = products.filter((product) => product.id !== productId)
  const sameCategory = others.filter((product) => product.categoria === current.categoria)
  const rest = others.filter((product) => product.categoria !== current.categoria)

  return [...sameCategory, ...rest].slice(0, limit)
}
