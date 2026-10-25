import { describe, expect, it } from "vitest"
import { availableStock, isSoldOut, productStock } from "./stock"
import type { Product } from "./types"

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    nombre: "Camisa",
    precio: 500,
    categoria: "Camisas",
    descripcion: "",
    imagen: "",
    imagenes: [],
    stock: null,
    porEncargo: false,
    precioAnterior: null,
    creadoEn: "2026-01-01T00:00:00.000Z",
    variants: [],
    ...overrides,
  }
}

describe("stock helpers", () => {
  it("treats null stock as unlimited", () => {
    expect(availableStock(product())).toBeNull()
    expect(isSoldOut(product())).toBe(false)
  })

  it("reads the simple product stock", () => {
    expect(availableStock(product({ stock: 3 }))).toBe(3)
    expect(isSoldOut(product({ stock: 0 }))).toBe(true)
  })

  it("sums variant stock for the product total", () => {
    const item = product({
      stock: 99,
      variants: [
        { id: "v1", label: "M", stock: 2, precio: null, imagen: null },
        { id: "v2", label: "L", stock: 1, precio: 550, imagen: null },
      ],
    })

    expect(productStock(item)).toBe(3)
    expect(availableStock(item, "v1")).toBe(2)
    expect(availableStock(item, "v2")).toBe(1)
    expect(availableStock(item, "missing")).toBe(0)
    expect(isSoldOut(item)).toBe(false)
  })

  it("marks a variant catalog as sold out when every variant is empty", () => {
    const item = product({
      variants: [
        { id: "v1", label: "M", stock: 0, precio: null, imagen: null },
        { id: "v2", label: "L", stock: 0, precio: null, imagen: null },
      ],
    })

    expect(isSoldOut(item)).toBe(true)
  })

  it("ignores stock for made-to-order products", () => {
    const item = product({
      stock: 0,
      porEncargo: true,
      variants: [{ id: "v1", label: "M", stock: 0, precio: null, imagen: null }],
    })

    expect(productStock(item)).toBeNull()
    expect(availableStock(item, "v1")).toBeNull()
    expect(isSoldOut(item)).toBe(false)
  })
})
