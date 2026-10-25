"use client"

import { useState, type ReactNode } from "react"
import { config } from "@/lib/config"
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp"
import type { Customer, Product, StoreSettings } from "@/lib/types"
import { CartDrawer } from "./CartDrawer"
import { CheckoutModal } from "./CheckoutModal"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { StoreProvider, useCart } from "./store-provider"
import { ToastProvider, useToast } from "./toast-provider"

export function StoreShell({
  settings,
  products,
  children,
}: {
  settings: StoreSettings
  products: Product[]
  children: ReactNode
}) {
  return (
    <StoreProvider products={products}>
      <ToastProvider>
        <StoreChrome settings={settings}>{children}</StoreChrome>
      </ToastProvider>
    </StoreProvider>
  )
}

function StoreChrome({
  settings,
  children,
}: {
  settings: StoreSettings
  children: ReactNode
}) {
  const { lines, total, count, remove, setQuantity, clear } = useCart()
  const { showToast } = useToast()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  function handleCheckout(customer: Customer) {
    const message = buildOrderMessage({
      brandName: config.brand.name,
      customer,
      lines,
      total,
    })

    window.open(whatsappUrl(settings.whatsapp, message), "_blank", "noopener,noreferrer")
    clear()
    setCheckoutOpen(false)
    setCartOpen(false)
    showToast("Pedido listo. Envíalo por WhatsApp para confirmarlo.")
  }

  return (
    <>
      <Header cartCount={count} onCartOpen={() => setCartOpen(true)} />
      <main>{children}</main>
      <Footer settings={settings} />

      <CartDrawer
        open={cartOpen}
        lines={lines}
        total={total}
        onClose={() => setCartOpen(false)}
        onQuantity={(productId, quantity) => setQuantity(productId, quantity)}
        onRemove={remove}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        lines={lines}
        total={total}
        paymentMethods={settings.payments}
        onClose={() => setCheckoutOpen(false)}
        onSubmit={handleCheckout}
      />
    </>
  )
}
