"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/format"
import { compareAtPrice, discountPercent } from "@/lib/pricing"
import { isSoldOut } from "@/lib/stock"
import type { Product } from "@/lib/types"
import { CheckIcon, PlusIcon } from "./Icons"
import { ProductImage } from "./ProductImage"
import { useCart } from "./store-provider"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  const detailHref = `/producto/${product.id}`
  const soldOut = isSoldOut(product)
  const hasVariants = product.variants.length > 0
  const discount = discountPercent(product)
  const previousPrice = compareAtPrice(product)

  useEffect(() => {
    if (!added) return
    const timeout = window.setTimeout(() => setAdded(false), 1500)
    return () => window.clearTimeout(timeout)
  }, [added])

  function handleAdd() {
    if (soldOut) return
    add(product.id, null)
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
        <Link
          href={detailHref}
          aria-label={`Ver detalle de ${product.nombre}`}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose"
        />

        {discount !== null && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-wine px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-cream">
            -{discount}%
          </span>
        )}

        <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
          {product.porEncargo && (
            <span className="rounded-full bg-rose-dark px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
              Por encargo
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
              Agotado
            </span>
          )}
        </div>

        {hasVariants ? (
          <Link
            href={detailHref}
            className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 rounded-full bg-ink/90 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-cream backdrop-blur transition-colors hover:bg-wine"
          >
            Elegir opción
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={`absolute inset-x-3 bottom-3 z-10 flex items-center justify-center gap-2 rounded-full py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] backdrop-blur transition-colors ${
              soldOut
                ? "cursor-not-allowed bg-ink/50 text-cream/80"
                : added
                  ? "bg-rose-dark text-cream"
                  : "bg-ink/90 text-cream hover:bg-wine"
            }`}
          >
            {soldOut ? null : added ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              <PlusIcon className="h-3.5 w-3.5" />
            )}
            {soldOut ? "Agotado" : added ? "Agregado" : "Agregar"}
          </button>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{product.categoria}</p>
          <h3 className="mt-1 font-display text-lg leading-tight text-ink">
            <Link href={detailHref} className="transition-colors hover:text-wine">
              {product.nombre}
            </Link>
          </h3>
        </div>
        <div className="whitespace-nowrap pt-1 text-right">
          {previousPrice !== null && (
            <p className="text-[11px] text-muted line-through">{formatPrice(previousPrice)}</p>
          )}
          <p className={`text-sm font-medium ${discount !== null ? "text-wine" : "text-ink"}`}>
            {formatPrice(product.precio)}
          </p>
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{product.descripcion}</p>
    </article>
  )
}
