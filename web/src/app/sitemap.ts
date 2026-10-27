import type { MetadataRoute } from "next"
import { listProductSitemapEntries } from "@/db/queries"
import { getSiteUrl } from "@/lib/site-url"

// Keep the sitemap request-time so the build never needs a database connection.
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProductSitemapEntries()
  const now = new Date()
  const siteUrl = getSiteUrl()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/envios-y-devoluciones`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${siteUrl}/preguntas-frecuentes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  const productRoutes = products.map(
    (product): MetadataRoute.Sitemap[number] => ({
      url: `${siteUrl}/producto/${encodeURIComponent(product.id)}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  )

  return [...staticRoutes, ...productRoutes]
}
