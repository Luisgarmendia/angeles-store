import { describe, expect, it } from "vitest"
import {
  ADMIN_ROLE_OPTIONS,
  canManageStore,
  canManageUsers,
  isAdminRole,
  roleLabel,
} from "./roles"

describe("admin roles", () => {
  it("exposes the two roles with their Spanish labels", () => {
    expect(ADMIN_ROLE_OPTIONS.map((option) => option.id)).toEqual(["owner", "staff"])
    expect(ADMIN_ROLE_OPTIONS.map((option) => option.label)).toEqual(["Dueño", "Dependienta"])
    expect(roleLabel("owner")).toBe("Dueño")
    expect(roleLabel("staff")).toBe("Dependienta")
  })

  it("recognizes only owner and staff", () => {
    expect(isAdminRole("owner")).toBe(true)
    expect(isAdminRole("staff")).toBe(true)
    expect(isAdminRole("admin")).toBe(false)
    expect(isAdminRole("")).toBe(false)
    expect(isAdminRole(null)).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
  })

  it("only lets owners manage the store and users", () => {
    expect(canManageStore("owner")).toBe(true)
    expect(canManageStore("staff")).toBe(false)
    expect(canManageUsers("owner")).toBe(true)
    expect(canManageUsers("staff")).toBe(false)
  })
})
