import { describe, expect, it } from "vitest"
import { addToCart, cartCount, cartTotal, removeFromCart, setQuantity } from "./cart"
import type { Product } from "../types"

const products: Product[] = [
  {
    id: "p1",
    nombre: "Vestido midi",
    precio: 1000,
    categoria: "Vestidos",
    descripcion: "",
    imagen: "",
  },
  {
    id: "p2",
    nombre: "Cartera",
    precio: 500,
    categoria: "Carteras",
    descripcion: "",
    imagen: "",
  },
]

describe("cart", () => {
  it("adds a new product with quantity 1", () => {
    expect(addToCart([], "p1")).toEqual([{ productId: "p1", quantity: 1 }])
  })

  it("increments an existing product instead of duplicating the line", () => {
    expect(addToCart([{ productId: "p1", quantity: 2 }], "p1")).toEqual([
      { productId: "p1", quantity: 3 },
    ])
  })

  it("removes a product", () => {
    expect(removeFromCart([{ productId: "p1", quantity: 1 }], "p1")).toEqual([])
  })

  it("removes the line when quantity reaches zero", () => {
    expect(setQuantity([{ productId: "p1", quantity: 1 }], "p1", 0)).toEqual([])
  })

  it("counts units, not lines", () => {
    expect(
      cartCount([
        { productId: "p1", quantity: 2 },
        { productId: "p2", quantity: 3 },
      ]),
    ).toBe(5)
  })

  it("totals only products that still exist", () => {
    expect(
      cartTotal(
        [
          { productId: "p1", quantity: 2 },
          { productId: "p2", quantity: 1 },
          { productId: "ghost", quantity: 9 },
        ],
        products,
      ),
    ).toBe(2500)
  })
})
