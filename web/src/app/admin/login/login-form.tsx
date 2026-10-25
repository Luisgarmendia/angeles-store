"use client"

import { useActionState } from "react"
import Link from "next/link"
import { LockIcon } from "@/components/Icons"
import { loginAction, type LoginState } from "./actions"

const initialState: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <div className="w-full max-w-sm">
      <form
        action={formAction}
        className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-xl shadow-ink/5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-wine">
            <LockIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
              Angeles Store&apos;s · Administración
            </p>
            <h1 className="font-display text-2xl text-ink">Entrar al panel</h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">
          Acceso privado para administrar el catálogo y los ajustes de la tienda.
        </p>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              className={inputClass}
              placeholder="admin@angelesstore.local"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className={inputClass}
              placeholder="••••••••"
            />
          </label>
        </div>

        {state.error && (
          <p className="mt-4 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-full bg-ink py-3 text-sm font-medium text-cream transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Entrando…" : "Entrar al panel"}
        </button>
      </form>

      <Link
        href="/"
        className="mt-4 block text-center text-sm text-muted transition-colors hover:text-ink"
      >
        Volver a la tienda
      </Link>
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-rose focus:ring-2 focus:ring-rose/20"
