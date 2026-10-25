"use server"

import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getDb } from "@/db"
import { countOwners } from "@/db/queries"
import { adminUsers } from "@/db/schema"
import { requireOwner } from "@/lib/auth"
import { isAdminRole } from "@/lib/roles"

export interface UserFormState {
  error?: string
  ok?: string
}

const USERS_PATH = "/admin/usuarios"
const MIN_PASSWORD_LENGTH = 12
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  )
}

export async function createAdminUserAction(
  _previous: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireOwner()

  const email = text(formData, "email").toLowerCase()
  const password = String(formData.get("password") ?? "")
  const roleValue = text(formData, "role")

  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Escribí un email válido." }
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` }
  }
  if (!isAdminRole(roleValue)) {
    return { error: "Elegí un rol válido." }
  }

  try {
    await getDb()
      .insert(adminUsers)
      .values({
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: roleValue,
      })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "Ya existe un usuario con ese email." }
    }
    return { error: "No se pudo crear el usuario." }
  }

  revalidatePath(USERS_PATH)
  return { ok: `Usuario ${email} creado.` }
}

export async function updateAdminRoleAction(formData: FormData): Promise<void> {
  await requireOwner()

  const id = text(formData, "id")
  const roleValue = text(formData, "role")

  if (!id || !isAdminRole(roleValue)) redirect(`${USERS_PATH}?error=invalid`)

  const [target] = await getDb()
    .select({ id: adminUsers.id, role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1)

  if (!target) redirect(`${USERS_PATH}?error=invalid`)

  if (target.role === "owner" && roleValue !== "owner" && (await countOwners()) <= 1) {
    redirect(`${USERS_PATH}?error=last-owner`)
  }

  await getDb().update(adminUsers).set({ role: roleValue }).where(eq(adminUsers.id, id))

  revalidatePath(USERS_PATH)
  redirect(`${USERS_PATH}?ok=role`)
}

export async function resetAdminPasswordAction(formData: FormData): Promise<void> {
  await requireOwner()

  const id = text(formData, "id")
  const password = String(formData.get("password") ?? "")

  if (!id) redirect(`${USERS_PATH}?error=invalid`)
  if (password.length < MIN_PASSWORD_LENGTH) redirect(`${USERS_PATH}?error=password`)

  const updated = await getDb()
    .update(adminUsers)
    .set({ passwordHash: await bcrypt.hash(password, 12) })
    .where(eq(adminUsers.id, id))
    .returning({ id: adminUsers.id })

  if (updated.length === 0) redirect(`${USERS_PATH}?error=invalid`)

  revalidatePath(USERS_PATH)
  redirect(`${USERS_PATH}?ok=password`)
}

export async function deleteAdminUserAction(formData: FormData): Promise<void> {
  const session = await requireOwner()

  const id = text(formData, "id")
  if (!id) redirect(`${USERS_PATH}?error=invalid`)
  if (id === session.id) redirect(`${USERS_PATH}?error=self`)

  const [target] = await getDb()
    .select({ id: adminUsers.id, role: adminUsers.role })
    .from(adminUsers)
    .where(eq(adminUsers.id, id))
    .limit(1)

  if (!target) redirect(`${USERS_PATH}?error=invalid`)

  if (target.role === "owner" && (await countOwners()) <= 1) {
    redirect(`${USERS_PATH}?error=last-owner`)
  }

  await getDb().delete(adminUsers).where(eq(adminUsers.id, id))

  revalidatePath(USERS_PATH)
  redirect(`${USERS_PATH}?ok=deleted`)
}
