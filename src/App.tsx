import { useEffect, useMemo, useState } from "react"
import seedProducts from "./data/productos.json"
import { config } from "./config"
import { AdminPanel } from "./components/AdminPanel"
import { CartDrawer } from "./components/CartDrawer"
import { CategoryFilter } from "./components/CategoryFilter"
import { CheckoutModal } from "./components/CheckoutModal"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { ProductGrid } from "./components/ProductGrid"
import { SearchIcon } from "./components/Icons"
import {
  addToCart as addToCartLine,
  cartCount,
  cartLines,
  cartTotal,
  removeFromCart,
  setQuantity,
} from "./lib/cart"
import {
  loadCart,
  loadProducts,
  loadSettings,
  saveCart,
  saveProducts,
  saveSettings,
} from "./lib/storage"
import { buildOrderMessage, whatsappUrl } from "./lib/whatsapp"
import type { CartItem, Customer, Product, StoreSettings } from "./types"

const SEED_PRODUCTS = seedProducts as Product[]
const DEFAULT_SETTINGS: StoreSettings = { whatsapp: config.contact.whatsapp }

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => loadProducts(SEED_PRODUCTS))
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings(DEFAULT_SETTINGS))
  const [cart, setCart] = useState<CartItem[]>(() => loadCart())
  const [view, setView] = useState<"store" | "admin">("store")
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => saveProducts(products), [products])
  useEffect(() => saveCart(cart), [cart])
  useEffect(() => saveSettings(settings), [settings])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.categoria)))],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = category === "Todos" || product.categoria === category
      const matchesTerm =
        !term ||
        product.nombre.toLowerCase().includes(term) ||
        product.descripcion.toLowerCase().includes(term)
      return matchesCategory && matchesTerm
    })
  }, [products, search, category])

  const lines = useMemo(() => cartLines(cart, products), [cart, products])
  const total = useMemo(() => cartTotal(cart, products), [cart, products])
  const itemCount = useMemo(() => cartCount(cart), [cart])

  function handleAdd(productId: string) {
    setCart((current) => addToCartLine(current, productId))
    setCartOpen(true)
  }

  function handleCheckout(customer: Customer) {
    const message = buildOrderMessage({
      brandName: config.brand.name,
      customer,
      lines,
      total,
    })

    window.open(whatsappUrl(settings.whatsapp, message), "_blank", "noopener,noreferrer")
    setCart([])
    setCheckoutOpen(false)
    setCartOpen(false)
    setToast("Pedido preparado. Terminá de enviarlo en WhatsApp.")
  }

  function handleSaveProduct(product: Product) {
    setProducts((current) => {
      const exists = current.some((candidate) => candidate.id === product.id)
      return exists
        ? current.map((candidate) => (candidate.id === product.id ? product : candidate))
        : [product, ...current]
    })
    setToast("Producto guardado.")
  }

  function handleDeleteProduct(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId))
    setCart((current) => removeFromCart(current, productId))
    setToast("Producto eliminado.")
  }

  function handleImport(imported: Product[]) {
    setProducts(imported)
    setCategory("Todos")
    setToast(`${imported.length} productos importados.`)
  }

  if (view === "admin") {
    return (
      <AdminPanel
        products={products}
        settings={settings}
        onClose={() => setView("store")}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onSaveSettings={(next) => {
          setSettings(next)
          setToast("Número de WhatsApp actualizado.")
        }}
        onImport={handleImport}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        cartCount={itemCount}
        onCartOpen={() => setCartOpen(true)}
        onAdminOpen={() => setView("admin")}
      />

      <main>
        <Hero />

        <section id="catalogo" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <div className="flex flex-col gap-5 border-t border-ink/10 pt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Nueva temporada</p>
                <h2 className="font-display text-4xl text-ink">La colección</h2>
              </div>
              <p className="max-w-sm text-sm text-muted">
                Prendas y accesorios elegidos uno por uno. Si te enamorás de algo, sumalo al carrito.
              </p>
            </div>

            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar vestidos, carteras, accesorios…"
                className="w-full rounded-full border border-ink/15 bg-white/60 py-3 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
                aria-label="Buscar productos"
              />
            </div>

            <CategoryFilter
              categories={categories}
              active={category}
              onChange={setCategory}
            />

            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>

            <ProductGrid products={filteredProducts} onAdd={handleAdd} />
          </div>
        </section>
      </main>

      <Footer whatsapp={settings.whatsapp} />

      <CartDrawer
        open={cartOpen}
        lines={lines}
        total={total}
        onClose={() => setCartOpen(false)}
        onQuantity={(productId, quantity) =>
          setCart((current) => setQuantity(current, productId, quantity))
        }
        onRemove={(productId) => setCart((current) => removeFromCart(current, productId))}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        total={total}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckout}
      />

      {toast && (
        <div
          className="fixed bottom-5 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-ink px-5 py-3 text-center text-sm text-cream shadow-xl"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
