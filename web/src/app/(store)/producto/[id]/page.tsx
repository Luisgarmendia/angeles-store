import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/ProductDetail"
import { getProduct, getStoreSettings, listRecommendations } from "@/db/queries"
import { productShareDescription, productShareTitle } from "@/lib/product-share"

export const dynamic = "force-dynamic"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) return { title: "Producto no encontrado" }

  const settings = await getStoreSettings()
  const image = product.imagen || settings.hero.image
  const title = productShareTitle(product)
  const description = productShareDescription(product)

  return {
    title,
    description,
    alternates: {
      canonical: `/producto/${product.id}`,
    },
    openGraph: {
      title,
      description,
      url: `/producto/${product.id}`,
      siteName: settings.store.name,
      locale: "es_HN",
      type: "website",
      images: image ? [{ url: image, alt: product.nombre }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    other: {
      "product:price:amount": product.precio.toString(),
      "product:price:currency": "HNL",
      "product:category": product.categoria,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const [recommended, settings] = await Promise.all([
    listRecommendations(product),
    getStoreSettings(),
  ])

  const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const image = product.imagen || settings.hero.image
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    description: product.descripcion,
    category: product.categoria,
    brand: {
      "@type": "Brand",
      name: settings.store.name,
    },
    ...(image ? { image: [image] } : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/producto/${product.id}`,
      price: product.precio.toFixed(2),
      priceCurrency: "HNL",
      availability: "https://schema.org/InStock",
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetail product={product} recommended={recommended} />
    </>
  )
}
