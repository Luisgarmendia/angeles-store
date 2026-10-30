"use client"

import Link from "next/link"
import { formatHonduranPhone } from "@/lib/phone"
import { socialHref } from "@/lib/social"
import { MessageIcon } from "./Icons"
import { useStoreSettings } from "./store-settings-provider"

const LEGAL_LINKS = [
  { href: "/categorias", label: "Categorías" },
  { href: "/privacidad", label: "Política de privacidad" },
  { href: "/terminos", label: "Términos y condiciones" },
  { href: "/envios-y-devoluciones", label: "Envíos y devoluciones" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
]

export function Footer() {
  const { store, whatsapp, instagram, facebook, tiktok } = useStoreSettings()
  const digits = whatsapp.replace(/\D/g, "")
  const socials = [
    { label: "Instagram", href: socialHref(instagram, "instagram") },
    { label: "Facebook", href: socialHref(facebook, "facebook") },
    { label: "TikTok", href: socialHref(tiktok, "tiktok") },
  ].filter((social) => social.href)

  return (
    <footer id="contacto" className="mt-16 border-t border-ink/10 bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl tracking-[0.16em] text-ink">
            {store.name.toUpperCase()}
          </p>
          {store.description && (
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {store.description}
            </p>
          )}
          {store.address && <p className="mt-3 text-sm text-muted">{store.address}</p>}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Contacto</p>
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-ink transition-colors hover:text-wine"
          >
            <MessageIcon className="h-4 w-4" />
            Escríbenos por WhatsApp
          </a>
          <p className="mt-1 text-xs text-muted">{formatHonduranPhone(whatsapp)}</p>
          {socials.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <div id="como-comprar">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Cómo comprar</p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li>1. Elige tus prendas y agrégalas al carrito.</li>
            <li>2. Completa tus datos de entrega.</li>
            <li>3. Envía el pedido por WhatsApp y coordinamos el pago y la entrega.</li>
          </ol>
        </div>

        <nav aria-label="Información">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Información</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-ink/10 px-4 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {store.name}. Cremas, camisas y moda femenina desde Honduras.
      </div>
    </footer>
  )
}
