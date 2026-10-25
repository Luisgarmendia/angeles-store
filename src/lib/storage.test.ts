import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CartItem, Customer, Product, StoreSettings } from "../types"
import { loadCustomer, migrateStorage, saveCustomer } from "./storage"

const store = new Map<string, string>()

vi.stubGlobal("localStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
})

const seed: Product[] = [product("c1", 480)]
const settings: StoreSettings = {
  whatsapp: "50499998888",
  instagram: "https://instagram.com/angelesstores",
  facebook: "",
  tiktok: "",
}

function product(id: string, precio: number): Product {
  return {
    id,
    nombre: `Producto ${id}`,
    precio,
    categoria: "Cremas",
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
      JSON.stringify([product("c1", 48900), product("custom", 500)]),
    )

    migrateStorage(seed, settings)

    const products = read<Product[]>("amapola.productos") ?? []
    expect(products.find((item) => item.id === "c1")?.precio).toBe(480)
    expect(products.find((item) => item.id === "custom")?.precio).toBe(500)
  })

  it("drops products from the legacy seed catalog", () => {
    store.set(
      "amapola.productos",
      JSON.stringify([product("p1", 1290), product("p7", 890), product("custom", 500)]),
    )

    migrateStorage(seed, settings)

    const ids = (read<Product[]>("amapola.productos") ?? []).map((item) => item.id)
    expect(ids).toEqual(["c1", "custom"])
  })

  it("prunes cart lines for products that no longer exist", () => {
    store.set(
      "amapola.carrito",
      JSON.stringify([
        { productId: "c1", quantity: 2 },
        { productId: "p3", quantity: 1 },
      ]),
    )

    migrateStorage(seed, settings)

    expect(read<CartItem[]>("amapola.carrito")).toEqual([{ productId: "c1", quantity: 2 }])
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

    store.set("amapola.productos", JSON.stringify([product("c1", 1500)]))
    migrateStorage(seed, settings)

    expect(read<Product[]>("amapola.productos")?.[0].precio).toBe(1500)
  })
})

describe("customer persistence", () => {
  const customer: Customer = {
    nombre: "Ana Martínez",
    direccion: "Col. Palmira, Tegucigalpa",
    telefono: "9999-8888",
    pago: "transferencia",
    notas: "Entregar por la tarde",
  }

  it("saves and restores the customer for the next checkout", () => {
    saveCustomer(customer)

    expect(loadCustomer()).toEqual(customer)
  })

  it("returns null when nothing was saved", () => {
    expect(loadCustomer()).toBeNull()
  })

  it("repairs an unknown payment method and empty fields", () => {
    store.set(
      "amapola.cliente",
      JSON.stringify({ nombre: "Ana", pago: "bitcoin", direccion: null }),
    )

    expect(loadCustomer()).toEqual({
      nombre: "Ana",
      direccion: "",
      telefono: "",
      pago: "contraentrega",
      notas: "",
    })
  })

  it("ignores a record without a name", () => {
    store.set("amapola.cliente", JSON.stringify({ direccion: "Tegucigalpa" }))

    expect(loadCustomer()).toBeNull()
  })
})
