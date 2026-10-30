import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/ProductDetail"
import { getProduct, getStoreSettings, listProductReviews, listRecommendations } from "@/db/queries"
import { categoryPath } from "@/lib/category"
import { productShareDescription, productShareTitle } from "@/lib/product-share"
import { getSiteUrl } from "@/lib/site-url"
import { productSeoTitle } from "@/lib/seo"
import { isSoldOut } from "@/lib/stock"

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
    title: { absolute: productSeoTitle(product.nombre, settings.store.name) },
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

  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/producto/${product.id}`
  const categoryUrl = `${siteUrl}${categoryPath(product.categoria)}`
  const image = product.imagen || settings.hero.image
  const availability = isSoldOut(product)
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock"
  const prices = [
    product.precio,
    ...product.variants
      .map((variant) => variant.precio)
      .filter((price): price is number => price !== null),
  ]
  const lowPrice = Math.min(...prices)
  const highPrice = Math.max(...prices)
  const offerBase = {
    url: productUrl,
    priceCurrency: "HNL",
    availability,
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
  }
  const offers =
    lowPrice === highPrice
      ? {
          "@type": "Offer",
          ...offerBase,
          price: lowPrice.toFixed(2),
        }
      : {
          "@type": "AggregateOffer",
          ...offerBase,
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          offerCount: prices.length,
        }

  const productSchema = {
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.nombre,
    description: product.descripcion,
    category: product.categoria,
    sku: product.id,
    itemCondition: "https://schema.org/NewCondition",
    url: productUrl,
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
            datePublished: review.createdAt,
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
    offers,
  }

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categorías",
        item: `${siteUrl}/categorias`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.categoria,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.nombre,
        item: productUrl,
      },
    ],
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [productSchema, breadcrumbSchema],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav
        aria-label="Miga de pan"
        className="mx-auto max-w-6xl px-4 pt-6 text-xs text-muted sm:px-6"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/categorias" className="transition-colors hover:text-ink">
              Categorías
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={categoryPath(product.categoria)}
              className="transition-colors hover:text-ink"
            >
              {product.categoria}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="text-ink">
              {product.nombre}
            </span>
          </li>
        </ol>
      </nav>
      <ProductDetail product={product} recommended={recommended} reviews={reviews} />
    </>
  )
}
