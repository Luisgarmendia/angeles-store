import type { CartItem, Product, StoreSettings } from "../types"

const PRODUCTS_KEY = "amapola.productos"
const CART_KEY = "amapola.carrito"
const SETTINGS_KEY = "amapola.config"

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked (private mode). The app keeps working in memory.
  }
}

export function loadProducts(fallback: Product[]): Product[] {
  const stored = readJson<Product[]>(PRODUCTS_KEY, fallback)
  return Array.isArray(stored) && stored.length > 0 ? stored : fallback
}

export function saveProducts(products: Product[]): void {
  writeJson(PRODUCTS_KEY, products)
}

export function loadCart(): CartItem[] {
  const stored = readJson<CartItem[]>(CART_KEY, [])
  return Array.isArray(stored) ? stored : []
}

export function saveCart(cart: CartItem[]): void {
  writeJson(CART_KEY, cart)
}

export function loadSettings(fallback: StoreSettings): StoreSettings {
  return { ...fallback, ...readJson<Partial<StoreSettings>>(SETTINGS_KEY, {}) }
}

export function saveSettings(settings: StoreSettings): void {
  writeJson(SETTINGS_KEY, settings)
}
