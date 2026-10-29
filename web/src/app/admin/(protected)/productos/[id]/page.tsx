import { notFound } from "next/navigation"
import { ProductForm } from "@/components/admin/product-form"
import { ProductReviewsForm } from "@/components/admin/product-reviews-form"
import { listAdminProducts, listProductReviews } from "@/db/queries"

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
  const reviews = await listProductReviews(product.id)

  return (
    <>
      <ProductForm product={product} categories={categories} />
      <div className="mx-auto max-w-2xl">
        <ProductReviewsForm productId={product.id} reviews={reviews} />
      </div>
    </>
  )
}
