import { describe, expect, it } from "vitest"
import { DEFAULT_SETTINGS, mergeSettings } from "./settings"

describe("mergeSettings", () => {
  it("fills store info for settings saved before the field existed", () => {
    const merged = mergeSettings({ whatsapp: "50499998888" })

    expect(merged.store.name).toBe(DEFAULT_SETTINGS.store.name)
    expect(merged.store.address).toBe(DEFAULT_SETTINGS.store.address)
    expect(merged.store.description).toBe(DEFAULT_SETTINGS.store.description)
  })

  it("keeps a partial store override and fills the rest", () => {
    const merged = mergeSettings({ store: { name: "Mi Tienda" } })

    expect(merged.store.name).toBe("Mi Tienda")
    expect(merged.store.address).toBe(DEFAULT_SETTINGS.store.address)
    expect(merged.store.description).toBe(DEFAULT_SETTINGS.store.description)
  })

  it("falls back to the default name when it is blank", () => {
    const merged = mergeSettings({ store: { name: "   " } })

    expect(merged.store.name).toBe(DEFAULT_SETTINGS.store.name)
  })
})
