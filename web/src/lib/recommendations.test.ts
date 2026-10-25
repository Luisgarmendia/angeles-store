import { describe, expect, it } from "vitest"
import type { Product } from "./types"
import { recommendProducts } from "./recommendations"

function product(id: string, categoria: string): Product {
  return {
    id,
    nombre: id,
    precio: 100,
    categoria,
    descripcion: "",
    imagen: "",
    imagenes: [],
    stock: null,
    variants: [],
  }
}

const catalog: Product[] = [
  product("c1", "Cremas"),
  product("c2", "Cremas"),
  product("c3", "Cremas"),
  product("s1", "Camisas"),
  product("s2", "Camisas"),
  product("v1", "Vestidos"),
]

describe("recommendProducts", () => {
  it("puts products from the same category first", () => {
    const result = recommendProducts(catalog, "c1", 4)
    expect(result.map((item) => item.id)).toEqual(["c2", "c3", "s1", "s2"])
  })

  it("never recommends the product being viewed", () => {
    expect(recommendProducts(catalog, "c1", 10).some((item) => item.id === "c1")).toBe(false)
  })

  it("fills with the rest of the catalog when the category is short", () => {
    const result = recommendProducts(catalog, "v1", 4)
    expect(result).toHaveLength(4)
    expect(result[0].id).not.toBe("v1")
  })

  it("returns nothing for an unknown product", () => {
    expect(recommendProducts(catalog, "missing")).toEqual([])
  })
})
