"use client"

import { useState, type ReactNode } from "react"
import { createOrderAction } from "@/app/(store)/actions"
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp"
import type { Customer, Product, StoreSettings } from "@/lib/types"
import { CartDrawer } from "./CartDrawer"
import { CheckoutModal } from "./CheckoutModal"
import { CherryBlossomBackground } from "./CherryBlossomBackground"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { OrderConfirmationModal, type OrderConfirmation } from "./OrderConfirmationModal"
import { StoreProvider, useCart } from "./store-provider"
import { StoreSettingsProvider, useStoreSettings } from "./store-settings-provider"
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
    <StoreSettingsProvider settings={settings}>
      <StoreProvider products={products}>
        <ToastProvider>
          <StoreChrome>{children}</StoreChrome>
        </ToastProvider>
      </StoreProvider>
    </StoreSettingsProvider>
  )
}

function StoreChrome({ children }: { children: ReactNode }) {
  const settings = useStoreSettings()
  const { lines, total, count, remove, setQuantity, clear } = useCart()
  const { showToast } = useToast()
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null)

  async function handleCheckout(customer: Customer) {
    const popup = window.open("about:blank", "_blank")

    const result = await createOrderAction({
      customer,
      items: lines.map((line) => ({
        productId: line.product.id,
        variantId: line.variantId,
        quantity: line.quantity,
      })),
    })

    if (result.error) {
      popup?.close()
      return { error: result.error }
    }
    if (
      result.id === undefined ||
      !result.lines ||
      result.total === undefined ||
      result.number === undefined
    ) {
      popup?.close()
      return { error: "No se pudo registrar el pedido. Intentá de nuevo." }
    }

    const message = buildOrderMessage({
      brandName: settings.store.name,
      customer,
      lines: result.lines,
      total: result.total,
      orderNumber: result.number,
    })
    const url = whatsappUrl(settings.whatsapp, message)

    setConfirmation({
      id: result.id,
      number: result.number,
      lines: result.lines,
      total: result.total,
      customer,
      whatsappUrl: url,
      createdAt: new Date(),
    })
    clear()
    setCheckoutOpen(false)
    setCartOpen(false)
    showToast("Pedido confirmado. Guardá tu comprobante.")

    try {
      if (popup && !popup.closed) {
        popup.location.href = url
      } else {
        window.location.href = url
      }
    } catch {
      window.location.href = url
    }

    return {}
  }

  return (
    <>
      <CherryBlossomBackground />
      <div className="relative z-10">
        <Header cartCount={count} onCartOpen={() => setCartOpen(true)} />
        <main>{children}</main>
        <Footer />
      </div>

      <CartDrawer
        open={cartOpen}
        lines={lines}
        total={total}
        onClose={() => setCartOpen(false)}
        onQuantity={(productId, variantId, quantity) =>
          setQuantity(productId, variantId, quantity)
        }
        onRemove={(productId, variantId) => remove(productId, variantId)}
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

      <OrderConfirmationModal
        confirmation={confirmation}
        onClose={() => setConfirmation(null)}
      />
    </>
  )
}
