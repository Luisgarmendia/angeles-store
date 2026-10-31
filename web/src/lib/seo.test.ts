import { describe, expect, it } from "vitest"
import { DEFAULT_OG_IMAGE, pageMetadata, productSeoTitle } from "./seo"

describe("pageMetadata (SEO)", () => {
  it("emits a canonical path and the same path as the social url", () => {
    const meta = pageMetadata({
      title: "Privacidad",
      description: "Cómo tratamos tus datos.",
      path: "/privacidad",
    })

    expect(meta.alternates?.canonical).toBe("/privacidad")
    expect(meta.openGraph?.url).toBe("/privacidad")
  })

  it("keeps the brand out of the title so the layout template appends it once", () => {
    const meta = pageMetadata({
      title: "Preguntas frecuentes",
      description: "Envíos, pagos y devoluciones.",
      path: "/preguntas-frecuentes",
    })

    expect(meta.title).toBe("Preguntas frecuentes")
    expect(String(meta.title)).not.toContain("Angeles Store's")
  })

  it("always ships a social preview image and a large twitter card", () => {
    const meta = pageMetadata({ title: "t", description: "d", path: "/x" })

    expect(meta.openGraph?.images).toBeDefined()
    const twitter = meta.twitter as Record<string, unknown> | undefined
    expect(twitter?.card).toBe("summary_large_image")
    expect(twitter?.images).toEqual([DEFAULT_OG_IMAGE])
  })

  it("declares the Honduran locale so search engines do not geo-guess", () => {
    const meta = pageMetadata({ title: "t", description: "d", path: "/x" })

    expect(meta.openGraph?.locale).toBe("es_HN")
  })
})

describe("productSeoTitle (SEO)", () => {
  it("appends the store name when the result stays inside the SERP limit", () => {
    expect(productSeoTitle("Crema", "Tienda")).toBe("Crema | Tienda")
  })

  it("drops the brand instead of truncating the product name", () => {
    const long = "x".repeat(70)

    expect(productSeoTitle(long)).toBe(long)
  })

  it("keeps the whole title at or under 62 characters whenever it adds the brand", () => {
    const name = "x".repeat(40)

    const title = productSeoTitle(name, "Tienda")

    if (title !== name) expect(title.length).toBeLessThanOrEqual(62)
  })
})
