import { useState, type FormEvent } from "react"
import { formatPrice } from "../lib/format"
import { paymentLabel } from "../lib/whatsapp"
import type { Customer, PaymentMethod } from "../types"
import { MessageIcon, XIcon } from "./Icons"

interface CheckoutModalProps {
  open: boolean
  total: number
  onClose: () => void
  onSubmit: (customer: Customer) => void
}

const PAYMENT_METHODS: PaymentMethod[] = ["efectivo", "transferencia", "tarjeta"]

const EMPTY_CUSTOMER: Customer = {
  nombre: "",
  direccion: "",
  telefono: "",
  pago: "efectivo",
  notas: "",
}

export function CheckoutModal({ open, total, onClose, onSubmit }: CheckoutModalProps) {
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function update<K extends keyof Customer>(key: K, value: Customer[K]) {
    setCustomer((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!customer.nombre.trim() || !customer.direccion.trim()) {
      setError("Completá tu nombre y tu dirección de entrega.")
      return
    }

    setError(null)
    onSubmit(customer)
    setCustomer(EMPTY_CUSTOMER)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar formulario de pedido"
      />

      <div
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-label="Datos de entrega"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Último paso</p>
            <h2 className="font-display text-3xl text-ink">Datos de entrega</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Cerrar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field label="Nombre completo" required>
            <input
              type="text"
              value={customer.nombre}
              onChange={(event) => update("nombre", event.target.value)}
              autoComplete="name"
              className={inputClass}
              placeholder="Ana Gómez"
            />
          </Field>

          <Field label="Dirección de entrega" required>
            <input
              type="text"
              value={customer.direccion}
              onChange={(event) => update("direccion", event.target.value)}
              autoComplete="street-address"
              className={inputClass}
              placeholder="Av. Siempre Viva 742, piso 3 B"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono de contacto">
              <input
                type="tel"
                value={customer.telefono}
                onChange={(event) => update("telefono", event.target.value)}
                autoComplete="tel"
                className={inputClass}
                placeholder="11 5555 4444"
              />
            </Field>

            <Field label="Método de pago">
              <select
                value={customer.pago}
                onChange={(event) => update("pago", event.target.value as PaymentMethod)}
                className={inputClass}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {paymentLabel(method)}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Notas adicionales">
            <textarea
              value={customer.notas}
              onChange={(event) => update("notas", event.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Horario de entrega, referencias, talle preferido…"
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-ink/10 pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="font-display text-2xl text-ink">{formatPrice(total)}</span>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
          >
            <MessageIcon className="h-4 w-4" />
            Enviar pedido por WhatsApp
          </button>
          <p className="text-center text-[11px] text-muted">
            Se va a abrir WhatsApp con el resumen del pedido ya escrito.
          </p>
        </form>
      </div>
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
        {label}
        {required && <span className="ml-1 text-rose-dark">*</span>}
      </span>
      {children}
    </label>
  )
}
