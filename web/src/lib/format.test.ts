import { describe, expect, it } from "vitest"
import { formatPrice } from "./format"

describe("formatPrice", () => {
  it("formats lempiras with the Honduran locale and two decimals", () => {
    const formatted = formatPrice(1290)

    expect(formatted).toMatch(/^L\s/)
    expect(formatted).toContain("1,290")
    expect(formatted).toContain(".00")
  })

  it("keeps cents when a product has them", () => {
    expect(formatPrice(1290.5)).toContain("1,290.50")
  })

  it("adds thousands separators", () => {
    expect(formatPrice(48900)).toContain("48,900.00")
  })
})
