import type { Product } from "../types"
import { ProductCard } from "./ProductCard"

interface ProductGridProps {
  products: Product[]
  onAdd: (productId: string) => void
}

export function ProductGrid({ products, onAdd }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center">
        <p className="font-display text-2xl text-ink">No encontramos prendas</p>
        <p className="mt-2 text-sm text-muted">
          Probá con otra búsqueda o quitá el filtro de categoría.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  )
}
