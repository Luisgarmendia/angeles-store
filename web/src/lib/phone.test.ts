import { describe, expect, it } from "vitest"
import { formatHonduranPhone, normalizeHonduranPhone } from "./phone"

describe("normalizeHonduranPhone", () => {
  it("adds the country code to an 8-digit local number", () => {
    expect(normalizeHonduranPhone("9999-8888")).toBe("50499998888")
  })

  it("keeps an international number that already starts with 504", () => {
    expect(normalizeHonduranPhone("+504 9999 8888")).toBe("50499998888")
  })

  it("rejects numbers with the wrong length", () => {
    expect(normalizeHonduranPhone("9999-888")).toBeNull()
    expect(normalizeHonduranPhone("504999988881")).toBeNull()
  })

  it("rejects an international number from another country", () => {
    expect(normalizeHonduranPhone("+54 9 11 5555 4444")).toBeNull()
  })
})

describe("formatHonduranPhone", () => {
  it("formats the international digits for display", () => {
    expect(formatHonduranPhone("50499998888")).toBe("+504 9999-8888")
  })

  it("formats a local number too", () => {
    expect(formatHonduranPhone("99998888")).toBe("+504 9999-8888")
  })

  it("returns the trimmed input when it cannot be formatted", () => {
    expect(formatHonduranPhone("  123  ")).toBe("123")
  })
})
