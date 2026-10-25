import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PrintButton } from "@/components/print-button"
import { getOrder, getStoreSettings } from "@/db/queries"
import { config } from "@/lib/config"
import { formatPrice } from "@/lib/format"
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orders"
import { paymentLabel } from "@/lib/payments"
import type { PaymentMethod } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Comprobante de pedido",
  robots: { index: false, follow: false },
}

const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  dateStyle: "long",
  timeStyle: "short",
})

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function OrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!UUID_RE.test(id)) notFound()

  const [order, settings] = await Promise.all([getOrder(id), getStoreSettings()])

  if (!order) notFound()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <article className="receipt-print rounded-3xl border border-ink/10 bg-white/70 p-6 sm:p-8">
        <header className="border-b border-ink/10 pb-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
            {settings.store.name}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">Comprobante de pedido</h1>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-2xl text-ink">{`Pedido #${order.number}`}</p>
            <p className="text-sm text-muted">{dateFormatter.format(order.createdAt)}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-sand px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-ink">
              {orderStatusLabel(order.status)}
            </span>
            <span className="rounded-full border border-ink/15 bg-white/60 px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-ink">
              {paymentStatusLabel(order.paymentStatus)}
            </span>
          </div>
        </header>

        <section className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Cliente</p>
            <p className="mt-1 text-ink">{order.customerName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Teléfono</p>
            <p className="mt-1 text-ink">{order.customerPhone || "No indicado"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Entrega</p>
            <p className="mt-1 text-ink">{order.customerAddress}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Método de pago</p>
            <p className="mt-1 text-ink">
              {paymentLabel(order.paymentMethod as PaymentMethod)}
            </p>
          </div>
          {order.notes && (
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Notas</p>
              <p className="mt-1 whitespace-pre-wrap text-ink">{order.notes}</p>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="font-display text-xl text-ink">Productos</h2>
          <ul className="mt-3 divide-y divide-ink/10">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.14em] text-muted">
                      Sin foto
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
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
            <span className="text-sm text-muted">Total</span>
            <span className="font-display text-2xl text-ink">{formatPrice(order.subtotal)}</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted">{config.shipping.note}</p>
        </section>
      </article>

      <div className="mt-5 flex flex-wrap items-center gap-3 print:hidden">
        <PrintButton />
        <Link
          href="/#catalogo"
          className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-sand"
        >
          Volver a la tienda
        </Link>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted print:hidden">
        Guardá este comprobante o tomá una captura. El link es privado; no lo compartas si no
        querés mostrar los datos de tu pedido.
      </p>
    </div>
  )
}
