import type { Metadata } from "next"
import { StoreShell } from "@/components/store-shell"
import { getStoreSettings, listProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  const title = `${settings.store.name} — Cremas, camisas y moda para mujer en Honduras`
  const description = settings.store.description
  const image = settings.hero.image

  return {
    title: {
      default: title,
      template: `%s · ${settings.store.name}`,
    },
    description,
    openGraph: {
      title,
      description,
      siteName: settings.store.name,
      locale: "es_HN",
      type: "website",
      images: image
        ? [{ url: image, alt: settings.hero.imageAlt || settings.store.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, products] = await Promise.all([getStoreSettings(), listProducts()])

  return (
    <StoreShell settings={settings} products={products}>
      {children}
    </StoreShell>
  )
}
