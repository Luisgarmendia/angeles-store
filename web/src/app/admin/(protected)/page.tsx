import Link from "next/link"
import { getAdminSummary, listOrders } from "@/db/queries"
import { requireAdmin } from "@/lib/auth"
import { formatPrice } from "@/lib/format"
import { orderStatusLabel } from "@/lib/orders"
import { canManageStore, canManageUsers, roleLabel } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await requireAdmin()
  const { error } = await searchParams
  const [summary, orders] = await Promise.all([getAdminSummary(), listOrders()])
  const recentOrders = orders.slice(0, 5)
  const formatter = new Intl.DateTimeFormat("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  })

  const quickLinks = [
    {
      href: "/admin/productos",
      label: "Productos",
      description: "Catálogo, precios, fotos y stock.",
    },
    {
      href: "/admin/pedidos",
      label: "Pedidos",
      description: "Ventas, pagos y entregas.",
    },
    ...(canManageStore(session.role)
      ? [
          {
            href: "/admin/tienda",
            label: "Tienda",
            description: "Portada, contacto y métodos de pago.",
          },
        ]
      : []),
    ...(canManageUsers(session.role)
      ? [
          {
            href: "/admin/usuarios",
            label: "Usuarios",
            description: "Equipo y permisos del panel.",
          },
        ]
      : []),
  ]

  return (
    <div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Panel</p>
        <h2 className="font-display text-3xl text-ink">Resumen</h2>
        <p className="mt-1 text-sm text-muted">
          {session.email} · {roleLabel(session.role)}
        </p>
      </div>

      {error === "forbidden" && (
        <p className="mt-4 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
          No tenés permiso para entrar a esa sección. Tu rol es {roleLabel(session.role)}.
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/pedidos?status=pendiente"
          className="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-ink/30"
        >
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
            Pedidos pendientes
          </p>
          <p className="mt-1 font-display text-2xl text-ink">{summary.pendingOrders}</p>
        </Link>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Pagos pendientes</p>
          <p className="mt-1 font-display text-2xl text-ink">{summary.pendingPayments}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Bajo stock</p>
          <p className="mt-1 font-display text-2xl text-ink">{summary.lowStockProducts}</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Ventas totales</p>
          <p className="mt-1 font-display text-2xl text-ink">{formatPrice(summary.totalSales)}</p>
        </div>
      </div>

      <section className="mt-8">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Accesos</p>
        <h3 className="font-display text-2xl text-ink">¿Qué querés hacer?</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-ink/30 hover:bg-white"
            >
              <p className="font-display text-lg text-ink">{link.label}</p>
              <p className="mt-0.5 text-sm text-muted">{link.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Ventas</p>
            <h3 className="font-display text-2xl text-ink">Pedidos recientes</h3>
          </div>
          <Link
            href="/admin/pedidos"
            className="shrink-0 text-sm text-muted transition-colors hover:text-ink"
          >
            Ver todos →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-ink/15 px-6 py-10 text-center">
            <p className="font-display text-xl text-ink">Todavía no hay pedidos</p>
            <p className="mt-1 text-sm text-muted">
              Los pedidos aparecen acá cuando un cliente completa el checkout.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex flex-col gap-2 rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-ink/25 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg text-ink">#{order.number}</span>
                    <span className="rounded-full bg-sand px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink">
                      {orderStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-ink">{order.customerName}</p>
                  <p className="text-xs text-muted">
                    {formatter.format(order.createdAt)} · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "producto" : "productos"}
                  </p>
                </div>

                <p className="font-display text-xl text-ink">{formatPrice(order.subtotal)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
