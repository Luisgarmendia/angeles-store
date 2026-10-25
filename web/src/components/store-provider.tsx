"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  addToCart,
  capLineQuantity,
  cartCount,
  cartLines,
  cartTotal,
  removeFromCart,
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
  add: (productId: string, variantId: string | null, quantity?: number) => void
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

export function StoreProvider({
  products,
  children,
}: {
  products: Product[]
  children: ReactNode
}) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_KEY)
      if (raw) setCart(JSON.parse(raw) as CartItem[])
    } catch {
      // Ignore a corrupted cart; the store still works.
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {
      // Private mode or full storage.
    }
  }, [cart, hydrated])

  const lines = useMemo(() => cartLines(cart, products), [cart, products])
  const total = useMemo(() => cartTotal(cart, products), [cart, products])
  const count = useMemo(() => cartCount(cart), [cart])
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      total,
      count,
      add: (productId, variantId, quantity = 1) =>
        setCart((current) =>
          capLineQuantity(
            addToCart(current, productId, variantId, quantity),
            productId,
            variantId,
            purchasableLimit(productsById, productId, variantId),
          ),
        ),
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
    [lines, total, count, productsById],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
