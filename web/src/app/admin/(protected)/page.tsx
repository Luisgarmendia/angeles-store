import Link from "next/link"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { formatPrice } from "@/lib/format"
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

      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>

      {products.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink">No hay productos para mostrar</p>
          <p className="mt-2 text-sm text-muted">
            Creá el primero o cambiá el término de búsqueda.
          </p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3 sm:gap-4"
            >
              <div className="h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-sand">
                {product.imagen ? (
                  <img
                    src={product.imagen}
                    alt=""
                    className="h-full w-full object-cover"
                  />
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
                  {!product.active && <span className="ml-2 text-wine">· Oculto</span>}
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
          ))}
        </div>
      )}
    </div>
  )
}
