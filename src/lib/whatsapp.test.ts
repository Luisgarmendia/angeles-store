import { describe, expect, it } from "vitest"
import type { Customer, Product } from "../types"
import { ORDER_EMOJI, buildOrderMessage, paymentLabel, whatsappUrl } from "./whatsapp"

const dress: Product = {
  id: "p1",
  nombre: "Vestido midi satinado",
  precio: 1290,
  categoria: "Vestidos",
  descripcion: "",
  imagen: "",
}

const customer: Customer = {
  nombre: "Ana Martínez",
  direccion: "Col. Palmira, Ave. República de Panamá, Tegucigalpa",
  telefono: "9999-8888",
  pago: "transferencia",
  notas: "Entregar por la tarde",
}

describe("buildOrderMessage", () => {
  it("includes customer data, line items and total", () => {
    const message = buildOrderMessage({
      brandName: "Angeles Store's",
      customer,
      lines: [{ product: dress, quantity: 2 }],
      total: 2580,
    })

    expect(message).toContain("ANGELES STORE'S")
    expect(message).toContain("Ana Martínez")
    expect(message).toContain("Col. Palmira")
    expect(message).toContain("Transferencia bancaria")
    expect(message).toContain("Vestido midi satinado")
    expect(message).toContain("x2")
    expect(message).toContain("2,580")
  })

  it("omits optional fields when empty", () => {
    const message = buildOrderMessage({
      brandName: "Angeles Store's",
      customer: { ...customer, telefono: "   ", notas: "" },
      lines: [{ product: dress, quantity: 1 }],
      total: 1290,
    })

    expect(message).not.toContain("Teléfono")
    expect(message).not.toContain("Notas")
  })

  it("uses only long-supported emoji so no device shows boxes", () => {
    const message = buildOrderMessage({
      brandName: "Angeles Store's",
      customer,
      lines: [{ product: dress, quantity: 1 }],
      total: 1290,
    })

    const found = message.match(/\p{Extended_Pictographic}/gu) ?? []
    const allowed = new Set<string>(Object.values(ORDER_EMOJI))

    expect(found.length).toBeGreaterThan(0)
    for (const emoji of found) {
      expect(allowed.has(emoji)).toBe(true)
    }
  })
})

describe("whatsappUrl", () => {
  it("strips non-digits and encodes the message", () => {
    expect(whatsappUrl("+504 9999-8888", "Hola & chau")).toBe(
      "https://wa.me/50499998888?text=Hola%20%26%20chau",
    )
  })
})

describe("paymentLabel", () => {
  it("maps every payment method", () => {
    expect(paymentLabel("contraentrega")).toBe("Pago contra entrega")
    expect(paymentLabel("transferencia")).toBe("Transferencia bancaria")
    expect(paymentLabel("tarjeta")).toBe("Tarjeta")
    expect(paymentLabel("efectivo")).toBe("Efectivo")
  })
})
