import { useState, type FormEvent } from "react"
import { PAYMENT_OPTIONS } from "../lib/payments"
import type { PaymentMethod, StoreSettings } from "../types"

interface PaymentsSettingsProps {
  settings: StoreSettings
  onSave: (settings: StoreSettings) => void
}

export function PaymentsSettings({ settings, onSave }: PaymentsSettingsProps) {
  const [selected, setSelected] = useState<PaymentMethod[]>(settings.payments)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function toggle(method: PaymentMethod) {
    setSelected((current) =>
      current.includes(method) ? current.filter((item) => item !== method) : [...current, method],
    )
    setError(null)
    setSaved(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (selected.length === 0) {
      setError("Deja al menos un método de pago activo.")
      return
    }

    const ordered = PAYMENT_OPTIONS.filter((option) => selected.includes(option.id)).map(
      (option) => option.id,
    )

    setError(null)
    onSave({ ...settings, payments: ordered })
    setSaved(true)
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-white/60 p-5 lg:col-span-2">
      <h2 className="font-display text-xl text-ink">Métodos de pago</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Elige los que querés ofrecer. El cliente solo verá los activos al completar su pedido.
      </p>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {PAYMENT_OPTIONS.map((option) => {
            const active = selected.includes(option.id)

            return (
              <label
                key={option.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                  active
                    ? "border-ink bg-sand text-ink"
                    : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(option.id)}
                  className="h-4 w-4 accent-ink"
                />
                {option.label}
              </label>
            )
          })}
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
        >
          Guardar métodos de pago
        </button>

        {saved && (
          <p className="mt-2 text-sm text-muted" role="status">
            Métodos de pago guardados.
          </p>
        )}
      </form>
    </section>
  )
}
