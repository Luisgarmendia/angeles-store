import { StoreShell } from "@/components/store-shell"
import { getStoreSettings, listProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, products] = await Promise.all([getStoreSettings(), listProducts()])

  return (
    <StoreShell settings={settings} products={products}>
      {children}
    </StoreShell>
  )
}
