import { ProductForm } from "@/components/admin/product-form"
import { listAdminProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const products = await listAdminProducts()
  const categories = Array.from(new Set(products.map((product) => product.categoria)))

  return <ProductForm categories={categories} />
}
