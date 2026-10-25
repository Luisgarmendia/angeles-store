"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { config } from "@/lib/config"
import { formatPrice } from "@/lib/format"
import { galleryImages } from "@/lib/gallery"
import type { Product } from "@/lib/types"
import {
  ArrowLeftIcon,
  CheckIcon,
  MessageIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
  TruckIcon,
  WalletIcon,
} from "./Icons"
import { ProductCard } from "./ProductCard"
import { ProductGallery } from "./ProductGallery"
import { Select } from "./Select"
import { useCart } from "./store-provider"
import { useStoreSettings } from "./store-settings-provider"

interface ProductDetailProps {
  product: Product
  recommended: Product[]
}

export function ProductDetail({ product, recommended }: ProductDetailProps) {
  const { add } = useCart()
  const { store } = useStoreSettings()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    const firstAvailable = product.variants.find((variant) => variant.stock > 0)
    return (firstAvailable ?? product.variants[0])?.id ?? ""
  })

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? null
  const unitPrice = selectedVariant?.precio ?? product.precio
  const available =
    product.variants.length > 0 ? (selectedVariant?.stock ?? 0) : product.stock
  const soldOut = available !== null && available <= 0
  const maxQuantity = available === null ? 99 : Math.max(1, Math.min(99, available))
  const images = galleryImages(product, selectedVariant)

  useEffect(() => {
    if (!added) return
    const timeout = window.setTimeout(() => setAdded(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [added])

  useEffect(() => {
    setQuantity(1)
    setAdded(false)
  }, [selectedVariantId])

  function handleAdd() {
    if (soldOut) return
    add(product.id, selectedVariant?.id ?? null, quantity)
    setAdded(true)
  }

  async function handleShare() {
    const url = `${window.location.origin}/producto/${product.id}`
    const text = `${product.nombre} — ${formatPrice(unitPrice)} · ${store.name}`

    if (navigator.share) {
      try {
        await navigator.share({ title: product.nombre, text, url })
      } catch {
        // The user cancelled the share sheet.
      }
      return
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <Link
        href="/#catalogo"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery key={selectedVariantId} images={images} alt={product.nombre} />

        <div className="flex flex-col">
          <p className="text-[10px] uppercase tracking-[0.24em] text-rose-dark">
            {product.categoria}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-ink sm:text-5xl">
            {product.nombre}
          </h1>
          <p className="mt-4 font-display text-3xl text-wine">{formatPrice(unitPrice)}</p>
          <p className="mt-4 text-base leading-relaxed text-muted">{product.descripcion}</p>

          {product.variants.length > 0 && (
            <div className="mt-5">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
                Opción
              </span>
              <Select
                value={selectedVariantId}
                onChange={(event) => setSelectedVariantId(event.target.value)}
                aria-label="Elegir opción del producto"
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
                    {variant.label}
                    {variant.stock <= 0 ? " (agotado)" : ""}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {available !== null && (
            <p className={`mt-2 text-xs ${soldOut ? "text-wine" : "text-muted"}`}>
              {soldOut ? "Agotado por el momento" : `Disponible: ${available}`}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-4 border-t border-ink/10 pt-6 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between gap-1 rounded-full border border-ink/15 px-2 py-1 sm:justify-start">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="rounded-full p-2 text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Restar una unidad"
                disabled={quantity <= 1 || soldOut}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(maxQuantity, current + 1))
                }
                className="rounded-full p-2 text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Sumar una unidad"
                disabled={soldOut || quantity >= maxQuantity}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-cream transition-colors ${
                soldOut
                  ? "cursor-not-allowed bg-ink/40"
                  : added
                    ? "bg-rose-dark"
                    : "bg-ink hover:bg-wine"
              }`}
            >
              {soldOut ? null : added ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <PlusIcon className="h-4 w-4" />
              )}
              {soldOut ? "Agotado" : added ? "Agregado al carrito" : "Agregar al carrito"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink transition-colors hover:border-ink hover:bg-sand"
            >
              <ShareIcon className="h-4 w-4" />
              Compartir
            </button>
            <span className="text-xs text-muted">
              Se comparte con foto, precio y descripción.
            </span>
          </div>

          <ul className="mt-6 grid gap-3 border-t border-ink/10 pt-6 text-sm text-muted">
            <li className="flex items-start gap-2">
              <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-dark" />
              {config.shipping.note}
            </li>
            <li className="flex items-center gap-2">
              <WalletIcon className="h-4 w-4 shrink-0 text-rose-dark" />
              Elige el método de pago al coordinar tu pedido.
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
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
