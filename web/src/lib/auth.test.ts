import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  rows: [] as Array<{ id: string; email: string; role: "owner" | "staff" }>,
  cookie: vi.fn(),
  redirect: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.cookie }),
}))
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }))
vi.mock("@/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({ limit: async () => mocks.rows }),
        }),
      }),
    }),
  }),
}))
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn() } }))

import { requireAdmin, requireOwner } from "./auth"

describe("admin role guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rows = []
    mocks.cookie.mockReturnValue({ value: "session-token" })
    mocks.redirect.mockImplementation((url: string) => {
      throw new Error(`redirect:${url}`)
    })
  })

  it("returns the session from requireAdmin for staff", async () => {
    mocks.rows = [{ id: "u1", email: "staff@example.com", role: "staff" }]

    await expect(requireAdmin()).resolves.toMatchObject({ role: "staff" })
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it("redirects unauthenticated users to login", async () => {
    mocks.cookie.mockReturnValue(undefined)

    await expect(requireOwner()).rejects.toThrow("redirect:/admin/login")
  })

  it("redirects staff to the forbidden dashboard", async () => {
    mocks.rows = [{ id: "u1", email: "staff@example.com", role: "staff" }]

    await expect(requireOwner()).rejects.toThrow("redirect:/admin?error=forbidden")
  })

  it("returns the session for owners", async () => {
    mocks.rows = [{ id: "u1", email: "owner@example.com", role: "owner" }]

    await expect(requireOwner()).resolves.toMatchObject({ role: "owner" })
  })
})
