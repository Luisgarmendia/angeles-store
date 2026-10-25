"use client"

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-wine"
    >
      Guardar / imprimir
    </button>
  )
}
