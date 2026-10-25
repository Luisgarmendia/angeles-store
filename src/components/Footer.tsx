import { config } from "../config"
import { formatHonduranPhone } from "../lib/phone"
import { MessageIcon } from "./Icons"

interface FooterProps {
  whatsapp: string
}

export function Footer({ whatsapp }: FooterProps) {
  const digits = whatsapp.replace(/\D/g, "")

  return (
    <footer id="contacto" className="mt-16 border-t border-ink/10 bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-[0.22em] text-ink">
            {config.brand.name.toUpperCase()}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {config.brand.description}
          </p>
          <p className="mt-3 text-sm text-muted">Tegucigalpa, Honduras</p>
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
          <a
            href={config.contact.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-sm text-muted transition-colors hover:text-ink"
          >
            Instagram
          </a>
        </div>

        <div id="como-comprar">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Cómo comprar</p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li>1. Elige tus prendas y agrégalas al carrito.</li>
            <li>2. Completa tus datos de entrega.</li>
            <li>3. Envía el pedido por WhatsApp y coordinamos el pago y la entrega.</li>
          </ol>
        </div>
      </div>

      <div className="border-t border-ink/10 px-4 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {config.brand.name}. Moda femenina hecha con cariño en
        Honduras.
      </div>
    </footer>
  )
}
