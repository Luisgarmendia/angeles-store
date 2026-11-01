"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  listAdminNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationsReadAction,
} from "@/app/admin/notification-actions"
import { BellIcon } from "@/components/Icons"
import { useToast } from "@/components/toast-provider"
import type { AdminNotification } from "@/db/queries"

const POLL_INTERVAL_MS = 15_000
const PANEL_ID = "admin-notification-panel"

const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function formatNotificationDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return dateFormatter.format(date)
}

function badgeLabel(count: number): string {
  return count > 9 ? "9+" : String(count)
}

export function NotificationBell() {
  const router = useRouter()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)
  const seenIdsRef = useRef<Set<string>>(new Set())

  const refresh = useCallback(async () => {
    try {
      const result = await listAdminNotificationsAction()
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)

      if (!initializedRef.current) {
        initializedRef.current = true
        for (const notification of result.notifications) {
          seenIdsRef.current.add(notification.id)
        }
        return
      }

      const newestUnread = result.notifications.find(
        (notification) => notification.readAt === null,
      )
      const isNew = newestUnread ? !seenIdsRef.current.has(newestUnread.id) : false

      for (const notification of result.notifications) {
        seenIdsRef.current.add(notification.id)
      }

      if (newestUnread && isNew) {
        showToast(newestUnread.title, {
          label: "Ver",
          onClick: () => router.push(newestUnread.url),
        })
      }
    } catch (error) {
      console.error("Notification refresh failed", error)
    } finally {
      setLoading(false)
    }
  }, [router, showToast])

  useEffect(() => {
    // Defer the first poll so its setState lands after the effect returns
    // instead of cascading an extra render on mount.
    const initial = window.setTimeout(() => void refresh(), 0)
    const interval = window.setInterval(() => void refresh(), POLL_INTERVAL_MS)
    const onFocus = () => void refresh()
    window.addEventListener("focus", onFocus)

    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
      window.removeEventListener("focus", onFocus)
    }
  }, [refresh])

  useEffect(() => {
    const onRefresh = () => void refresh()
    window.addEventListener("admin-notifications:refresh", onRefresh)

    return () => {
      window.removeEventListener("admin-notifications:refresh", onRefresh)
    }
  }, [refresh])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const openNotification = useCallback(
    async (notification: AdminNotification) => {
      setOpen(false)

      if (notification.readAt === null) {
        const readAt = new Date().toISOString()
        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? { ...item, readAt } : item)),
        )
        setUnreadCount((count) => Math.max(0, count - 1))

        try {
          await markNotificationsReadAction([notification.id])
        } catch (error) {
          console.error("Mark notification read failed", error)
        }
      }

      router.push(notification.url)
    },
    [router],
  )

  const markAll = useCallback(async () => {
    try {
      await markAllNotificationsReadAction()
    } catch (error) {
      console.error("Mark all notifications read failed", error)
      return
    }

    const readAt = new Date().toISOString()
    setNotifications((current) =>
      current.map((item) => (item.readAt === null ? { ...item, readAt } : item)),
    )
    setUnreadCount(0)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label="Notificaciones"
        className="relative rounded-full border border-ink/20 p-2.5 text-ink transition-colors hover:border-ink hover:bg-sand"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-wine px-1 text-[10px] font-medium text-cream">
            {badgeLabel(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          id={PANEL_ID}
          className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-ink/10 bg-cream shadow-xl sm:left-auto sm:right-0"
        >
          <div className="flex items-center justify-between gap-2 border-b border-ink/10 px-4 py-3">
            <p className="font-display text-lg text-ink">Notificaciones</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAll()}
                className="text-xs text-muted transition-colors hover:text-ink"
              >
                Marcar todas
              </button>
            )}
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-muted" role="status">
              Cargando notificaciones…
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">Sin notificaciones.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-ink/10 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void openNotification(notification)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-sand"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.readAt === null ? "bg-wine" : "bg-transparent"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">
                        {notification.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {notification.body}
                      </span>
                      <span className="mt-1 block text-[11px] uppercase tracking-[0.12em] text-muted">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
