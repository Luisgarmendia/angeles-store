"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "react-qr-code"
import { formatPrice } from "@/lib/format"
import { paymentLabel } from "@/lib/payments"
import { useModalBehavior } from "@/lib/useModal"
import { buildOrderMessage } from "@/lib/whatsapp"
import type { CartLine, Customer } from "@/lib/types"
import { XIcon } from "./Icons"
import { useStoreSettings } from "./store-settings-provider"
import { useToast } from "./toast-provider"

export interface OrderConfirmation {
  id: string
  number: number
  lines: CartLine[]
  total: number
  customer: Customer
  whatsappUrl: string
  createdAt: Date
}

interface OrderConfirmationModalProps {
  confirmation: OrderConfirmation | null
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  dateStyle: "long",
  timeStyle: "short",
})

export function OrderConfirmationModal({
  confirmation,
  onClose,
}: OrderConfirmationModalProps) {
  const store = useStoreSettings()
  const { showToast } = useToast()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [receiptUrl, setReceiptUrl] = useState("")

  useModalBehavior(confirmation !== null, onClose, dialogRef)

  useEffect(() => {
    if (!confirmation) {
      setReceiptUrl("")
      return
    }
    setReceiptUrl(`${window.location.origin}/pedido/${confirmation.id}`)
  }, [confirmation])

  if (!confirmation) return null

  const summary = buildOrderMessage({
    brandName: store.store.name,
    customer: confirmation.customer,
    lines: confirmation.lines,
    total: confirmation.total,
    orderNumber: confirmation.number,
  })

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary)
      showToast("Resumen copiado.")
    } catch {
      showToast("No se pudo copiar el resumen.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar confirmación de pedido"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-lg animate-modal-in overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-label="Pedido confirmado"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
              Gracias por tu compra
            </p>
            <h2 className="font-display text-3xl text-ink">Pedido confirmado</h2>
            <p className="mt-1 text-sm text-muted">
              Pedido #{confirmation.number} · {dateFormatter.format(confirmation.createdAt)}
            </p>
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

        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 text-center">
          <p className="text-sm font-medium text-ink">Guardá tu comprobante</p>
          <div className="rounded-2xl bg-white p-4">
            {receiptUrl ? (
              <QRCode
                value={receiptUrl}
                size={180}
                level="M"
                bgColor="#ffffff"
                fgColor="#2b2320"
              />
            ) : null}
          </div>
          <p className="text-[11px] leading-relaxed text-muted">
            Escaneá el QR para abrir tu comprobante privado en otro dispositivo.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Tu pedido</p>
          <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1 text-sm">
            {confirmation.lines.map((line) => (
              <li
                key={`${line.product.id}-${line.variantId ?? "base"}`}
                className="flex justify-between gap-3"
              >
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
            <span className="font-display text-xl text-ink">
              {formatPrice(confirmation.total)}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-ink/10 bg-white/60 p-4 text-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Entrega</p>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Cliente</dt>
              <dd className="text-right text-ink">{confirmation.customer.nombre}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Teléfono</dt>
              <dd className="text-right text-ink">{confirmation.customer.telefono}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Dirección</dt>
              <dd className="text-right text-ink">{confirmation.customer.direccion}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Pago</dt>
              <dd className="text-right text-ink">{paymentLabel(confirmation.customer.pago)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-cream transition-colors hover:bg-wine"
          >
            Abrir comprobante
          </a>
          <button
            type="button"
            onClick={copySummary}
            className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-sand"
          >
            Copiar resumen
          </button>
          <a
            href={confirmation.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-ink/20 px-5 py-3 text-sm font-medium text-ink transition-colors hover:border-ink hover:bg-sand"
          >
            Abrir WhatsApp
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-sand hover:text-ink"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
