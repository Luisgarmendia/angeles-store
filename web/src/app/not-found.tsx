import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Angeles Store&apos;s</p>
      <h1 className="font-display text-4xl text-ink">No encontramos esa página</h1>
      <p className="text-sm leading-relaxed text-muted">
        Puede que el producto ya no esté disponible. Vuelve al catálogo para ver lo que sí hay.
      </p>
      <Link
        href="/#catalogo"
        className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-wine"
      >
        Ver el catálogo
      </Link>
    </main>
  )
}
