import type { FirebaseOptions } from "firebase/app"
import type { Messaging } from "firebase/messaging"

export interface PublicPushConfig {
  config: FirebaseOptions
  vapidKey: string
}

export const PUSH_APP_NAME = "angeles-push"

export function readPublicPushConfig(): PublicPushConfig | null {
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

export async function getMessagingInstance(config: FirebaseOptions): Promise<Messaging> {
  const [{ getApps, initializeApp }, { getMessaging }] = await Promise.all([
    import("firebase/app"),
    import("firebase/messaging"),
  ])

  const app =
    getApps().find((candidate) => candidate.name === PUSH_APP_NAME) ??
    initializeApp(config, PUSH_APP_NAME)

  return getMessaging(app)
}
