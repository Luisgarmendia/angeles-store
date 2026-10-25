import type { CartItem, Product, StoreSettings } from "../types"

const PRODUCTS_KEY = "amapola.productos"
const CART_KEY = "amapola.carrito"
const SETTINGS_KEY = "amapola.config"
const VERSION_KEY = "amapola.data.version"

/**
 * Bump this when the seed catalog or the default settings change in a way that
 * must reach browsers that already stored the previous version.
 */
const DATA_VERSION = 2

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

/**
 * One-time migration for browsers that already ran the previous version:
 * refreshes the seed products, keeps products created by the owner, and
 * replaces the old Argentine placeholder phone while preserving a real one.
 */
export function migrateStorage(fallbackProducts: Product[], fallbackSettings: StoreSettings): void {
  const version = readJson<number>(VERSION_KEY, 0)
  if (version >= DATA_VERSION) return

  const storedProducts = readJson<Product[] | null>(PRODUCTS_KEY, null)
  if (Array.isArray(storedProducts) && storedProducts.length > 0) {
    const seedIds = new Set(fallbackProducts.map((product) => product.id))
    const customProducts = storedProducts.filter((product) => !seedIds.has(product.id))
    writeJson(PRODUCTS_KEY, [...fallbackProducts, ...customProducts])
  } else {
    writeJson(PRODUCTS_KEY, fallbackProducts)
  }

  const storedSettings = readJson<Partial<StoreSettings>>(SETTINGS_KEY, {})
  const storedPhone = typeof storedSettings.whatsapp === "string" ? storedSettings.whatsapp : ""
  const keepStoredPhone = storedPhone.length > 0 && !storedPhone.startsWith("54")

  writeJson(SETTINGS_KEY, {
    ...fallbackSettings,
    ...storedSettings,
    whatsapp: keepStoredPhone ? storedPhone : fallbackSettings.whatsapp,
  })

  writeJson(VERSION_KEY, DATA_VERSION)
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
