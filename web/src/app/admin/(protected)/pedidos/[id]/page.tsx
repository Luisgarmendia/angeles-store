import Link from "next/link"
import { notFound } from "next/navigation"
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/app/admin/actions"
import { getOrder } from "@/db/queries"
import { AdminStatusToast } from "@/components/admin/admin-status-toast"
import { formatPrice } from "@/lib/format"
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/orders"
import { paymentLabel } from "@/lib/payments"
import type { OrderPaymentStatus, PaymentMethod } from "@/lib/types"
import { Select } from "@/components/Select"

export const dynamic = "force-dynamic"

const PAYMENT_STATUS_STYLES: Record<OrderPaymentStatus, string> = {
  pendiente: "bg-sand text-ink",
  pagado: "bg-ink text-cream",
  reembolsado: "bg-wine/10 text-wine",
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; ok?: string }>
}) {
  const { id } = await params
  const { error, ok } = await searchParams
  const order = await getOrder(id)

  if (!order) notFound()

  const formatter = new Intl.DateTimeFormat("es-HN", {
    dateStyle: "long",
    timeStyle: "short",
  })
  const phoneDigits = order.customerPhone.replace(/\D/g, "")
  const whatsappHref =
    phoneDigits.length > 0
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
          `Hola ${order.customerName}, te escribimos por tu pedido #${order.number} de Angeles Store's.`,
        )}`
      : null

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/pedidos" className="text-sm text-muted transition-colors hover:text-ink">
        ← Volver a pedidos
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Pedido</p>
          <h2 className="font-display text-3xl text-ink">#{order.number}</h2>
          <p className="mt-1 text-sm text-muted">{formatter.format(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="w-fit rounded-full bg-sand px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-ink">
            {orderStatusLabel(order.status)}
          </span>
          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.12em] ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
          >
            {paymentStatusLabel(order.paymentStatus)}
          </span>
        </div>
      </div>

      {error === "reopen" && (
        <p className="mt-4 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
          Un pedido cancelado no se puede reabrir. Si necesitás corregirlo, creá uno nuevo.
        </p>
      )}

      <AdminStatusToast ok={ok} />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
          <h3 className="font-display text-xl text-ink">Cliente</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Nombre</dt>
              <dd className="text-ink">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Teléfono</dt>
              <dd className="text-ink">{order.customerPhone || "No indicado"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Entrega</dt>
              <dd className="text-ink">{order.customerAddress}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Pago</dt>
              <dd className="text-ink">
                {paymentLabel(order.paymentMethod as PaymentMethod)}
              </dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted">Notas</dt>
                <dd className="whitespace-pre-wrap text-ink">{order.notes}</dd>
              </div>
            )}
          </dl>

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-ink/20 px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-sand"
            >
              Escribir por WhatsApp
            </a>
          )}
        </section>

        <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
          <h3 className="font-display text-xl text-ink">Estado</h3>
          <p className="mt-1 text-sm text-muted">
            Actualizá el estado para saber en qué va cada pedido.
          </p>
          <form action={updateOrderStatusAction} className="mt-4 space-y-2">
            <input type="hidden" name="id" value={order.id} />
            <Select
              name="status"
              defaultValue={order.status}
              aria-label="Estado del pedido"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
            <button
              type="submit"
              className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
            >
              Guardar estado
            </button>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Cancelar un pedido devuelve el stock de sus productos.
          </p>

          <form
            action={updatePaymentStatusAction}
            className="mt-5 space-y-2 border-t border-ink/10 pt-4"
          >
            <input type="hidden" name="id" value={order.id} />
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Estado del pago</p>
            <Select
              name="paymentStatus"
              defaultValue={order.paymentStatus}
              aria-label="Estado del pago"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
            <button
              type="submit"
              className="w-full rounded-xl border border-ink/20 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-sand"
            >
              Guardar pago
            </button>
          </form>
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h3 className="font-display text-xl text-ink">Productos</h3>
        <ul className="mt-3 divide-y divide-ink/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              {item.productExists ? (
                <Link
                  href={`/admin/productos/${item.productId}`}
                  className="block h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand"
                  aria-label={`Editar ${item.productName}`}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.14em] text-muted">
                      Sin foto
                    </span>
                  )}
                </Link>
              ) : (
                <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl bg-sand text-[9px] uppercase tracking-[0.14em] text-muted">
                  Sin foto
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {item.productExists ? (
                    <Link
                      href={`/admin/productos/${item.productId}`}
                      className="text-sm text-ink transition-colors hover:text-wine"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <span className="text-sm text-ink">{item.productName}</span>
                  )}
                  {item.variantLabel && (
                    <span className="text-xs text-muted">({item.variantLabel})</span>
                  )}
                  {!item.productExists && (
                    <span className="rounded-full bg-wine/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-wine">
                      Eliminado
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
                {item.productExists && (
                  <Link
                    href={`/producto/${item.productId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[11px] text-muted underline underline-offset-2 transition-colors hover:text-ink"
                  >
                    Ver en la tienda
                  </Link>
                )}
              </div>

              <p className="whitespace-nowrap text-sm font-medium text-ink">
                {formatPrice(item.lineTotal)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3">
          <span className="text-sm text-muted">Total productos</span>
          <span className="font-display text-2xl text-ink">{formatPrice(order.subtotal)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          El envío se coordina por WhatsApp y puede tener un costo extra.
        </p>
      </section>
    </div>
  )
}
