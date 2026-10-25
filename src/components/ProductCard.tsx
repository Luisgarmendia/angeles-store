import { useState } from "react"
import { config } from "../config"
import { formatPrice } from "../lib/format"
import type { Product } from "../types"
import { PlusIcon } from "./Icons"

interface ProductCardProps {
  product: Product
  onAdd: (productId: string) => void
}

function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand text-muted">
        <span className="font-display text-2xl tracking-[0.2em]">
          {config.brand.name.toUpperCase()}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em]">Sin imagen</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  )
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sand">
        <ProductImage src={product.imagen} alt={product.nombre} />
        <button
          type="button"
          onClick={() => onAdd(product.id)}
          className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-full bg-ink/90 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-cream backdrop-blur transition-colors hover:bg-wine"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.categoria}</p>
          <h3 className="mt-1 font-display text-lg leading-tight text-ink">{product.nombre}</h3>
        </div>
        <p className="whitespace-nowrap pt-1 text-sm font-medium text-ink">
          {formatPrice(product.precio)}
        </p>
      </div>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{product.descripcion}</p>
    </article>
  )
}
