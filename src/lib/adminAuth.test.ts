import { beforeEach, describe, expect, it, vi } from "vitest"
import { isValidPin, saveAdminPin, verifyAdminPin } from "./adminAuth"

const store = new Map<string, string>()

vi.stubGlobal("localStorage", {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
})

beforeEach(() => {
  store.clear()
})

describe("isValidPin", () => {
  it("accepts 4 to 8 digits", () => {
    expect(isValidPin("1234")).toBe(true)
    expect(isValidPin("12345678")).toBe(true)
  })

  it("rejects short, long or non-numeric keys", () => {
    expect(isValidPin("123")).toBe(false)
    expect(isValidPin("123456789")).toBe(false)
    expect(isValidPin("12ab")).toBe(false)
  })
})

describe("admin pin storage", () => {
  it("stores a hash instead of the pin and verifies it", async () => {
    expect(await saveAdminPin("2468")).toBe(true)

    const stored = store.get("amapola.admin.pin")
    expect(stored).toBeTruthy()
    expect(stored).not.toBe("2468")
    expect(await verifyAdminPin("2468")).toBe(true)
    expect(await verifyAdminPin("1357")).toBe(false)
  })

  it("refuses to save an invalid pin", async () => {
    expect(await saveAdminPin("12")).toBe(false)
    expect(store.has("amapola.admin.pin")).toBe(false)
  })

  it("rejects verification when no pin was configured", async () => {
    expect(await verifyAdminPin("2468")).toBe(false)
  })
})
