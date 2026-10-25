import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  values: vi.fn(),
  hash: vi.fn(),
  requireOwner: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }))
vi.mock("@/lib/auth", () => ({ requireOwner: mocks.requireOwner }))
vi.mock("@/db", () => ({ getDb: () => ({ insert: mocks.insert }) }))
vi.mock("@/db/queries", () => ({ countOwners: vi.fn() }))
vi.mock("bcryptjs", () => ({ default: { hash: mocks.hash } }))

import { createAdminUserAction } from "./actions"

function form(values: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) data.set(key, value)
  return data
}

describe("createAdminUserAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.insert.mockReturnValue({ values: mocks.values })
    mocks.values.mockResolvedValue(undefined)
    mocks.hash.mockResolvedValue("$2b$12$hash")
    mocks.requireOwner.mockResolvedValue({
      id: "owner-id",
      email: "owner@example.com",
      role: "owner",
    })
  })

  it("reports a duplicate email when Postgres 23505 arrives through Drizzle's cause", async () => {
    mocks.values.mockRejectedValue(
      Object.assign(new Error("Failed query"), { cause: { code: "23505" } }),
    )

    const result = await createAdminUserAction(
      {},
      form({ email: "existing@example.com", password: "123456789012", role: "staff" }),
    )

    expect(result).toEqual({ error: "Ya existe un usuario con ese email." })
  })

  it("normalizes the email to lowercase and keeps the requested role", async () => {
    const result = await createAdminUserAction(
      {},
      form({ email: "  Mixed@Example.COM  ", password: "123456789012", role: "staff" }),
    )

    expect(mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({ email: "mixed@example.com", role: "staff" }),
    )
    expect(result).toEqual({ ok: "Usuario mixed@example.com creado." })
  })
})
