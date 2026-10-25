import { config } from "../config"
import { MessageIcon } from "./Icons"

interface FooterProps {
  whatsapp: string
}

export function Footer({ whatsapp }: FooterProps) {
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
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Contacto</p>
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm text-ink transition-colors hover:text-wine"
          >
            <MessageIcon className="h-4 w-4" />
            Escribinos por WhatsApp
          </a>
          <a
            href={config.contact.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block text-sm text-muted transition-colors hover:text-ink"
          >
            Instagram
          </a>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Cómo comprar</p>
          <ol className="mt-3 space-y-2 text-sm text-muted">
            <li>1. Elegí tus prendas y sumalas al carrito.</li>
            <li>2. Completá tus datos de entrega.</li>
            <li>3. Enviá el pedido por WhatsApp y coordinamos el pago y el envío.</li>
          </ol>
        </div>
      </div>

      <div className="border-t border-ink/10 px-4 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {config.brand.name}. Hecho con amor para vestirte todos los días.
      </div>
    </footer>
  )
}
