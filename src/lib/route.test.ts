import { describe, expect, it } from "vitest"
import { productHash, productIdFromHash } from "./route"

describe("productIdFromHash", () => {
  it("reads the id from a product hash", () => {
    expect(productIdFromHash("#producto/c1")).toBe("c1")
    expect(productIdFromHash("#producto/pa2")).toBe("pa2")
  })

  it("ignores unrelated hashes", () => {
    expect(productIdFromHash("")).toBeNull()
    expect(productIdFromHash("#catalogo")).toBeNull()
    expect(productIdFromHash("#producto/")).toBeNull()
  })

  it("ignores trailing segments and decodes the id", () => {
    expect(productIdFromHash("#producto/c1?from=grid")).toBe("c1")
    expect(productIdFromHash("#producto/c%201")).toBe("c 1")
  })

  it("round-trips with productHash", () => {
    expect(productIdFromHash(productHash("a1"))).toBe("a1")
  })
})
