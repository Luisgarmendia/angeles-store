import "server-only"

import type { ServiceAccount } from "firebase-admin/app"
import { deletePushTokens, listPushTokens, updateOrderPushResult } from "@/db/queries"
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
    data: { url: `/pedido/${orderId}` },
  }
}

export interface PushResult {
  successCount: number
  failureCount: number
  invalidCount: number
  error?: string
}

async function recordPushResult(
  orderId: string,
  result: {
    sentAt: Date | null
    successCount: number
    failureCount: number
    error: string | null
  },
): Promise<void> {
  try {
    await updateOrderPushResult(orderId, result)
  } catch (error) {
    console.error("Push result update failed", error)
  }
}

export async function sendOrderPushNotification(input: OrderNotificationInput): Promise<PushResult> {
  try {
    if (!isPushConfigured()) {
      const error = "Firebase no configurado"
      await recordPushResult(input.orderId, {
        sentAt: null,
        successCount: 0,
        failureCount: 0,
        error,
      })
      console.info(`[push] order #${input.orderNumber} skipped: ${error}`)
      return { successCount: 0, failureCount: 0, invalidCount: 0, error }
    }

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (!raw) {
      return { successCount: 0, failureCount: 0, invalidCount: 0, error: "Firebase no configurado" }
    }

    const tokens = await listPushTokens()
    if (tokens.length === 0) {
      const error = "Sin dispositivos suscritos"
      await recordPushResult(input.orderId, {
        sentAt: null,
        successCount: 0,
        failureCount: 0,
        error,
      })
      console.info(`[push] order #${input.orderNumber} skipped: ${error}`)
      return { successCount: 0, failureCount: 0, invalidCount: 0, error }
    }

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

    const error =
      response.failureCount > 0
        ? "Algunos dispositivos no recibieron la notificación."
        : null

    await recordPushResult(input.orderId, {
      sentAt: new Date(),
      successCount: response.successCount,
      failureCount: response.failureCount,
      error,
    })
    console.info(
      `[push] order #${input.orderNumber}: success=${response.successCount} failure=${response.failureCount} invalid=${invalidTokens.length}`,
    )

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidCount: invalidTokens.length,
      ...(error ? { error } : {}),
    }
  } catch (error) {
    console.error("Order push notification failed", error)
    const message = "No se pudo enviar la notificación."
    await recordPushResult(input.orderId, {
      sentAt: null,
      successCount: 0,
      failureCount: 0,
      error: message,
    })
    return { successCount: 0, failureCount: 0, invalidCount: 0, error: message }
  }
}
