import { describe, expect, it } from "vitest"
import { compareAtPrice, discountPercent, isDiscounted } from "./pricing"

describe("pricing helpers", () => {
  it("reports no discount without a previous price", () => {
    const product = { precio: 480, precioAnterior: null }

    expect(discountPercent(product)).toBeNull()
    expect(isDiscounted(product)).toBe(false)
    expect(compareAtPrice(product)).toBeNull()
  })

  it("ignores a previous price that is not higher than the current price", () => {
    expect(discountPercent({ precio: 480, precioAnterior: 480 })).toBeNull()
    expect(discountPercent({ precio: 480, precioAnterior: 400 })).toBeNull()
  })

  it("ignores a discount that rounds to zero percent", () => {
    expect(discountPercent({ precio: 1000, precioAnterior: 1004 })).toBeNull()
  })

  it("computes the whole discount percentage", () => {
    const product = { precio: 480, precioAnterior: 590 }

    expect(discountPercent(product)).toBe(19)
    expect(isDiscounted(product)).toBe(true)
    expect(compareAtPrice(product)).toBe(590)
  })

  it("does not invent a previous price for an option with its own price", () => {
    const product = { precio: 480, precioAnterior: 590 }

    expect(compareAtPrice(product, 480)).toBe(590)
    expect(compareAtPrice(product, 520)).toBeNull()
  })
})
