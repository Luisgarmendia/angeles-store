import { Catalog } from "@/components/catalog"
import { Hero } from "@/components/Hero"
import { getStoreSettings, listCatalogPage, listCategories } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [settings, initialPage, categories] = await Promise.all([
    getStoreSettings(),
    listCatalogPage(),
    listCategories(),
  ])

  return (
    <>
      <Hero hero={settings.hero} />
      <Catalog initialPage={initialPage} categories={categories} />
    </>
  )
}
