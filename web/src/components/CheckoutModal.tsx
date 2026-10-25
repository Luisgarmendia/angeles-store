"use client"

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import Link from "next/link"
import { config } from "@/lib/config"
import { formatPrice } from "@/lib/format"
import { ALL_PAYMENT_METHODS } from "@/lib/payments"
import { loadCustomer, saveCustomer } from "@/lib/customer-storage"
import { normalizeHonduranPhone } from "@/lib/phone"
import { useModalBehavior } from "@/lib/useModal"
import { paymentLabel } from "@/lib/whatsapp"
import type { CartLine, Customer, PaymentMethod } from "@/lib/types"
import { MessageIcon, XIcon } from "./Icons"
import { Select } from "./Select"

interface CheckoutModalProps {
  open: boolean
  lines: CartLine[]
  total: number
  paymentMethods: PaymentMethod[]
  onClose: () => void
  onSubmit: (customer: Customer) => Promise<{ error?: string } | void>
}

const PHONE_ERROR = "Escribe un teléfono hondureño válido, por ejemplo 9999-8888."

const EMPTY_CUSTOMER: Customer = {
  nombre: "",
  direccion: "",
  telefono: "",
  pago: "contraentrega",
  notas: "",
}

function initialCustomer(methods: PaymentMethod[]): Customer {
  const fallbackPayment = methods[0] ?? "contraentrega"
  const saved = loadCustomer()

  if (!saved) return { ...EMPTY_CUSTOMER, pago: fallbackPayment }
  return methods.includes(saved.pago) ? saved : { ...saved, pago: fallbackPayment }
}

export function CheckoutModal({
  open,
  lines,
  total,
  paymentMethods,
  onClose,
  onSubmit,
}: CheckoutModalProps) {
  const methods = paymentMethods.length > 0 ? paymentMethods : ALL_PAYMENT_METHODS
  const [customer, setCustomer] = useState<Customer>(() => initialCustomer(methods))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  useModalBehavior(open, onClose, dialogRef)

  useEffect(() => {
    if (!open) return
    setCustomer(initialCustomer(methods))
    setError(null)
  }, [open, methods])

  if (!open) return null

  function update<K extends keyof Customer>(key: K, value: Customer[K]) {
    setCustomer((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!customer.nombre.trim() || !customer.direccion.trim()) {
      setError("Completa tu nombre y tu dirección de entrega para continuar.")
      return
    }

    if (!normalizeHonduranPhone(customer.telefono)) {
      setError(PHONE_ERROR)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const result = await onSubmit(customer)
      if (result?.error) {
        setError(result.error)
        return
      }
      saveCustomer(customer)
    } catch {
      setError("No se pudo registrar el pedido. Intentá de nuevo.")
    } finally {
      setSubmitting(false)
    }
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
        ref={dialogRef}
        tabIndex={-1}
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

        <div className="mt-5 rounded-2xl border border-ink/10 bg-white/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Tu pedido</p>
          <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto pr-1 text-sm">
            {lines.map((line) => (
              <li key={line.product.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate text-muted">
                  {line.quantity}× {line.product.nombre}
                  {line.variantLabel ? ` (${line.variantLabel})` : ""}
                </span>
                <span className="whitespace-nowrap text-ink">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-2 text-sm font-medium">
            <span>Total</span>
            <span className="font-display text-xl text-ink">{formatPrice(total)}</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">{config.shipping.note}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Field label="Nombre completo" required>
            <input
              type="text"
              value={customer.nombre}
              onChange={(event) => update("nombre", event.target.value)}
              autoComplete="name"
              className={inputClass}
              placeholder="Ana Martínez"
            />
          </Field>

          <Field label="Dirección de entrega" required>
            <input
              type="text"
              value={customer.direccion}
              onChange={(event) => update("direccion", event.target.value)}
              autoComplete="street-address"
              className={inputClass}
              placeholder="Col. Palmira, Ave. República de Panamá, Tegucigalpa"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono de contacto" required>
              <input
                type="tel"
                value={customer.telefono}
                onChange={(event) => update("telefono", event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                className={inputClass}
                placeholder="+504 9999-8888"
              />
            </Field>

            <Field label="Método de pago">
              <Select
                value={customer.pago}
                onChange={(event) => update("pago", event.target.value as PaymentMethod)}
                aria-label="Método de pago"
              >
                {methods.map((method) => (
                  <option key={method} value={method}>
                    {paymentLabel(method)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Notas adicionales">
            <textarea
              value={customer.notas}
              onChange={(event) => update("notas", event.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Horario de entrega, referencias, talla preferida…"
            />
          </Field>

          {error && (
            <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-sm font-medium text-cream transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageIcon className="h-4 w-4" />
            {submitting ? "Preparando pedido…" : "Enviar pedido por WhatsApp"}
          </button>
          <p className="text-center text-[11px] leading-relaxed text-muted">
            Se va a abrir WhatsApp con tu pedido listo. Te respondemos para confirmar disponibilidad
            y entrega. Guardamos tu pedido en nuestra base de datos para gestionarlo y tu navegador
            conserva tus datos de contacto para prellenar la próxima compra. Consulta nuestra{" "}
            <Link
              href="/privacidad"
              className="underline underline-offset-2 transition-colors hover:text-ink"
            >
              política de privacidad
            </Link>
            .
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
  children: ReactNode
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
