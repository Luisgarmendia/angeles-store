import { afterEach, describe, expect, it } from "vitest"
import { getSiteUrl } from "./site-url"

/**
 * Every absolute URL the site publishes — canonical tags, the sitemap, Open
 * Graph urls, and JSON-LD — is built from this value. A trailing slash or a
 * missing variable silently corrupts all of them, so the contract is pinned.
 */
afterEach(() => {
  delete process.env.SITE_URL
})

describe("getSiteUrl (SEO)", () => {
  it("strips trailing slashes so published URLs never double up", () => {
    process.env.SITE_URL = "https://angelesstore.styledflow.com/"

    expect(getSiteUrl()).toBe("https://angelesstore.styledflow.com")
  })

  it("strips repeated trailing slashes", () => {
    process.env.SITE_URL = "https://angelesstore.styledflow.com///"

    expect(getSiteUrl()).toBe("https://angelesstore.styledflow.com")
  })

  it("falls back to localhost when SITE_URL is unset", () => {
    delete process.env.SITE_URL

    expect(getSiteUrl()).toBe("http://localhost:3000")
  })

  it("treats a blank SITE_URL as unset instead of publishing an empty origin", () => {
    process.env.SITE_URL = "   "

    expect(getSiteUrl()).toBe("http://localhost:3000")
  })

  it("keeps a real origin untouched", () => {
    process.env.SITE_URL = "https://angelesstore.styledflow.com"

    expect(getSiteUrl()).toBe("https://angelesstore.styledflow.com")
  })
})
