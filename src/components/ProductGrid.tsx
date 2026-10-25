import type { Product } from "../types"
import { SearchIcon } from "./Icons"
import { ProductCard } from "./ProductCard"

interface ProductGridProps {
  products: Product[]
  onAdd: (productId: string) => void
  onClearFilters: () => void
}

export function ProductGrid({ products, onAdd, onClearFilters }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-6 py-16 text-center">
        <SearchIcon className="h-8 w-8 text-rose" />
        <p className="font-display text-2xl text-ink">No encontramos nada así</p>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Prueba con otra palabra o revisa otra categoría. Seguro hay algo que te va a encantar.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-2 rounded-full border border-ink px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-cream"
        >
          Ver todo el catálogo
        </button>
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
