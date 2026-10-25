import { describe, expect, it } from "vitest"
import manifest from "./manifest"

describe("web app manifest", () => {
  it("declares an installable standalone app with the required icons", () => {
    const app = manifest()

    expect(app.start_url).toBe("/")
    expect(app.scope).toBe("/")
    expect(app.display).toBe("standalone")
    expect(app.theme_color).toBe("#faf7f2")

    const sizes = app.icons?.map((icon) => icon.sizes)
    expect(sizes).toEqual(expect.arrayContaining(["192x192", "512x512"]))
  })

  it("includes a maskable icon for Android adaptive masks", () => {
    const app = manifest()
    const maskable = app.icons?.filter((icon) => icon.purpose === "maskable")

    expect(maskable).toHaveLength(1)
    expect(maskable?.[0]?.sizes).toBe("512x512")
  })
})
