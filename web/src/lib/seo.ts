import type { Metadata } from "next"

export const SITE_NAME = "Angeles Store's"
export const DEFAULT_OG_IMAGE = "/og-default.png"
export const DEFAULT_OG_WIDTH = 1200
export const DEFAULT_OG_HEIGHT = 630

/**
 * Shared metadata for content pages. `title` stays brand-free so the store
 * layout template appends the store name exactly once.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string
  description: string
  path: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "es_HN",
      type: "website",
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          width: DEFAULT_OG_WIDTH,
          height: DEFAULT_OG_HEIGHT,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

/** Keeps product titles under ~60 chars instead of stacking the brand twice. */
export function productSeoTitle(name: string, storeName = SITE_NAME): string {
  const withBrand = `${name} | ${storeName}`
  return withBrand.length <= 62 ? withBrand : name
}
