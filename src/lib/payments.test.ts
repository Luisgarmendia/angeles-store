import { describe, expect, it } from "vitest"
import {
  ALL_PAYMENT_METHODS,
  PAYMENT_OPTIONS,
  enabledPaymentMethods,
  isPaymentMethod,
  paymentLabel,
} from "./payments"

describe("payment options", () => {
  it("exposes the defined methods with labels", () => {
    expect(PAYMENT_OPTIONS.map((option) => option.id)).toEqual(ALL_PAYMENT_METHODS)
    expect(paymentLabel("tarjeta")).toBe("Tarjeta")
    expect(paymentLabel("contraentrega")).toBe("Pago contra entrega")
  })

  it("recognizes only the defined methods", () => {
    expect(isPaymentMethod("efectivo")).toBe(true)
    expect(isPaymentMethod("bitcoin")).toBe(false)
    expect(isPaymentMethod(null)).toBe(false)
  })

  it("keeps the enabled methods the owner chose", () => {
    expect(enabledPaymentMethods(["tarjeta", "contraentrega"])).toEqual([
      "tarjeta",
      "contraentrega",
    ])
  })

  it("drops unknown methods and falls back to all when none remain", () => {
    expect(enabledPaymentMethods(["tarjeta", "bitcoin"])).toEqual(["tarjeta"])
    expect(enabledPaymentMethods(["bitcoin"])).toEqual(ALL_PAYMENT_METHODS)
    expect(enabledPaymentMethods([])).toEqual(ALL_PAYMENT_METHODS)
    expect(enabledPaymentMethods(undefined)).toEqual(ALL_PAYMENT_METHODS)
  })
})
