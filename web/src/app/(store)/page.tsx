import { Catalog } from "@/components/catalog"
import { Hero } from "@/components/Hero"
import { getStoreSettings, listCatalogPage, listCategories } from "@/db/queries"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [settings, initialPage, categories] = await Promise.all([
    getStoreSettings(),
    listCatalogPage(),
    listCategories(),
  ])
  const siteUrl = getSiteUrl()
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: initialPage.products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/producto/${product.id}`,
      name: product.nombre,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Hero hero={settings.hero} />
      <Catalog initialPage={initialPage} categories={categories} />
    </>
  )
}
