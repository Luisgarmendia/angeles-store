import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/ProductDetail"
import { getProduct, listRecommendations } from "@/db/queries"

export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) return { title: "Producto no encontrado" }

  return {
    title: product.nombre,
    description: product.descripcion,
    openGraph: {
      title: product.nombre,
      description: product.descripcion,
      images: product.imagen ? [product.imagen] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const recommended = await listRecommendations(product)

  return <ProductDetail product={product} recommended={recommended} />
}
