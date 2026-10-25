import "server-only"

import { createAdminNotifications, listAdminUserIds } from "@/db/queries"
import {
  buildOrderNotification,
  sendOrderPushNotification,
  type OrderNotificationInput,
} from "@/lib/push"

export async function createInAppOrderNotifications(
  input: OrderNotificationInput,
): Promise<void> {
  const userIds = await listAdminUserIds()
  if (userIds.length === 0) return

  const notification = buildOrderNotification(input)

  await createAdminNotifications(
    userIds.map((userId) => ({
      userId,
      orderId: input.orderId,
      title: notification.title,
      body: notification.body,
      url: `/admin/pedidos/${input.orderId}`,
    })),
  )
}

export async function notifyNewOrder(input: OrderNotificationInput): Promise<void> {
  try {
    await createInAppOrderNotifications(input)
  } catch (error) {
    console.error("In-app order notification failed", error)
  }

  await sendOrderPushNotification(input)
}
