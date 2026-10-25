import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import { listAdminProducts } from "@/db/queries"

export const dynamic = "force-dynamic"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const products = await listAdminProducts()
  const product = products.find((item) => item.id === id)

  if (!product) notFound()

  const categories = Array.from(new Set(products.map((item) => item.categoria)))

  return <ProductForm product={product} categories={categories} />
}
