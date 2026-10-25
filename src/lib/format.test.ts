import { describe, expect, it } from "vitest"
import { formatPrice } from "./format"

describe("formatPrice", () => {
  it("formats lempiras with the Honduran locale and no decimals", () => {
    const formatted = formatPrice(1290)

    expect(formatted).toMatch(/^L\s/)
    expect(formatted).toContain("1,290")
    expect(formatted).not.toContain(".00")
  })

  it("adds thousands separators", () => {
    expect(formatPrice(48900)).toContain("48,900")
  })
})
