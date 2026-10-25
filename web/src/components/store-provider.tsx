"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { getProductsByIdsAction } from "@/app/(store)/actions"
import {
  addToCart,
  capLineQuantity,
  cartCount,
  cartLines,
  cartTotal,
  removeFromCart,
  sanitizeCart,
  setQuantity as setLineQuantity,
} from "@/lib/cart"
import { maxPurchasable } from "@/lib/stock"
import type { CartItem, CartLine, Product } from "@/lib/types"

const CART_KEY = "amapola.carrito"

function purchasableLimit(
  products: Map<string, Product>,
  productId: string,
  variantId: string | null,
): number | null {
  const product = products.get(productId)
  return product ? maxPurchasable(product, variantId) : null
}

interface CartContextValue {
  lines: CartLine[]
  total: number
  count: number
  /** False until the local cart finished hydrating its products. */
  ready: boolean
  add: (product: Product, variantId: string | null, quantity?: number) => void
  remove: (productId: string, variantId: string | null) => void
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used inside StoreProvider")
  return context
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [productsById, setProductsById] = useState<Map<string, Product>>(() => new Map())
  const [hydrated, setHydrated] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let items: CartItem[] = []
    try {
      const raw = window.localStorage.getItem(CART_KEY)
      if (raw) items = sanitizeCart(JSON.parse(raw))
    } catch {
      items = []
    }

    // Hydration must happen after mount: localStorage does not exist during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(items)
    setHydrated(true)

    const ids = [...new Set(items.map((item) => item.productId))]
    if (ids.length === 0) {
      setReady(true)
      return
    }

    getProductsByIdsAction(ids)
      .then((products) => {
        setProductsById((current) => {
          const next = new Map(current)
          for (const product of products) next.set(product.id, product)
          return next
        })
      })
      .catch(() => {
        // The cart still renders whatever was already loaded.
      })
      .finally(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {
      // Private mode or full storage.
    }
  }, [cart, hydrated])

  const productList = useMemo(() => Array.from(productsById.values()), [productsById])
  const lines = useMemo(() => cartLines(cart, productList), [cart, productList])
  const total = useMemo(() => cartTotal(cart, productList), [cart, productList])
  const count = useMemo(() => cartCount(cart), [cart])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      total,
      count,
      ready,
      add: (product, variantId, quantity = 1) => {
        setProductsById((current) => {
          if (current.get(product.id) === product) return current
          const next = new Map(current)
          next.set(product.id, product)
          return next
        })
        setCart((current) =>
          capLineQuantity(
            addToCart(current, product.id, variantId, quantity),
            product.id,
            variantId,
            maxPurchasable(product, variantId),
          ),
        )
      },
      remove: (productId, variantId) =>
        setCart((current) => removeFromCart(current, productId, variantId)),
      setQuantity: (productId, variantId, quantity) =>
        setCart((current) =>
          capLineQuantity(
            setLineQuantity(current, productId, variantId, quantity),
            productId,
            variantId,
            purchasableLimit(productsById, productId, variantId),
          ),
        ),
      clear: () => setCart([]),
    }),
    [lines, total, count, ready, productsById],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
