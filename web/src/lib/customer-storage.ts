import { isPaymentMethod } from "./payments"
import type { Customer } from "./types"

const CUSTOMER_KEY = "amapola.cliente"

export function loadCustomer(): Customer | null {
  try {
    const raw = localStorage.getItem(CUSTOMER_KEY)
    if (!raw) return null

    const stored = JSON.parse(raw) as Partial<Customer>
    if (typeof stored.nombre !== "string" || !stored.nombre.trim()) return null

    return {
      nombre: stored.nombre,
      direccion: typeof stored.direccion === "string" ? stored.direccion : "",
      telefono: typeof stored.telefono === "string" ? stored.telefono : "",
      pago: isPaymentMethod(stored.pago) ? stored.pago : "contraentrega",
      notas: typeof stored.notas === "string" ? stored.notas : "",
    }
  } catch {
    return null
  }
}

export function saveCustomer(customer: Customer): void {
  try {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer))
  } catch {
    // Private mode or full storage: the order can still continue.
  }
}
