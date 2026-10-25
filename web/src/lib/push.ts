import "server-only"

import type { ServiceAccount } from "firebase-admin/app"
import { deletePushTokens, listPushTokens } from "@/db/queries"
import { formatPrice } from "@/lib/format"

export interface OrderNotificationInput {
  orderId: string
  orderNumber: number
  customerName: string
  itemCount: number
  total: number
}

export interface OrderNotification {
  title: string
  body: string
  data: { url: string }
}

const INVALID_TOKEN_ERROR_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
])

export function isPushConfigured(): boolean {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  return typeof raw === "string" && raw.trim().length > 0
}

export function parseServiceAccount(raw: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(raw)

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON must be a JSON object.")
  }

  const account = parsed as Record<string, unknown>
  if (typeof account.private_key === "string") {
    account.private_key = account.private_key.replace(/\\n/g, "\n")
  }

  return account
}

export function isValidPushToken(token: unknown): token is string {
  return (
    typeof token === "string" &&
    token.length >= 20 &&
    token.length <= 4096 &&
    !/\s/.test(token)
  )
}

export function buildOrderNotification({
  orderId,
  orderNumber,
  customerName,
  itemCount,
  total,
}: OrderNotificationInput): OrderNotification {
  return {
    title: `Nuevo pedido #${orderNumber}`,
    body: `${customerName} · ${itemCount} producto(s) · ${formatPrice(total)}`,
    data: { url: `/admin/pedidos/${orderId}` },
  }
}

export async function sendOrderPushNotification(input: OrderNotificationInput): Promise<void> {
  try {
    if (!isPushConfigured()) return

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (!raw) return

    const tokens = await listPushTokens()
    if (tokens.length === 0) return

    const [{ cert, getApps, initializeApp }, { getMessaging }] = await Promise.all([
      import("firebase-admin/app"),
      import("firebase-admin/messaging"),
    ])

    const app =
      getApps()[0] ??
      initializeApp({
        credential: cert(parseServiceAccount(raw) as ServiceAccount),
      })

    const notification = buildOrderNotification(input)
    const siteUrl = (process.env.SITE_URL?.trim() || "http://localhost:3000").replace(/\/+$/, "")

    const response = await getMessaging(app).sendEachForMulticast({
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      webpush: {
        fcmOptions: { link: `${siteUrl}${notification.data.url}` },
      },
    })

    const invalidTokens: string[] = []
    response.responses.forEach((result, index) => {
      if (result.success) return
      const code = result.error?.code
      if (code && INVALID_TOKEN_ERROR_CODES.has(code)) invalidTokens.push(tokens[index])
    })

    if (invalidTokens.length > 0) await deletePushTokens(invalidTokens)
  } catch (error) {
    console.error("Order push notification failed", error)
  }
}
