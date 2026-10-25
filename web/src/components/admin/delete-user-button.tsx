"use client"

import { deleteAdminUserAction } from "@/app/admin/usuarios/actions"

export function DeleteUserButton({
  id,
  email,
  disabled = false,
}: {
  id: string
  email: string
  disabled?: boolean
}) {
  return (
    <form
      action={deleteAdminUserAction}
      onSubmit={(event) => {
        if (!window.confirm(`¿Eliminar a ${email}? También se cerrarán sus sesiones.`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={disabled}
        title={disabled ? "No podés eliminar al último dueño." : undefined}
        className="w-full rounded-full border border-ink/15 px-4 py-2 text-sm text-muted transition-colors hover:border-wine hover:text-wine disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink/15 disabled:hover:text-muted sm:w-auto"
      >
        Eliminar
      </button>
    </form>
  )
}
