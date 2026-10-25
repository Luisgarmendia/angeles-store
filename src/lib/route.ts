const PRODUCT_PREFIX = "#producto/"

/** Reads the product id from a `#producto/{id}` hash. Returns null for any other route. */
export function productIdFromHash(hash: string): string | null {
  if (!hash.startsWith(PRODUCT_PREFIX)) return null
  const raw = hash.slice(PRODUCT_PREFIX.length).split(/[/?#&]/)[0].trim()
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

export function productHash(productId: string): string {
  return `${PRODUCT_PREFIX}${encodeURIComponent(productId)}`
}
