import type { CartItem, Customer, PaymentMethod, Product, StoreSettings } from "../types"

const PRODUCTS_KEY = "amapola.productos"
const CART_KEY = "amapola.carrito"
const SETTINGS_KEY = "amapola.config"
const CUSTOMER_KEY = "amapola.cliente"
const VERSION_KEY = "amapola.data.version"

/**
 * Bump this when the seed catalog or the default settings change in a way that
 * must reach browsers that already stored the previous version.
 */
const DATA_VERSION = 3

/** Seed IDs from the previous catalog. They are replaced, never kept as custom. */
const LEGACY_SEED_IDS = new Set(Array.from({ length: 12 }, (_, index) => `p${index + 1}`))

const PAYMENT_METHODS: PaymentMethod[] = ["contraentrega", "transferencia", "tarjeta", "efectivo"]

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
 * One-time migration for browsers that already ran a previous version:
 * refreshes the seed catalog, drops products from the legacy seed, keeps
 * products created by the owner, removes cart lines for products that no
 * longer exist, and replaces the old Argentine placeholder phone while
 * preserving a real one.
 */
export function migrateStorage(fallbackProducts: Product[], fallbackSettings: StoreSettings): void {
  const version = readJson<number>(VERSION_KEY, 0)
  if (version >= DATA_VERSION) return

  const storedProducts = readJson<Product[] | null>(PRODUCTS_KEY, null)
  const seedIds = new Set(fallbackProducts.map((product) => product.id))
  const storedList = Array.isArray(storedProducts) ? storedProducts : []
  const customProducts = storedList.filter(
    (product) => !seedIds.has(product.id) && !LEGACY_SEED_IDS.has(product.id),
  )
  const catalog = [...fallbackProducts, ...customProducts]
  writeJson(PRODUCTS_KEY, catalog)

  const availableIds = new Set(catalog.map((product) => product.id))
  const storedCart = readJson<CartItem[] | null>(CART_KEY, null)
  if (Array.isArray(storedCart)) {
    writeJson(
      CART_KEY,
      storedCart.filter((item) => availableIds.has(item.productId)),
    )
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

/**
 * Restores the last customer data so a returning buyer only reviews and
 * confirms it. Data never leaves this browser.
 */
export function loadCustomer(): Customer | null {
  const stored = readJson<Partial<Customer> | null>(CUSTOMER_KEY, null)
  if (!stored || typeof stored.nombre !== "string" || !stored.nombre.trim()) return null

  const payment = PAYMENT_METHODS.includes(stored.pago as PaymentMethod)
    ? (stored.pago as PaymentMethod)
    : "contraentrega"

  return {
    nombre: stored.nombre,
    direccion: typeof stored.direccion === "string" ? stored.direccion : "",
    telefono: typeof stored.telefono === "string" ? stored.telefono : "",
    pago: payment,
    notas: typeof stored.notas === "string" ? stored.notas : "",
  }
}

export function saveCustomer(customer: Customer): void {
  writeJson(CUSTOMER_KEY, customer)
}
