import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("@/db/queries", () => ({
  listPushTokens: vi.fn(async () => []),
  deletePushTokens: vi.fn(async () => undefined),
  updateOrderPushResult: vi.fn(async () => undefined),
}))

import { listPushTokens, updateOrderPushResult } from "@/db/queries"
import { formatPrice } from "./format"
import {
  buildOrderNotification,
  isPushConfigured,
  isValidPushToken,
  parseServiceAccount,
  sendOrderPushNotification,
} from "./push"

const originalServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

const notificationInput = {
  orderId: "0f6a1c3e-8b5d-4c2a-9e7f-1a2b3c4d5e6f",
  orderNumber: 42,
  customerName: "María López",
  itemCount: 3,
  total: 1250.5,
}

beforeEach(() => {
  vi.mocked(listPushTokens).mockClear()
  vi.mocked(updateOrderPushResult).mockClear()
})

afterEach(() => {
  if (originalServiceAccount === undefined) {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  } else {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalServiceAccount
  }
})

describe("buildOrderNotification", () => {
  it("builds the admin order notification", () => {
    const notification = buildOrderNotification(notificationInput)

    expect(notification.title).toBe("Nuevo pedido #42")
    expect(notification.body).toBe(`María López · 3 producto(s) · ${formatPrice(1250.5)}`)
    expect(notification.data).toEqual({
      url: "/admin/pedidos/0f6a1c3e-8b5d-4c2a-9e7f-1a2b3c4d5e6f",
    })
  })
})

describe("isValidPushToken", () => {
  it("accepts tokens between 20 and 4096 characters without whitespace", () => {
    expect(isValidPushToken("a".repeat(20))).toBe(true)
    expect(isValidPushToken("b".repeat(4096))).toBe(true)
  })

  it("rejects short, long, whitespace-containing, and non-string tokens", () => {
    expect(isValidPushToken("a".repeat(19))).toBe(false)
    expect(isValidPushToken("a".repeat(4097))).toBe(false)
    expect(isValidPushToken(`${"a".repeat(10)} ${"a".repeat(10)}`)).toBe(false)
    expect(isValidPushToken(`${"a".repeat(10)}\n${"a".repeat(10)}`)).toBe(false)
    expect(isValidPushToken(undefined)).toBe(false)
    expect(isValidPushToken(12345678901234567890)).toBe(false)
  })
})

describe("isPushConfigured", () => {
  it("is false when the service account is missing or blank", () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    expect(isPushConfigured()).toBe(false)

    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = "   "
    expect(isPushConfigured()).toBe(false)
  })

  it("is true when the service account is present", () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{"project_id":"demo"}'
    expect(isPushConfigured()).toBe(true)
  })
})

describe("parseServiceAccount", () => {
  it("parses the JSON and converts escaped newlines in the private key", () => {
    const parsed = parseServiceAccount(
      JSON.stringify({
        project_id: "demo",
        client_email: "firebase@demo.iam.gserviceaccount.com",
        private_key: "line1\\nline2",
      }),
    )

    expect(parsed.project_id).toBe("demo")
    expect(parsed.client_email).toBe("firebase@demo.iam.gserviceaccount.com")
    expect(parsed.private_key).toBe("line1\nline2")
  })

  it("rejects invalid JSON", () => {
    expect(() => parseServiceAccount("not json")).toThrow()
  })
})

describe("sendOrderPushNotification", () => {
  it("records a skipped result when push is not configured", async () => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON

    const result = await sendOrderPushNotification(notificationInput)

    expect(result).toMatchObject({
      successCount: 0,
      failureCount: 0,
      error: "Firebase no configurado",
    })
    expect(listPushTokens).not.toHaveBeenCalled()
    expect(updateOrderPushResult).toHaveBeenCalledWith(notificationInput.orderId, {
      sentAt: null,
      successCount: 0,
      failureCount: 0,
      error: "Firebase no configurado",
    })
  })

  it("records a skipped result when there are no subscribed devices", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{"project_id":"demo"}'
    vi.mocked(listPushTokens).mockResolvedValueOnce([])

    const result = await sendOrderPushNotification(notificationInput)

    expect(result).toMatchObject({ error: "Sin dispositivos suscritos" })
    expect(updateOrderPushResult).toHaveBeenCalledWith(notificationInput.orderId, {
      sentAt: null,
      successCount: 0,
      failureCount: 0,
      error: "Sin dispositivos suscritos",
    })
  })

  it("records a failed result and swallows errors instead of failing the order", async () => {
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '{"project_id":"demo"}'
    vi.mocked(listPushTokens).mockRejectedValueOnce(new Error("database down"))
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await sendOrderPushNotification(notificationInput)

    expect(result).toMatchObject({
      successCount: 0,
      failureCount: 0,
      error: "No se pudo enviar la notificación.",
    })
    expect(consoleError).toHaveBeenCalled()
    expect(updateOrderPushResult).toHaveBeenCalledWith(notificationInput.orderId, {
      sentAt: null,
      successCount: 0,
      failureCount: 0,
      error: "No se pudo enviar la notificación.",
    })
    consoleError.mockRestore()
  })
})
