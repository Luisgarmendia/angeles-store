import type { Metadata } from "next"
import { StoreShell } from "@/components/store-shell"
import { getStoreSettings } from "@/db/queries"
import { normalizeHonduranPhone } from "@/lib/phone"
import { socialHref } from "@/lib/social"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings()
  const title = `${settings.store.name} | Tienda de cremas, camisas y moda femenina en Honduras`
  const description =
    "Compra cremas, camisas y moda femenina en Honduras. Descubre productos seleccionados y coordina tu pedido por WhatsApp."
  const image = settings.hero.image

  return {
    title: {
      default: title,
      template: `%s | ${settings.store.name}`,
    },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      siteName: settings.store.name,
      locale: "es_HN",
      type: "website",
      url: "/",
      images: image
        ? [{ url: image, alt: settings.hero.imageAlt || settings.store.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings()

  const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")
  const telephone = normalizeHonduranPhone(settings.whatsapp)
  const sameAs = [
    socialHref(settings.instagram, "instagram"),
    socialHref(settings.facebook, "facebook"),
    socialHref(settings.tiktok, "tiktok"),
  ].filter(Boolean)

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: settings.store.name,
        description: settings.store.description,
        url: siteUrl,
        ...(settings.store.address
          ? {
              address: {
                "@type": "PostalAddress",
                streetAddress: settings.store.address,
                addressCountry: "HN",
              },
            }
          : {}),
        ...(telephone ? { telephone: `+${telephone}` } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.store.name,
        description: settings.store.description,
        inLanguage: "es-HN",
        publisher: { "@id": `${siteUrl}/#organization` },
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
      <StoreShell settings={settings}>
        {children}
      </StoreShell>
    </>
  )
}
