import { Catalog } from "@/components/catalog"
import { Hero } from "@/components/Hero"
import { getStoreSettings, listProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [settings, products] = await Promise.all([getStoreSettings(), listProducts()])

  return (
    <>
      <Hero hero={settings.hero} />
      <Catalog products={products} />
    </>
  )
}
