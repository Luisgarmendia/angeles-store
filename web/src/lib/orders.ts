import type { OrderStatus } from "./types"

export const ORDER_STATUS_OPTIONS: Array<{ id: OrderStatus; label: string }> = [
  { id: "pendiente", label: "Pendiente" },
  { id: "confirmado", label: "Confirmado" },
  { id: "enviado", label: "Enviado" },
  { id: "entregado", label: "Entregado" },
  { id: "cancelado", label: "Cancelado" },
]

export function orderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_OPTIONS.find((option) => option.id === status)?.label ?? status
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return ORDER_STATUS_OPTIONS.some((option) => option.id === value)
}
