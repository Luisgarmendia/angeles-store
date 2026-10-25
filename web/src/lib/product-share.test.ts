import { describe, expect, it } from "vitest"
import { productShareDescription, productShareTitle } from "./product-share"
import type { Product } from "./types"

const product: Product = {
  id: "c1",
  nombre: "Crema facial de día",
  precio: 480,
  categoria: "Cremas",
  descripcion: "Hidratación ligera con textura fresca para usar cada mañana.",
  imagen: "",
  stock: null,
  variants: [],
}

describe("productShareTitle", () => {
  it("includes the product name and price", () => {
    const title = productShareTitle(product)

    expect(title).toContain("Crema facial de día")
    expect(title).toContain("480.00")
  })
})

describe("productShareDescription", () => {
  it("includes the category and the description", () => {
    const description = productShareDescription(product)

    expect(description).toContain("Cremas")
    expect(description).toContain("Hidratación ligera")
  })

  it("truncates long descriptions with an ellipsis", () => {
    const description = productShareDescription({
      ...product,
      descripcion: "x".repeat(300),
    })

    expect(description.length).toBeLessThanOrEqual(160)
    expect(description.endsWith("…")).toBe(true)
  })
})
