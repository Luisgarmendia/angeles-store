import Link from "next/link"
import { AdminProductsView } from "@/components/admin/admin-products-view"
import { listAdminProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const products = await listAdminProducts(q)

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Catálogo</p>
          <h2 className="font-display text-3xl text-ink">Productos</h2>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
        >
          Nuevo producto
        </Link>
      </div>

      <form method="get" className="mt-5 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, categoría o descripción…"
          className="w-full rounded-full border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full border border-ink/20 px-5 py-2.5 text-sm transition-colors hover:border-ink hover:bg-sand"
        >
          Buscar
        </button>
      </form>

      <AdminProductsView products={products} />
    </div>
  )
}
