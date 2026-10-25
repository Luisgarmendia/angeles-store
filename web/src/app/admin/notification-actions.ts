"use server"

import {
  countUnreadNotifications,
  listAdminNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  type AdminNotification,
} from "@/db/queries"
import { requireAdmin } from "@/lib/auth"

export interface AdminNotificationsState {
  notifications: AdminNotification[]
  unreadCount: number
}

export async function listAdminNotificationsAction(): Promise<AdminNotificationsState> {
  const session = await requireAdmin()

  const [notifications, unreadCount] = await Promise.all([
    listAdminNotifications(session.id),
    countUnreadNotifications(session.id),
  ])

  return { notifications, unreadCount }
}

export async function markNotificationsReadAction(
  ids: string[],
): Promise<{ ok: true }> {
  const session = await requireAdmin()
  const validIds = Array.isArray(ids)
    ? ids.filter((id): id is string => typeof id === "string" && id.length > 0)
    : []

  await markNotificationsRead(session.id, validIds)
  return { ok: true }
}

export async function markAllNotificationsReadAction(): Promise<{ ok: true }> {
  const session = await requireAdmin()
  await markAllNotificationsRead(session.id)
  return { ok: true }
}
