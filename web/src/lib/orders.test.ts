import { describe, expect, it } from "vitest"
import {
  PAYMENT_STATUS_OPTIONS,
  isPaymentStatus,
  paymentStatusLabel,
} from "./orders"

describe("payment status", () => {
  it("exposes the payment statuses with labels", () => {
    expect(PAYMENT_STATUS_OPTIONS.map((option) => option.id)).toEqual([
      "pendiente",
      "pagado",
      "reembolsado",
    ])
    expect(paymentStatusLabel("pendiente")).toBe("Pago pendiente")
    expect(paymentStatusLabel("pagado")).toBe("Pagado")
    expect(paymentStatusLabel("reembolsado")).toBe("Reembolsado")
  })

  it("recognizes only the defined payment statuses", () => {
    expect(isPaymentStatus("pendiente")).toBe(true)
    expect(isPaymentStatus("pagado")).toBe(true)
    expect(isPaymentStatus("reembolsado")).toBe(true)
    expect(isPaymentStatus("cancelado")).toBe(false)
    expect(isPaymentStatus(null)).toBe(false)
  })
})
