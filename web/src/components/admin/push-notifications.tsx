"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { FirebaseOptions } from "firebase/app"
import type { Messaging } from "firebase/messaging"
import {
  registerPushTokenAction,
  unregisterPushTokenAction,
} from "@/app/admin/push-actions"
import { BellIcon } from "@/components/Icons"

type PushStatus =
  | "unconfigured"
  | "unsupported"
  | "default"
  | "denied"
  | "saving"
  | "granted"
  | "error"

interface PublicPushConfig {
  config: FirebaseOptions
  vapidKey: string
}

const PUSH_APP_NAME = "angeles-push"

function readPublicPushConfig(): PublicPushConfig | null {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

  if (!raw?.trim() || !vapidKey?.trim()) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null

    const config = parsed as Record<string, unknown>
    for (const key of ["apiKey", "projectId", "messagingSenderId", "appId"]) {
      if (typeof config[key] !== "string" || !(config[key] as string).trim()) return null
    }

    return { config: config as FirebaseOptions, vapidKey: vapidKey.trim() }
  } catch {
    return null
  }
}

const PUBLIC_CONFIG = readPublicPushConfig()

async function getMessagingInstance(config: FirebaseOptions): Promise<Messaging> {
  const [{ getApps, initializeApp }, { getMessaging }] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ])

  const app =
    getApps().find((candidate) => candidate.name === PUSH_APP_NAME) ??
    initializeApp(config, PUSH_APP_NAME)

  return getMessaging(app)
}

export function PushNotifications() {
  const [status, setStatus] = useState<PushStatus>(
    PUBLIC_CONFIG ? "default" : "unconfigured",
  )
  const [message, setMessage] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const messagingRef = useRef<Messaging | null>(null)
  const startedRef = useRef(false)

  const enablePush = useCallback(async (requestPermission: boolean) => {
    if (!PUBLIC_CONFIG) return

    setStatus("saving")
    setMessage(null)

    try {
      if (typeof Notification === "undefined") {
        setStatus("unsupported")
        return
      }

      const permission = requestPermission
        ? await Notification.requestPermission()
        : Notification.permission

      if (permission === "denied") {
        setStatus("denied")
        return
      }
      if (permission !== "granted") {
        setStatus("default")
        return
      }

      const [{ getToken, isSupported }, messaging] = await Promise.all([
        import("firebase/messaging"),
        getMessagingInstance(PUBLIC_CONFIG.config),
      ])

      if (!(await isSupported())) {
        setStatus("unsupported")
        return
      }

      messagingRef.current = messaging

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      )
      const token = await getToken(messaging, {
        vapidKey: PUBLIC_CONFIG.vapidKey,
        serviceWorkerRegistration: registration,
      })

      if (!token) {
        setStatus("error")
        setMessage("No se pudo obtener el token de notificaciones.")
        return
      }

      const result = await registerPushTokenAction(token)
      if (result.error) {
        setStatus("error")
        setMessage(result.error)
        return
      }

      tokenRef.current = token
      setStatus("granted")
      setMessage("Notificaciones activadas en este dispositivo.")
    } catch (error) {
      console.error("Push notification setup failed", error)
      setStatus("error")
      setMessage("No se pudieron activar las notificaciones. Intentá de nuevo.")
    }
  }, [])

  const disablePush = useCallback(async () => {
    if (!PUBLIC_CONFIG) return

    setStatus("saving")
    setMessage(null)

    try {
      const [{ deleteToken }, messaging] = await Promise.all([
        import("firebase/messaging"),
        messagingRef.current
          ? Promise.resolve(messagingRef.current)
          : getMessagingInstance(PUBLIC_CONFIG.config),
      ])

      try {
        await deleteToken(messaging)
      } catch (error) {
        console.error("Push token deletion failed", error)
      }

      const token = tokenRef.current
      if (token) {
        const result = await unregisterPushTokenAction(token)
        if (result.error) {
          setStatus("error")
          setMessage(result.error)
          return
        }
      }

      tokenRef.current = null
      setStatus("default")
      setMessage(null)
    } catch (error) {
      console.error("Push notification removal failed", error)
      tokenRef.current = null
      setStatus("default")
      setMessage(null)
    }
  }, [])

  useEffect(() => {
    if (!PUBLIC_CONFIG || startedRef.current) return
    startedRef.current = true

    let cancelled = false

    async function checkSupport() {
      try {
        const { isSupported } = await import("firebase/messaging")

        if (!(await isSupported()) || typeof Notification === "undefined") {
          if (!cancelled) setStatus("unsupported")
          return
        }

        if (Notification.permission === "denied") {
          if (!cancelled) setStatus("denied")
          return
        }

        if (Notification.permission === "granted") {
          await enablePush(false)
          return
        }

        if (!cancelled) setStatus("default")
      } catch (error) {
        console.error("Push notification support check failed", error)
        if (!cancelled) setStatus("unsupported")
      }
    }

    void checkSupport()

    return () => {
      cancelled = true
    }
  }, [enablePush])

  const busy = status === "saving"
  const canToggle = status === "default" || status === "granted" || status === "error"

  const feedback =
    status === "unconfigured"
      ? "Firebase no está configurado."
      : status === "unsupported"
        ? "Este navegador no admite notificaciones push."
        : status === "denied"
          ? "El navegador bloqueó las notificaciones. Habilitalas en los permisos del sitio."
          : status === "granted"
            ? message ?? "Notificaciones activadas en este dispositivo."
            : status === "error"
              ? message ?? "No se pudieron activar las notificaciones. Intentá de nuevo."
              : status === "saving"
                ? "Activando notificaciones…"
                : "Activá los avisos para recibir cada pedido nuevo en este dispositivo."

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-ink">
            <BellIcon className="h-5 w-5" />
          </span>

          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Avisos</p>
            <h3 className="font-display text-xl text-ink">Notificaciones de pedidos</h3>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Recibí un aviso en este dispositivo cada vez que entre un pedido nuevo.
            </p>
            <p
              className={`mt-2 text-sm ${
                status === "error"
                  ? "text-wine"
                  : status === "granted"
                    ? "text-ink"
                    : "text-muted"
              }`}
              role={status === "error" ? "alert" : "status"}
            >
              {feedback}
            </p>
          </div>
        </div>

        {canToggle && (
          <button
            type="button"
            onClick={() => {
              if (status === "granted") {
                void disablePush()
              } else {
                void enablePush(true)
              }
            }}
            disabled={busy}
            className={
              status === "granted"
                ? "shrink-0 rounded-full border border-ink/20 px-5 py-2 text-sm text-muted transition-colors hover:border-wine hover:text-wine disabled:cursor-not-allowed disabled:opacity-60"
                : "shrink-0 rounded-full bg-ink px-5 py-2 text-sm font-medium text-cream transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-60"
            }
          >
            {busy
              ? "Guardando…"
              : status === "granted"
                ? "Desactivar"
                : status === "error"
                  ? "Intentar de nuevo"
                  : "Activar notificaciones"}
          </button>
        )}
      </div>
    </section>
  )
}
