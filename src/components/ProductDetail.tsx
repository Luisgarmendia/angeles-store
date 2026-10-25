import { useEffect, useState } from "react"
import { config } from "../config"
import { formatPrice } from "../lib/format"
import type { Product } from "../types"
import {
  ArrowLeftIcon,
  CheckIcon,
  MessageIcon,
  MinusIcon,
  PlusIcon,
  TruckIcon,
  WalletIcon,
} from "./Icons"
import { ProductCard } from "./ProductCard"
import { ProductImage } from "./ProductImage"

interface ProductDetailProps {
  product: Product
  recommended: Product[]
  onAdd: (productId: string, quantity?: number) => void
}

export function ProductDetail({ product, recommended, onAdd }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const timeout = window.setTimeout(() => setAdded(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [added])

  function handleAdd() {
    onAdd(product.id, quantity)
    setAdded(true)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <a
        href="#catalogo"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver al catálogo
      </a>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-[2rem] bg-sand">
          <ProductImage
            src={product.imagen}
            alt={product.nombre}
            className="aspect-[4/5] h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.24em] text-rose-dark">
            {product.categoria}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.nombre}
          </h1>
          <p className="mt-4 font-display text-3xl text-wine">{formatPrice(product.precio)}</p>
          <p className="mt-4 text-base leading-relaxed text-muted">{product.descripcion}</p>

          <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between gap-1 rounded-full border border-ink/15 px-2 py-1 sm:justify-start">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="rounded-full p-2 text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Restar una unidad"
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(99, current + 1))}
                className="rounded-full p-2 text-ink transition-colors hover:bg-sand"
                aria-label="Sumar una unidad"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-cream transition-colors ${
                added ? "bg-rose-dark" : "bg-ink hover:bg-wine"
              }`}
            >
              {added ? <CheckIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
              {added ? "Agregado al carrito" : "Agregar al carrito"}
            </button>
          </div>

          <ul className="mt-6 grid gap-3 border-t border-ink/10 pt-6 text-sm text-muted">
            <li className="flex items-start gap-2">
              <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-dark" />
              {config.shipping.note}
            </li>
            <li className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 shrink-0 text-rose-dark" />
              Pago contra entrega o transferencia.
            </li>
            <li className="flex items-center gap-2">
              <MessageIcon className="h-4 w-4 shrink-0 text-rose-dark" />
              Coordinamos tu pedido por WhatsApp.
            </li>
          </ul>
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-16 border-t border-ink/10 pt-10">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
            Para completar tu look
          </p>
          <h2 className="mt-1 font-display text-3xl text-ink">También te puede gustar</h2>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {recommended.map((item) => (
              <ProductCard key={item.id} product={item} onAdd={onAdd} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
