"use server"

import { deletePushToken, registerPushToken } from "@/db/queries"
import { requireAdmin } from "@/lib/auth"
import { isValidPushToken, sendTestPushNotification, type PushResult } from "@/lib/push"

export interface PushTokenActionResult {
  ok?: boolean
  error?: string
}

const INVALID_TOKEN_ERROR = "El token de notificaciones no es válido."
const SAVE_ERROR = "No se pudieron guardar las notificaciones. Intentá de nuevo."

export async function registerPushTokenAction(
  token: string,
): Promise<PushTokenActionResult> {
  const session = await requireAdmin()
  if (!isValidPushToken(token)) return { error: INVALID_TOKEN_ERROR }

  try {
    await registerPushToken(session.id, token)
    return { ok: true }
  } catch (error) {
    console.error("Push token registration failed", error)
    return { error: SAVE_ERROR }
  }
}

export async function unregisterPushTokenAction(
  token: string,
): Promise<PushTokenActionResult> {
  const session = await requireAdmin()
  if (!isValidPushToken(token)) return { error: INVALID_TOKEN_ERROR }

  try {
    await deletePushToken(session.id, token)
    return { ok: true }
  } catch (error) {
    console.error("Push token removal failed", error)
    return { error: SAVE_ERROR }
  }
}

export async function sendTestPushAction(): Promise<PushResult> {
  const session = await requireAdmin()
  return sendTestPushNotification(session.id)
}
