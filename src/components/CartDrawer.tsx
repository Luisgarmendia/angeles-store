import { config } from "../config"
import { formatPrice } from "../lib/format"
import { useModalBehavior } from "../lib/useModal"
import type { CartLine } from "../types"
import { ArrowRightIcon, BagIcon, MinusIcon, PlusIcon, TrashIcon, XIcon } from "./Icons"

interface CartDrawerProps {
  open: boolean
  lines: CartLine[]
  total: number
  onClose: () => void
  onQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onCheckout: () => void
}

export function CartDrawer({
  open,
  lines,
  total,
  onClose,
  onQuantity,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  useModalBehavior(open, onClose)

  if (!open) return null

  const itemCount = lines.reduce((count, line) => count + line.quantity, 0)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar carrito"
      />

      <aside
        className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Tu selección</p>
            <h2 className="font-display text-2xl text-ink">
              Carrito {itemCount > 0 && <span className="text-muted">({itemCount})</span>}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Cerrar carrito"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <BagIcon className="h-10 w-10 text-rose" />
            <p className="font-display text-2xl text-ink">Tu carrito está vacío</p>
            <p className="text-sm leading-relaxed text-muted">
              Agrega tus favoritos y coordinamos la entrega por WhatsApp.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-full border border-ink px-6 py-2.5 text-sm transition-colors hover:bg-ink hover:text-cream"
            >
              Explorar el catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-ink/10">
                {lines.map((line) => (
                  <li key={line.product.id} className="flex gap-4 py-4">
                    <img
                      src={line.product.imagen}
                      alt={line.product.nombre}
                      className="h-24 w-20 shrink-0 rounded-xl bg-sand object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                            {line.product.categoria}
                          </p>
                          <h3 className="truncate font-display text-lg leading-tight text-ink">
                            {line.product.nombre}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(line.product.id)}
                          className="rounded-full p-1.5 text-muted transition-colors hover:bg-sand hover:text-wine"
                          aria-label={`Quitar ${line.product.nombre}`}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                        <div className="flex items-center gap-1 rounded-full border border-ink/15">
                          <button
                            type="button"
                            onClick={() => onQuantity(line.product.id, line.quantity - 1)}
                            className="rounded-full p-1.5 text-ink transition-colors hover:bg-sand"
                            aria-label={`Restar una unidad de ${line.product.nombre}`}
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-medium">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onQuantity(line.product.id, line.quantity + 1)}
                            className="rounded-full p-1.5 text-ink transition-colors hover:bg-sand"
                            aria-label={`Sumar una unidad de ${line.product.nombre}`}
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-ink">
                          {formatPrice(line.product.precio * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-ink/10 px-5 py-5">
              <div className="flex items-center justify-between text-sm text-muted">
                <span>Total del pedido</span>
                <span className="font-display text-3xl text-ink">{formatPrice(total)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>Envío</span>
                <span>Se coordina por WhatsApp</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{config.shipping.note}</p>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
              >
                Continuar con el pedido
                <ArrowRightIcon className="h-4 w-4" />
              </button>
              <p className="mt-3 text-center text-[11px] text-muted">
                Pedido a {config.brand.name} · respuesta por WhatsApp
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
