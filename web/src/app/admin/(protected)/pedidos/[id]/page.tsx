import Link from "next/link"
import { notFound } from "next/navigation"
import { updateOrderStatusAction } from "@/app/admin/actions"
import { getOrder } from "@/db/queries"
import { formatPrice } from "@/lib/format"
import { ORDER_STATUS_OPTIONS, orderStatusLabel } from "@/lib/orders"
import { paymentLabel } from "@/lib/payments"
import type { PaymentMethod } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
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
        <span className="w-fit rounded-full bg-sand px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-ink">
          {orderStatusLabel(order.status)}
        </span>
      </div>

      {error === "reopen" && (
        <p className="mt-4 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
          Un pedido cancelado no se puede reabrir. Si necesitás corregirlo, creá uno nuevo.
        </p>
      )}

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
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
            >
              {ORDER_STATUS_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
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
        </section>
      </div>

      <section className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h3 className="font-display text-xl text-ink">Productos</h3>
        <ul className="mt-3 divide-y divide-ink/10">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink">
                  {item.productName}
                  {item.variantLabel ? ` (${item.variantLabel})` : ""}
                </p>
                <p className="text-xs text-muted">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
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
