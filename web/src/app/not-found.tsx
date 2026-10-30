import Link from "next/link"

export const metadata = {
  title: "Página no encontrada",
}

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Error 404</p>
      <h1 className="mt-3 font-display text-5xl text-ink">No encontramos esa página</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
        Puede que el enlace haya cambiado o que el producto ya no esté disponible.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-ink px-6 py-3 text-sm text-cream transition-colors hover:bg-wine"
        >
          Volver al inicio
        </Link>
        <Link
          href="/categorias"
          className="rounded-full border border-ink px-6 py-3 text-sm text-ink transition-colors hover:bg-ink hover:text-cream"
        >
          Ver categorías
        </Link>
      </div>
    </main>
  )
}
