import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/ProductDetail"
import { getProduct, getStoreSettings, listProductReviews, listRecommendations } from "@/db/queries"
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

  const [recommended, settings, reviews] = await Promise.all([
    listRecommendations(product),
    getStoreSettings(),
    listProductReviews(product.id),
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
    ...(reviews.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            ).toFixed(1),
            reviewCount: reviews.length,
          },
          review: reviews.map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.authorName },
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: review.body,
          })),
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/producto/${product.id}`,
      price: product.precio.toFixed(2),
      priceCurrency: "HNL",
      availability: "https://schema.org/InStock",
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        url: `${siteUrl}/envios-y-devoluciones`,
        applicableCountry: "HN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 2,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "HN",
        },
      },
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
      <ProductDetail product={product} recommended={recommended} reviews={reviews} />
    </>
  )
}
