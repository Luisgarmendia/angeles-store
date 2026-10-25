import { useEffect, useState } from "react"
import { formatPrice } from "../lib/format"
import { productHash } from "../lib/route"
import type { Product } from "../types"
import { CheckIcon, PlusIcon } from "./Icons"
import { ProductImage } from "./ProductImage"

interface ProductCardProps {
  product: Product
  onAdd: (productId: string) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const detailHref = productHash(product.id)

  useEffect(() => {
    if (!added) return
    const timeout = window.setTimeout(() => setAdded(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [added])

  function handleAdd() {
    onAdd(product.id)
    setAdded(true)
  }

  return (
    <article className="group flex flex-col transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        <ProductImage
          src={product.imagen}
          alt={product.nombre}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <a
          href={detailHref}
          aria-label={`Ver detalle de ${product.nombre}`}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose"
        />
        <button
          type="button"
          onClick={handleAdd}
          className={`absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] backdrop-blur transition-colors ${
            added ? "bg-rose-dark text-cream" : "bg-ink/90 text-cream hover:bg-wine"
          }`}
        >
          {added ? <CheckIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
          {added ? "Agregado" : "Agregar"}
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.categoria}</p>
          <h3 className="mt-1 font-display text-lg leading-tight text-ink">
            <a href={detailHref} className="transition-colors hover:text-wine">
              {product.nombre}
            </a>
          </h3>
        </div>
        <p className="whitespace-nowrap pt-1 text-sm font-medium text-ink">
          {formatPrice(product.precio)}
        </p>
      </div>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{product.descripcion}</p>
    </article>
  )
}
