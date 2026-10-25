export const ADMIN_ROLES = ["owner", "staff"] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export const ADMIN_ROLE_OPTIONS: ReadonlyArray<{ id: AdminRole; label: string }> = [
  { id: "owner", label: "Dueño" },
  { id: "staff", label: "Dependienta" },
]

export function isAdminRole(value: unknown): value is AdminRole {
  return value === "owner" || value === "staff"
}

export function roleLabel(role: AdminRole): string {
  return ADMIN_ROLE_OPTIONS.find((option) => option.id === role)?.label ?? role
}

export function canManageStore(role: AdminRole): boolean {
  return role === "owner"
}

export function canManageUsers(role: AdminRole): boolean {
  return role === "owner"
}
