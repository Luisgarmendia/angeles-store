"use client"

import { useActionState, useEffect, useRef } from "react"
import {
  createAdminUserAction,
  type UserFormState,
} from "@/app/admin/usuarios/actions"
import { ADMIN_ROLE_OPTIONS } from "@/lib/roles"
import { Select } from "@/components/Select"

const initialState: UserFormState = {}

export function AdminUserForm() {
  const [state, formAction, pending] = useActionState(createAdminUserAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) formRef.current?.reset()
  }, [state.ok])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="off"
            required
            className={inputClass}
            placeholder="dependienta@angelesstore.local"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
            Contraseña
          </span>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={12}
            className={inputClass}
            placeholder="Mínimo 12 caracteres"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">Rol</span>
        <Select name="role" defaultValue="staff" aria-label="Rol del nuevo usuario">
          {ADMIN_ROLE_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </label>

      {state.error && (
        <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
          {state.error}
        </p>
      )}

      {state.ok && (
        <p className="rounded-xl bg-sand px-4 py-3 text-sm text-ink" role="status">
          {state.ok}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  )
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"
