import { useEffect, useMemo, useState } from "react"
import seedProducts from "./data/productos.json"
import { config } from "./config"
import { AdminGate } from "./components/AdminGate"
import { AdminPanel } from "./components/AdminPanel"
import { CartDrawer } from "./components/CartDrawer"
import { CategoryFilter } from "./components/CategoryFilter"
import { CheckoutModal } from "./components/CheckoutModal"
import { Footer } from "./components/Footer"
import { Header } from "./components/Header"
import { Hero } from "./components/Hero"
import { ProductDetail } from "./components/ProductDetail"
import { ProductGrid } from "./components/ProductGrid"
import { SearchIcon } from "./components/Icons"
import { Toast, type ToastData } from "./components/Toast"
import {
  addToCart as addToCartLine,
  cartCount,
  cartLines,
  cartTotal,
  removeFromCart,
  setQuantity,
} from "./lib/cart"
import { recommendProducts } from "./lib/recommendations"
import { productIdFromHash } from "./lib/route"
import { lockAdmin } from "./lib/adminAuth"
import {
  loadCart,
  loadProducts,
  loadSettings,
  migrateStorage,
  saveCart,
  saveProducts,
  saveSettings,
} from "./lib/storage"
import { buildOrderMessage, whatsappUrl } from "./lib/whatsapp"
import type { CartItem, Customer, Product, StoreSettings } from "./types"

const SEED_PRODUCTS = seedProducts as Product[]
const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp: config.contact.whatsapp,
  instagram: config.contact.instagram,
  facebook: config.contact.facebook,
  tiktok: config.contact.tiktok,
}

migrateStorage(SEED_PRODUCTS, DEFAULT_SETTINGS)

type ToastState = ToastData & { id: number }

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => loadProducts(SEED_PRODUCTS))
  const [settings, setSettings] = useState<StoreSettings>(() => loadSettings(DEFAULT_SETTINGS))
  const [cart, setCart] = useState<CartItem[]>(() => loadCart())
  const [view, setView] = useState<"store" | "admin">("store")
  const [productRoute, setProductRoute] = useState<string | null>(() =>
    productIdFromHash(window.location.hash),
  )
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("Todos")
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => saveProducts(products), [products])
  useEffect(() => saveCart(cart), [cart])
  useEffect(() => saveSettings(settings), [settings])

  useEffect(() => {
    const syncRoute = () => setProductRoute(productIdFromHash(window.location.hash))
    window.addEventListener("hashchange", syncRoute)
    return () => window.removeEventListener("hashchange", syncRoute)
  }, [])

  useEffect(() => {
    if (productRoute) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
      return
    }
    const hash = window.location.hash
    if (!hash) return
    const target = document.getElementById(decodeURIComponent(hash.slice(1)))
    target?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [productRoute])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 4500)
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

  const selectedProduct = useMemo(
    () => (productRoute ? (products.find((product) => product.id === productRoute) ?? null) : null),
    [products, productRoute],
  )

  const recommended = useMemo(
    () => (selectedProduct ? recommendProducts(products, selectedProduct.id, 4) : []),
    [products, selectedProduct],
  )

  const lines = useMemo(() => cartLines(cart, products), [cart, products])
  const total = useMemo(() => cartTotal(cart, products), [cart, products])
  const itemCount = useMemo(() => cartCount(cart), [cart])

  function showToast(message: string, action?: { label: string; onClick: () => void }) {
    setToast({
      id: Date.now(),
      message,
      actionLabel: action?.label,
      onAction: action?.onClick,
    })
  }

  function handleAdd(productId: string, quantity = 1) {
    const product = products.find((candidate) => candidate.id === productId)
    setCart((current) => addToCartLine(current, productId, quantity))
    const name = product ? (quantity > 1 ? `${product.nombre} × ${quantity}` : product.nombre) : null
    showToast(name ? `${name} se agregó a tu carrito.` : "Producto agregado.", {
      label: "Ver carrito",
      onClick: () => setCartOpen(true),
    })
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
    showToast("Pedido listo. Envíalo por WhatsApp para confirmarlo.")
  }

  function handleSaveProduct(product: Product) {
    setProducts((current) => {
      const exists = current.some((candidate) => candidate.id === product.id)
      return exists
        ? current.map((candidate) => (candidate.id === product.id ? product : candidate))
        : [product, ...current]
    })
    showToast("Producto guardado.")
  }

  function handleDeleteProduct(productId: string) {
    setProducts((current) => current.filter((product) => product.id !== productId))
    setCart((current) => removeFromCart(current, productId))
    showToast("Producto eliminado.")
  }

  function handleImport(imported: Product[]) {
    setProducts(imported)
    setCategory("Todos")
    showToast(`${imported.length} productos importados.`)
  }

  const toastNode = toast ? <Toast toast={toast} onClose={() => setToast(null)} /> : null

  if (view === "admin") {
    return (
      <>
        <AdminGate onExit={() => setView("store")}>
          <AdminPanel
            products={products}
            settings={settings}
            onClose={() => setView("store")}
            onLock={() => {
              lockAdmin()
              setView("store")
            }}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
            onSaveSettings={(next) => {
              setSettings(next)
              showToast("Ajustes guardados.")
            }}
            onImport={handleImport}
          />
        </AdminGate>
        {toastNode}
      </>
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
        {selectedProduct ? (
          <ProductDetail
            key={selectedProduct.id}
            product={selectedProduct}
            recommended={recommended}
            onAdd={handleAdd}
          />
        ) : (
          <>
            <Hero />

            <section id="catalogo" className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
              <div className="flex flex-col gap-5 border-t border-ink/10 pt-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                      Cremas y camisas
                    </p>
                    <h2 className="font-display text-4xl text-ink">La colección</h2>
                  </div>
                  <p className="max-w-sm text-sm leading-relaxed text-muted">
                    Cremas, camisas y piezas elegidas una por una. Entra al detalle y agrégalas a tu
                    carrito.
                  </p>
                </div>

                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Busca cremas, camisas, vestidos…"
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
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "producto" : "productos"}
                </p>

                <ProductGrid
                  products={filteredProducts}
                  onAdd={handleAdd}
                  onClearFilters={() => {
                    setSearch("")
                    setCategory("Todos")
                  }}
                />
              </div>
            </section>
          </>
        )}
      </main>

      <Footer settings={settings} />

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
        lines={lines}
        total={total}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckout}
      />

      {toastNode}
    </div>
  )
}
