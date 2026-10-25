"use client"

import { deleteProductAction } from "@/app/admin/actions"

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-muted transition-colors hover:border-wine hover:text-wine"
      >
        Eliminar
      </button>
    </form>
  )
}
