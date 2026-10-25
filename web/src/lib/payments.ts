import type { PaymentMethod } from "./types"

export interface PaymentOption {
  id: PaymentMethod
  label: string
}

/** The only payment methods the store knows. The admin enables a subset. */
export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { id: "contraentrega", label: "Pago contra entrega" },
  { id: "transferencia", label: "Transferencia bancaria" },
  { id: "tarjeta", label: "Tarjeta" },
  { id: "efectivo", label: "Efectivo" },
]

export const ALL_PAYMENT_METHODS: PaymentMethod[] = PAYMENT_OPTIONS.map((option) => option.id)

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && PAYMENT_OPTIONS.some((option) => option.id === value)
}

export function paymentLabel(method: PaymentMethod): string {
  return PAYMENT_OPTIONS.find((option) => option.id === method)?.label ?? method
}

/**
 * Keeps the enabled methods that exist in the defined list. When nothing valid
 * remains, every method stays available so checkout never ends up empty.
 */
export function enabledPaymentMethods(value: unknown): PaymentMethod[] {
  if (!Array.isArray(value)) return [...ALL_PAYMENT_METHODS]

  const enabled = value.filter(isPaymentMethod)
  return enabled.length > 0 ? enabled : [...ALL_PAYMENT_METHODS]
}
