import type { MetadataRoute } from "next"
import { listProductSitemapEntries } from "@/db/queries"

// Keep the sitemap request-time so the build never needs a database connection.
export const dynamic = "force-dynamic"

const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProductSitemapEntries()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terminos`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/envios-y-devoluciones`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/preguntas-frecuentes`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  const productRoutes = products.map(
    (product): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}/producto/${product.id}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }),
  )

  return [...staticRoutes, ...productRoutes]
}
