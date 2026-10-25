"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/toast-provider"
import { getMessagingInstance, readPublicPushConfig, type PublicPushConfig } from "@/lib/push-client"

const PUBLIC_CONFIG = readPublicPushConfig()

/**
 * Listens to Firebase messages while an admin page is open. The OS push is
 * handled by the service worker; this listener turns a foreground message into
 * an in-app toast and refreshes the notification bell immediately.
 */
export function ForegroundPushListener() {
  const { showToast } = useToast()
  const router = useRouter()
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const startingRef = useRef(false)

  useEffect(() => {
    const config = PUBLIC_CONFIG
    if (!config) return

    async function start(pushConfig: PublicPushConfig) {
      if (startingRef.current || unsubscribeRef.current) return
      if (typeof Notification === "undefined" || Notification.permission !== "granted") {
        return
      }

      startingRef.current = true

      try {
        const messaging = await getMessagingInstance(pushConfig.config)
        const { onMessage } = await import("firebase/messaging")

        unsubscribeRef.current = onMessage(messaging, (payload) => {
          const data = payload.data ?? {}
          const title = data.title ?? "Nuevo pedido"
          const body = data.body ?? ""
          const url = data.url ?? "/admin/pedidos"

          showToast(body ? `${title} — ${body}` : title, {
            label: "Ver",
            onClick: () => router.push(url),
          })
          window.dispatchEvent(new Event("admin-notifications:refresh"))
        })
      } catch (error) {
        console.error("Foreground push listener failed", error)
      } finally {
        startingRef.current = false
      }
    }

    void start(config)
    const onReady = () => void start(config)
    window.addEventListener("push:ready", onReady)

    return () => {
      window.removeEventListener("push:ready", onReady)
      unsubscribeRef.current?.()
      unsubscribeRef.current = null
    }
  }, [router, showToast])

  return null
}
