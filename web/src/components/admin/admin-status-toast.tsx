"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useToast } from "@/components/toast-provider"

const MESSAGES: Record<string, string> = {
  status: "Estado del pedido actualizado.",
  payment: "Estado del pago actualizado.",
}

/**
 * Shows a toast after the status redirect and removes the `ok` query param so
 * refreshing the page does not repeat the message.
 */
export function AdminStatusToast({ ok }: { ok?: string }) {
  const { showToast } = useToast()
  const pathname = usePathname()
  const router = useRouter()
  const shown = useRef(false)

  useEffect(() => {
    if (shown.current) return

    const message = ok ? MESSAGES[ok] : undefined
    if (!message) return

    shown.current = true
    showToast(message)
    router.replace(pathname, { scroll: false })
  }, [ok, pathname, router, showToast])

  return null
}
