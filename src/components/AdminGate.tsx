import { useState, type FormEvent, type ReactNode } from "react"
import { config } from "../config"
import {
  hasAdminPin,
  isAdminUnlocked,
  isValidPin,
  saveAdminPin,
  unlockAdmin,
  verifyAdminPin,
} from "../lib/adminAuth"
import { LockIcon } from "./Icons"

interface AdminGateProps {
  onExit: () => void
  children: ReactNode
}

export function AdminGate({ onExit, children }: AdminGateProps) {
  const [pinExists, setPinExists] = useState(() => hasAdminPin())
  const [unlocked, setUnlocked] = useState(() => hasAdminPin() && isAdminUnlocked())
  const [pin, setPin] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (pinExists && unlocked) return <>{children}</>

  function sanitize(value: string): string {
    return value.replace(/\D/g, "").slice(0, 8)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(null)

    if (!pinExists) {
      if (!isValidPin(pin)) {
        setError("La clave debe tener entre 4 y 8 dígitos.")
        return
      }
      if (pin !== confirmation) {
        setError("Las claves no coinciden.")
        return
      }

      setBusy(true)
      const saved = await saveAdminPin(pin)
      setBusy(false)

      if (!saved) {
        setError("No se pudo guardar la clave en este navegador.")
        return
      }

      unlockAdmin()
      setPinExists(true)
      setUnlocked(true)
      return
    }

    setBusy(true)
    const valid = await verifyAdminPin(pin)
    setBusy(false)

    if (!valid) {
      setError("Clave incorrecta. Intenta de nuevo.")
      setPin("")
      return
    }

    unlockAdmin()
    setUnlocked(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border border-ink/10 bg-white/70 p-6 shadow-xl shadow-ink/5">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-wine">
              <LockIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                {config.brand.name} · Administración
              </p>
              <h1 className="font-display text-2xl text-ink">
                {pinExists ? "Panel protegido" : "Protege tu panel"}
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            {pinExists
              ? "Escribe tu clave de administrador para entrar."
              : "Crea una clave de 4 a 8 dígitos. Se guarda solo en este dispositivo. Anótala: no se puede recuperar desde la tienda."}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-center text-[10px] uppercase tracking-[0.2em] text-muted">
                {pinExists ? "Clave" : "Nueva clave"}
              </span>
              <input
                type="password"
                inputMode="numeric"
                autoComplete={pinExists ? "current-password" : "new-password"}
                value={pin}
                onChange={(event) => setPin(sanitize(event.target.value))}
                maxLength={8}
                className={pinInputClass}
                aria-label="Clave de administrador"
                autoFocus
              />
            </label>

            {!pinExists && (
              <label className="block">
                <span className="mb-1.5 block text-center text-[10px] uppercase tracking-[0.2em] text-muted">
                  Repite la clave
                </span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={confirmation}
                  onChange={(event) => setConfirmation(sanitize(event.target.value))}
                  maxLength={8}
                  className={pinInputClass}
                  aria-label="Repite la clave de administrador"
                />
              </label>
            )}

            {error && (
              <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-ink py-3 text-sm font-medium text-cream transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Verificando…" : pinExists ? "Entrar al panel" : "Crear clave y entrar"}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-4 w-full text-center text-sm text-muted transition-colors hover:text-ink"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  )
}

const pinInputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-center text-lg tracking-[0.4em] text-ink outline-none transition-colors placeholder:text-muted/50 focus:border-rose focus:ring-2 focus:ring-rose/20"
