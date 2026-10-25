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
  cartCount,
  cartLines,
  cartTotal,
  removeFromCart,
  setQuantity as setLineQuantity,
} from "@/lib/cart"
import type { CartItem, CartLine, Product } from "@/lib/types"

const CART_KEY = "amapola.carrito"

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

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      total,
      count,
      add: (productId, variantId, quantity = 1) =>
        setCart((current) => addToCart(current, productId, variantId, quantity)),
      remove: (productId, variantId) =>
        setCart((current) => removeFromCart(current, productId, variantId)),
      setQuantity: (productId, variantId, quantity) =>
        setCart((current) => setLineQuantity(current, productId, variantId, quantity)),
      clear: () => setCart([]),
    }),
    [lines, total, count],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
