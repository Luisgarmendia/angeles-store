import { describe, expect, it } from "vitest"
import { socialHref } from "./social"

describe("socialHref", () => {
  it("keeps a full URL as is", () => {
    expect(socialHref("https://instagram.com/angelesstores", "instagram")).toBe(
      "https://instagram.com/angelesstores",
    )
  })

  it("builds a link from an at-handle", () => {
    expect(socialHref("@angelesstores", "instagram")).toBe(
      "https://instagram.com/angelesstores",
    )
    expect(socialHref("@angelesstores", "tiktok")).toBe(
      "https://tiktok.com/@angelesstores",
    )
  })

  it("builds a link from a bare handle", () => {
    expect(socialHref("angelesstores", "facebook")).toBe(
      "https://facebook.com/angelesstores",
    )
  })

  it("returns an empty string when there is no value", () => {
    expect(socialHref("   ", "instagram")).toBe("")
  })
})
