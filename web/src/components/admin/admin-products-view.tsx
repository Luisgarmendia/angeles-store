"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GridIcon, ListIcon } from "@/components/Icons"
import { DeleteProductButton } from "./delete-product-button"
import { formatPrice } from "@/lib/format"
import { discountPercent } from "@/lib/pricing"
import { productStock } from "@/lib/stock"
import type { AdminProduct } from "@/lib/types"

const STORAGE_KEY = "angeles.admin.products.view"

type View = "cards" | "list"

export function AdminProductsView({ products }: { products: AdminProduct[] }) {
  const [view, setView] = useState<View>("cards")

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "cards" || stored === "list") setView(stored)
    } catch {
      // Private mode: keep the default view.
    }
  }, [])

  function changeView(next: View) {
    setView(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // The view still changes for this render.
    }
  }

  return (
    <div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {products.length} {products.length === 1 ? "producto" : "productos"}
        </p>

        <div
          className="flex w-fit gap-1 rounded-full bg-sand p-1"
          role="group"
          aria-label="Vista de productos"
        >
          <button
            type="button"
            onClick={() => changeView("cards")}
            aria-pressed={view === "cards"}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
              view === "cards" ? "bg-ink text-cream" : "text-muted hover:text-ink"
            }`}
          >
            <GridIcon className="h-3.5 w-3.5" />
            Tarjetas
          </button>
          <button
            type="button"
            onClick={() => changeView("list")}
            aria-pressed={view === "list"}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
              view === "list" ? "bg-ink text-cream" : "text-muted hover:text-ink"
            }`}
          >
            <ListIcon className="h-3.5 w-3.5" />
            Lista
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink">No hay productos para mostrar</p>
          <p className="mt-2 text-sm text-muted">
            Creá el primero o cambiá el término de búsqueda.
          </p>
        </div>
      ) : view === "cards" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const stock = productStock(product)
            const soldOut = stock !== null && stock <= 0
            const discount = discountPercent(product)

            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white/60 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] bg-sand">
                  {product.imagen ? (
                    <img
                      src={product.imagen}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-muted">
                      Sin foto
                    </div>
                  )}
                  <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
                    {!product.active && (
                      <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
                        Oculto
                      </span>
                    )}
                    {discount !== null && (
                      <span className="rounded-full bg-wine px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
                    {product.porEncargo && (
                      <span className="rounded-full bg-ink/85 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
                        Por encargo
                      </span>
                    )}
                    {soldOut && (
                      <span className="rounded-full bg-wine/90 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    {product.categoria}
                  </p>
                  <h3 className="mt-0.5 font-display text-lg leading-tight text-ink">
                    {product.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    {formatPrice(product.precio)}
                    {product.precioAnterior !== null && (
                      <span className="ml-1 text-xs line-through">
                        {formatPrice(product.precioAnterior)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {product.porEncargo
                      ? "Por encargo"
                      : stock === null
                        ? "Stock ilimitado"
                        : stock <= 0
                          ? "Sin stock"
                          : `Stock: ${stock}`}
                    {product.variants.length > 0
                      ? ` · ${product.variants.length} ${
                          product.variants.length === 1 ? "opción" : "opciones"
                        }`
                      : ""}
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-3">
                    <Link
                      href={`/admin/productos/${product.id}`}
                      className="flex-1 rounded-full border border-ink/15 px-3 py-1.5 text-center text-xs text-ink transition-colors hover:border-ink hover:bg-sand"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton id={product.id} name={product.nombre} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {products.map((product) => {
            const stock = productStock(product)
            const discount = discountPercent(product)

            return (
              <article
                key={product.id}
                className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3 sm:gap-4"
              >
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {product.imagen ? (
                    <img src={product.imagen} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.14em] text-muted">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    {product.categoria}
                  </p>
                  <h3 className="truncate font-display text-lg leading-tight text-ink">
                    {product.nombre}
                  </h3>
                  <p className="text-sm text-muted">
                    {formatPrice(product.precio)}
                    {product.precioAnterior !== null && (
                      <span className="ml-1 text-xs line-through">
                        {formatPrice(product.precioAnterior)}
                      </span>
                    )}
                    {discount !== null && <span className="ml-2 text-wine">-{discount}%</span>}
                    {!product.active && <span className="ml-2 text-wine">· Oculto</span>}
                    <span className="ml-2 text-xs">
                      {product.porEncargo
                        ? "· Por encargo"
                        : stock === null
                          ? "· Stock ilimitado"
                          : stock <= 0
                            ? "· Agotado"
                            : `· Stock: ${stock}`}
                    </span>
                    {product.variants.length > 0 && (
                      <span className="ml-1 text-xs">
                        · {product.variants.length}{" "}
                        {product.variants.length === 1 ? "opción" : "opciones"}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/productos/${product.id}`}
                    className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink transition-colors hover:border-ink hover:bg-sand"
                  >
                    Editar
                  </Link>
                  <DeleteProductButton id={product.id} name={product.nombre} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
