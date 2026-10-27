import { beforeEach, describe, expect, it } from "vitest"
import { getSiteUrl } from "./site-url"

describe("getSiteUrl", () => {
  beforeEach(() => {
    delete process.env.SITE_URL
  })

  it("uses the public URL without trailing slashes", () => {
    process.env.SITE_URL = " https://angelesstore.styledflow.com/// "

    expect(getSiteUrl()).toBe("https://angelesstore.styledflow.com")
  })

  it("falls back to the local development URL", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000")
  })
})
