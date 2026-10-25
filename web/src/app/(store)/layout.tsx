import type { Metadata } from "next"
import { StoreShell } from "@/components/store-shell"
import { getStoreSettings, listProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()

  return {
    title: {
      default: `${settings.store.name} — Cremas, camisas y moda para mujer en Honduras`,
      template: `%s · ${settings.store.name}`,
    },
    description: settings.store.description,
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
