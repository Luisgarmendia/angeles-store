import "server-only"

import { createHash, randomBytes } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { and, eq, gt, lt } from "drizzle-orm"
import { getDb } from "@/db"
import { adminSessions, adminUsers } from "@/db/schema"
import { canManageStore, type AdminRole } from "@/lib/roles"

const COOKIE_NAME = "angeles_admin"
const SESSION_DAYS = 7

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash)
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export async function createSession(userId: string): Promise<void> {
  const db = getDb()
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()))

  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.insert(adminSessions).values({ id: hashToken(token), userId, expiresAt })

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  })
}

export interface AdminSession {
  id: string
  email: string
  role: AdminRole
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null

  const db = getDb()
  const rows = await db
    .select({ id: adminUsers.id, email: adminUsers.email, role: adminUsers.role })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(and(eq(adminSessions.id, hashToken(token)), gt(adminSessions.expiresAt, new Date())))
    .limit(1)

  return rows[0] ?? null
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")
  return session
}

export async function requireOwner(): Promise<AdminSession> {
  const session = await requireAdmin()
  if (!canManageStore(session.role)) redirect("/admin?error=forbidden")
  return session
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value

  if (token) {
    await getDb().delete(adminSessions).where(eq(adminSessions.id, hashToken(token)))
  }

  store.delete(COOKIE_NAME)
}
