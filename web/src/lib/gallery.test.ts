import { describe, expect, it } from "vitest"
import { galleryImages } from "./gallery"
import type { Product, ProductVariant } from "./types"

const product: Product = {
  id: "p1",
  nombre: "Camisa",
  precio: 500,
  categoria: "Camisas",
  descripcion: "",
  imagen: "front.jpg",
  imagenes: ["front.jpg", "back.jpg"],
  stock: null,
  variants: [],
}

const variant: ProductVariant = {
  id: "v1",
  label: "Negro",
  stock: 2,
  precio: null,
  imagen: "black.jpg",
}

describe("galleryImages", () => {
  it("returns the shared gallery when there is no variant image", () => {
    expect(galleryImages(product, null)).toEqual(["front.jpg", "back.jpg"])
  })

  it("puts the variant image first", () => {
    expect(galleryImages(product, variant)).toEqual(["black.jpg", "front.jpg", "back.jpg"])
  })

  it("removes duplicate URLs", () => {
    expect(
      galleryImages(
        { ...product, imagenes: ["black.jpg", "front.jpg"] },
        variant,
      ),
    ).toEqual(["black.jpg", "front.jpg"])
  })

  it("returns an empty list when there is no image at all", () => {
    expect(galleryImages({ ...product, imagen: "", imagenes: [] }, null)).toEqual([])
  })
})
