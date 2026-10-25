import type { Product, ProductVariant } from "./types"

/**
 * Gallery for the detail page: the selected variant photo first, then the
 * shared product gallery, without duplicates.
 */
export function galleryImages(
  product: Product,
  variant: ProductVariant | null,
): string[] {
  const urls = [...(variant?.imagen ? [variant.imagen] : []), ...product.imagenes]
  return urls.filter((url, index) => Boolean(url) && urls.indexOf(url) === index)
}
