import Link from "next/link"
import { listOrders } from "@/db/queries"
import { formatPrice } from "@/lib/format"
import {
  ORDER_STATUS_OPTIONS,
  isOrderStatus,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/orders"
import type { OrderPaymentStatus, OrderStatus } from "@/lib/types"

export const dynamic = "force-dynamic"

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendiente: "bg-sand text-ink",
  confirmado: "bg-rose/20 text-wine",
  enviado: "bg-ink/10 text-ink",
  entregado: "bg-ink text-cream",
  cancelado: "bg-wine/10 text-wine",
}

const PAYMENT_STATUS_STYLES: Record<OrderPaymentStatus, string> = {
  pendiente: "bg-sand text-ink",
  pagado: "bg-ink text-cream",
  reembolsado: "bg-wine/10 text-wine",
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q = "" } = await searchParams
  const active = status && isOrderStatus(status) ? status : undefined
  const orders = await listOrders(active, q)
  const formatter = new Intl.DateTimeFormat("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  return (
    <div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Ventas</p>
        <h2 className="font-display text-3xl text-ink">Pedidos</h2>
      </div>

      <form method="get" className="mt-5 flex gap-2">
        {active && <input type="hidden" name="status" value={active} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número, cliente, teléfono o dirección…"
          className="w-full rounded-full border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full border border-ink/20 px-5 py-2.5 text-sm transition-colors hover:border-ink hover:bg-sand"
        >
          Buscar
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full border px-4 py-2 text-xs transition-colors ${
            !active
              ? "border-ink bg-ink text-cream"
              : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
          }`}
        >
          Todos
        </Link>
        {ORDER_STATUS_OPTIONS.map((option) => (
          <Link
            key={option.id}
            href={`/admin/pedidos?status=${option.id}`}
            className={`rounded-full border px-4 py-2 text-xs transition-colors ${
              active === option.id
                ? "border-ink bg-ink text-cream"
                : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">
        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
      </p>

      {orders.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink">
            {q.trim() ? "No encontramos pedidos" : "Todavía no hay pedidos"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {q.trim()
              ? "Probá con otro número, nombre, teléfono o dirección."
              : "Los pedidos aparecen acá cuando un cliente completa el checkout."}
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/admin/pedidos/${order.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-ink/25 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg text-ink">#{order.number}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${STATUS_STYLES[order.status]}`}
                  >
                    {orderStatusLabel(order.status)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] ${PAYMENT_STATUS_STYLES[order.paymentStatus]}`}
                  >
                    {paymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-ink">{order.customerName}</p>
                <p className="text-xs text-muted">
                  {formatter.format(order.createdAt)} · {order.itemCount}{" "}
                  {order.itemCount === 1 ? "producto" : "productos"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <p className="font-display text-xl text-ink">{formatPrice(order.subtotal)}</p>
                <p className="text-xs text-muted">Ver detalle →</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
