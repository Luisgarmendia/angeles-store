"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { getDb } from "@/db"
import { adminUsers } from "@/db/schema"
import { createSession, verifyPassword } from "@/lib/auth"
import { canAttempt, clearAttempts, recordFailure } from "@/lib/rate-limit"

export interface LoginState {
  error?: string
}

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length === 0) {
    return { error: "Escribí un email y una contraseña válidos." }
  }

  const forwarded = (await headers()).get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || "local"
  const keys = [`ip:${ip}`, `email:${email}`]

  if (!keys.every(canAttempt)) {
    return { error: "Demasiados intentos. Esperá 15 minutos e intentá de nuevo." }
  }

  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1)

  const valid = user ? await verifyPassword(password, user.passwordHash) : false

  if (!user || !valid) {
    for (const key of keys) recordFailure(key)
    return { error: "Email o contraseña incorrectos." }
  }

  for (const key of keys) clearAttempts(key)
  await createSession(user.id)
  redirect("/admin")
}
