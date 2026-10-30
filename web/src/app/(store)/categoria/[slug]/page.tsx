import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Catalog } from "@/components/catalog"
import { listCatalogPage, listCategories } from "@/db/queries"
import { categorySlug } from "@/lib/category"
import { pageMetadata } from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

async function findCategory(slug: string) {
  const categories = await listCategories()
  return categories.find((category) => categorySlug(category.name) === slug) ?? null
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await findCategory(slug)

  if (!category) return { title: "Categoría no encontrada" }

  return pageMetadata({
    title: category.name,
    description: `Compra ${category.name.toLowerCase()} en Honduras. Productos seleccionados de Angeles Store's con pedido por WhatsApp.`,
    path: `/categoria/${slug}`,
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const categories = await listCategories()
  const category = categories.find((item) => categorySlug(item.name) === slug)

  if (!category) notFound()

  const initialPage = await listCatalogPage({
    filters: { category: category.name },
  })
  const siteUrl = getSiteUrl()
  const categoryUrl = `${siteUrl}/categoria/${slug}`
  const description = `Compra ${category.name.toLowerCase()} en Honduras. Productos seleccionados de Angeles Store's con pedido por WhatsApp.`

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${categoryUrl}#page`,
        name: category.name,
        description,
        url: categoryUrl,
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "ItemList",
        itemListElement: initialPage.products.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/producto/${product.id}`,
          name: product.nombre,
        })),
      },
      {
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
            name: category.name,
            item: categoryUrl,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <nav aria-label="Miga de pan" className="text-xs text-muted">
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
              <span aria-current="page" className="text-ink">
                {category.name}
              </span>
            </li>
          </ol>
        </nav>

        <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-muted">Categoría</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          {category.count} {category.count === 1 ? "producto" : "productos"} de{" "}
          {category.name.toLowerCase()} seleccionados para vos. Pedidos por WhatsApp a todo
          Honduras.
        </p>
      </section>

      <Catalog
        key={category.name}
        initialPage={initialPage}
        categories={categories}
        initialCategory={category.name}
        showIntro={false}
        showCategories={false}
      />
    </>
  )
}
