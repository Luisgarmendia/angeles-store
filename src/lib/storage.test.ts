import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Product, StoreSettings } from "../types"
import { migrateStorage } from "./storage"

const store = new Map<string, string>()

vi.stubGlobal("localStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
})

const seed: Product[] = [product("p1", 1290)]
const settings: StoreSettings = { whatsapp: "50499998888" }

function product(id: string, precio: number): Product {
  return {
    id,
    nombre: `Producto ${id}`,
    precio,
    categoria: "Vestidos",
    descripcion: "",
    imagen: "",
  }
}

function read<T>(key: string): T | null {
  const raw = store.get(key)
  return raw ? (JSON.parse(raw) as T) : null
}

beforeEach(() => {
  store.clear()
})

describe("migrateStorage", () => {
  it("replaces the old seed prices and keeps custom products", () => {
    store.set(
      "amapola.productos",
      JSON.stringify([product("p1", 48900), product("custom", 500)]),
    )

    migrateStorage(seed, settings)

    const products = read<Product[]>("amapola.productos") ?? []
    expect(products.find((item) => item.id === "p1")?.precio).toBe(1290)
    expect(products.find((item) => item.id === "custom")?.precio).toBe(500)
  })

  it("replaces the old Argentine placeholder phone", () => {
    store.set("amapola.config", JSON.stringify({ whatsapp: "5491100000000" }))

    migrateStorage(seed, settings)

    expect(read<StoreSettings>("amapola.config")?.whatsapp).toBe("50499998888")
  })

  it("keeps a phone number the owner already configured", () => {
    store.set("amapola.config", JSON.stringify({ whatsapp: "50488887777" }))

    migrateStorage(seed, settings)

    expect(read<StoreSettings>("amapola.config")?.whatsapp).toBe("50488887777")
  })

  it("seeds the catalog when there is nothing stored", () => {
    migrateStorage(seed, settings)

    expect(read<Product[]>("amapola.productos")).toEqual(seed)
  })

  it("runs only once", () => {
    migrateStorage(seed, settings)

    store.set("amapola.productos", JSON.stringify([product("p1", 1500)]))
    migrateStorage(seed, settings)

    expect(read<Product[]>("amapola.productos")?.[0].precio).toBe(1500)
  })
})
