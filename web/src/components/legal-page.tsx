import Link from "next/link"
import type { ReactNode } from "react"
import { formatHonduranPhone } from "@/lib/phone"
import type { StoreSettings } from "@/lib/types"

const DEFAULT_UPDATED_AT = "25 de octubre de 2026"

interface LegalPageProps {
  title: string
  intro: string
  updatedAt?: string
  children: ReactNode
}

/** Shared shell for the public legal and help pages. */
export function LegalPage({
  title,
  intro,
  updatedAt = DEFAULT_UPDATED_AT,
  children,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Información</p>
      <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">{title}</h1>
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">
        Última actualización: {updatedAt}
      </p>
      <p className="mt-6 text-base leading-relaxed text-muted">{intro}</p>

      <div className={proseClass}>{children}</div>

      <div className="mt-12 border-t border-ink/10 pt-6">
        <Link
          href="/#catalogo"
          className="inline-flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm transition-colors hover:bg-ink hover:text-cream"
        >
          Volver al catálogo
        </Link>
      </div>
    </article>
  )
}

/** Contact details shared by the legal pages, sourced from the live store settings. */
export function StoreContactDetails({ settings }: { settings: StoreSettings }) {
  const digits = settings.whatsapp.replace(/\D/g, "")

  return (
    <ul className="mt-3 space-y-1.5">
      <li>
        <span className="font-medium text-ink">Tienda:</span> {settings.store.name}
      </li>
      {settings.store.address && (
        <li>
          <span className="font-medium text-ink">Dirección:</span> {settings.store.address}
        </li>
      )}
      <li>
        <span className="font-medium text-ink">WhatsApp:</span>{" "}
        <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer">
          {formatHonduranPhone(settings.whatsapp)}
        </a>
      </li>
    </ul>
  )
}

const proseClass =
  "mt-8 space-y-5 text-sm leading-relaxed text-muted [&_a]:text-wine [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-ink [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_li]:pl-1 [&_p]:leading-relaxed [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
