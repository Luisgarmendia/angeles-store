import Link from "next/link"
import { listCategories } from "@/db/queries"
import { categoryPath } from "@/lib/category"
import { pageMetadata } from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"

export const metadata = pageMetadata({
  title: "Categorías",
  description:
    "Explora todas las categorías de Angeles Store's: cremas, camisas, vestidos, bolsos, perfumes y más, con pedido por WhatsApp en Honduras.",
  path: "/categorias",
})

export default async function CategoriesPage() {
  const categories = await listCategories()
  const siteUrl = getSiteUrl()
  const description =
    "Explora todas las categorías de Angeles Store's: cremas, camisas, vestidos, bolsos, perfumes y más, con pedido por WhatsApp en Honduras."

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/categorias#page`,
        name: "Categorías",
        description,
        url: `${siteUrl}/categorias`,
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
      {
        "@type": "ItemList",
        itemListElement: categories.map((category, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}${categoryPath(category.name)}`,
          name: category.name,
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
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Miga de pan" className="text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="transition-colors hover:text-ink">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span aria-current="page" className="text-ink">
                Categorías
              </span>
            </li>
          </ol>
        </nav>

        <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-muted">Catálogo</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">Categorías</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Explora todo lo que tenemos para vos. Cada categoría reúne las piezas disponibles y
          podés pedirlas por WhatsApp.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={categoryPath(category.name)}
              className="group rounded-2xl border border-ink/10 bg-white/60 p-4 transition-colors hover:border-ink/30 hover:bg-white"
            >
              <span className="block font-display text-xl leading-tight text-ink">
                {category.name}
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                {category.count} {category.count === 1 ? "producto" : "productos"}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
