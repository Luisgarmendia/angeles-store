import { describe, expect, it } from "vitest"
import type { Customer, Product } from "../types"
import { buildOrderMessage, paymentLabel, whatsappUrl } from "./whatsapp"

const dress: Product = {
  id: "p1",
  nombre: "Vestido midi satinado",
  precio: 48900,
  categoria: "Vestidos",
  descripcion: "",
  imagen: "",
}

const customer: Customer = {
  nombre: "Ana Gómez",
  direccion: "Av. Siempre Viva 742",
  telefono: "11 5555 4444",
  pago: "transferencia",
  notas: "Entregar por la tarde",
}

describe("buildOrderMessage", () => {
  it("includes customer data, line items and total", () => {
    const message = buildOrderMessage({
      brandName: "Amapola",
      customer,
      lines: [{ product: dress, quantity: 2 }],
      total: 97800,
    })

    expect(message).toContain("AMAPOLA")
    expect(message).toContain("Ana Gómez")
    expect(message).toContain("Av. Siempre Viva 742")
    expect(message).toContain("Transferencia")
    expect(message).toContain("Vestido midi satinado")
    expect(message).toContain("x2")
    expect(message).toContain("97.800")
  })

  it("omits optional fields when empty", () => {
    const message = buildOrderMessage({
      brandName: "Amapola",
      customer: { ...customer, telefono: "   ", notas: "" },
      lines: [{ product: dress, quantity: 1 }],
      total: 48900,
    })

    expect(message).not.toContain("Teléfono")
    expect(message).not.toContain("Notas")
  })
})

describe("whatsappUrl", () => {
  it("strips non-digits and encodes the message", () => {
    expect(whatsappUrl("+54 9 11 5555-4444", "Hola & chau")).toBe(
      "https://wa.me/5491155554444?text=Hola%20%26%20chau",
    )
  })
})

describe("paymentLabel", () => {
  it("maps every payment method", () => {
    expect(paymentLabel("efectivo")).toBe("Efectivo")
    expect(paymentLabel("transferencia")).toBe("Transferencia")
    expect(paymentLabel("tarjeta")).toBe("Tarjeta")
  })
})
