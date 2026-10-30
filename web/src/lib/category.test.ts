import { describe, expect, it } from "vitest"
import { categoryPath, categorySlug } from "./category"

describe("categorySlug", () => {
  it("lowercases and joins words with dashes", () => {
    expect(categorySlug("Ropa interior")).toBe("ropa-interior")
    expect(categorySlug("Cuidado facial")).toBe("cuidado-facial")
  })

  it("strips accents and the ñ", () => {
    expect(categorySlug("Trajes de baño")).toBe("trajes-de-bano")
    expect(categorySlug("Perfumería")).toBe("perfumeria")
  })

  it("builds the category path", () => {
    expect(categoryPath("Trajes de baño")).toBe("/categoria/trajes-de-bano")
  })
})
