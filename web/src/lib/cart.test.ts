import { describe, expect, it } from "vitest"
import {
  addToCart,
  capLineQuantity,
  cartCount,
  cartTotal,
  removeFromCart,
  sanitizeCart,
  setQuantity,
} from "./cart"
import type { Product } from "./types"

const products: Product[] = [
  {
    id: "p1",
    nombre: "Vestido midi",
    precio: 1000,
    categoria: "Vestidos",
    descripcion: "",
    imagen: "",
    imagenes: [],
    stock: null,
    porEncargo: false,
    precioAnterior: null,
    creadoEn: "2026-01-01T00:00:00.000Z",
    variants: [
      { id: "v-m", label: "M", stock: 3, precio: null, imagen: null },
      { id: "v-l", label: "L", stock: 2, precio: 1100, imagen: null },
    ],
  },
  {
    id: "p2",
    nombre: "Cartera",
    precio: 500,
    categoria: "Carteras",
    descripcion: "",
    imagen: "",
    imagenes: [],
    stock: 4,
    porEncargo: false,
    precioAnterior: null,
    creadoEn: "2026-01-01T00:00:00.000Z",
    variants: [],
  },
]

describe("cart", () => {
  it("adds a new simple product with quantity 1", () => {
    expect(addToCart([], "p2")).toEqual([
      { productId: "p2", variantId: null, quantity: 1 },
    ])
  })

  it("adds a variant as its own line", () => {
    expect(addToCart([], "p1", "v-m")).toEqual([
      { productId: "p1", variantId: "v-m", quantity: 1 },
    ])
  })

  it("increments the same variant instead of duplicating the line", () => {
    expect(addToCart([{ productId: "p1", variantId: "v-m", quantity: 2 }], "p1", "v-m")).toEqual([
      { productId: "p1", variantId: "v-m", quantity: 3 },
    ])
  })

  it("keeps different variants as separate lines", () => {
    const cart = addToCart(
      addToCart([], "p1", "v-m"),
      "p1",
      "v-l",
    )

    expect(cart).toHaveLength(2)
  })

  it("adds several units at once", () => {
    expect(addToCart([], "p2", null, 3)).toEqual([
      { productId: "p2", variantId: null, quantity: 3 },
    ])
  })

  it("never adds a non-positive or invalid quantity", () => {
    expect(addToCart([], "p2", null, 0)).toEqual([
      { productId: "p2", variantId: null, quantity: 1 },
    ])
    expect(addToCart([], "p2", null, Number.NaN)).toEqual([
      { productId: "p2", variantId: null, quantity: 1 },
    ])
  })

  it("removes only the requested variant", () => {
    expect(
      removeFromCart(
        [
          { productId: "p1", variantId: "v-m", quantity: 1 },
          { productId: "p1", variantId: "v-l", quantity: 1 },
        ],
        "p1",
        "v-m",
      ),
    ).toEqual([{ productId: "p1", variantId: "v-l", quantity: 1 }])
  })

  it("removes the line when quantity reaches zero", () => {
    expect(setQuantity([{ productId: "p2", variantId: null, quantity: 1 }], "p2", null, 0)).toEqual(
      [],
    )
  })

  it("leaves the cart untouched when the purchase cap is unlimited", () => {
    const cart = [{ productId: "p2", variantId: null, quantity: 9 }]

    expect(capLineQuantity(cart, "p2", null, null)).toBe(cart)
  })

  it("clamps an over-limit line and leaves the other lines alone", () => {
    const cart = [
      { productId: "p2", variantId: null, quantity: 5 },
      { productId: "p1", variantId: "v-m", quantity: 1 },
    ]

    expect(capLineQuantity(cart, "p2", null, 3)).toEqual([
      { productId: "p2", variantId: null, quantity: 3 },
      { productId: "p1", variantId: "v-m", quantity: 1 },
    ])
  })

  it("removes the line when the purchase cap is zero", () => {
    expect(
      capLineQuantity(
        [
          { productId: "p2", variantId: null, quantity: 1 },
          { productId: "p1", variantId: "v-m", quantity: 1 },
        ],
        "p2",
        null,
        0,
      ),
    ).toEqual([{ productId: "p1", variantId: "v-m", quantity: 1 }])
  })

  it("counts units, not lines", () => {
    expect(
      cartCount([
        { productId: "p1", variantId: "v-m", quantity: 2 },
        { productId: "p2", variantId: null, quantity: 3 },
      ]),
    ).toBe(5)
  })

  it("drops a variant product line with no variant", () => {
    expect(
      cartTotal([{ productId: "p1", variantId: null, quantity: 1 }], products),
    ).toBe(0)
  })

  it("totals variants with their own price and ignores deleted lines", () => {
    expect(
      cartTotal(
        [
          { productId: "p1", variantId: "v-m", quantity: 2 },
          { productId: "p1", variantId: "v-l", quantity: 1 },
          { productId: "p2", variantId: null, quantity: 1 },
          { productId: "ghost", variantId: null, quantity: 9 },
        ],
        products,
      ),
    ).toBe(3600)
  })
})

describe("sanitizeCart", () => {
  it("drops malformed entries, floors quantities and collapses duplicate lines", () => {
    expect(
      sanitizeCart([
        { productId: "p1", variantId: null, quantity: 2 },
        { productId: "p1", variantId: null, quantity: 3 },
        { productId: "", variantId: null, quantity: 1 },
        { productId: "p2", variantId: null, quantity: 0 },
        { productId: "p3", variantId: null, quantity: 1.8 },
        { productId: "p4", variantId: 42, quantity: 1 },
        "nope",
        null,
      ]),
    ).toEqual([
      { productId: "p1", variantId: null, quantity: 2 },
      { productId: "p3", variantId: null, quantity: 1 },
    ])
  })

  it("keeps variant lines separate from the base product", () => {
    expect(
      sanitizeCart([
        { productId: "p1", variantId: null, quantity: 1 },
        { productId: "p1", variantId: "v-m", quantity: 2 },
      ]),
    ).toEqual([
      { productId: "p1", variantId: null, quantity: 1 },
      { productId: "p1", variantId: "v-m", quantity: 2 },
    ])
  })

  it("returns an empty cart for non-array values", () => {
    expect(sanitizeCart(null)).toEqual([])
    expect(sanitizeCart({ productId: "p1" })).toEqual([])
  })
})
