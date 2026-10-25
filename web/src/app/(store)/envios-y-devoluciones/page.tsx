import type { Metadata } from "next"
import { LegalPage, StoreContactDetails } from "@/components/legal-page"
import { getStoreSettings } from "@/db/queries"

export const metadata: Metadata = {
  title: "Envíos y devoluciones",
  description:
    "Cobertura, costos, tiempos de entrega y condiciones para cambios o devoluciones.",
  alternates: { canonical: "/envios-y-devoluciones" },
}

export default async function ShippingReturnsPage() {
  const settings = await getStoreSettings()

  return (
    <LegalPage
      title="Envíos y devoluciones"
      intro={`Así coordinamos las entregas y atendemos cambios o devoluciones en ${settings.store.name}.`}
    >
      <h2>Cobertura</h2>
      <p>Enviamos a todo Honduras. La entrega se coordina por WhatsApp según tu ubicación.</p>

      <h2>Costo y tiempo de envío</h2>
      <p>
        El costo y el tiempo de entrega dependen del destino y se confirman por WhatsApp antes de
        despachar. No publicamos una tarifa única porque varía por ubicación.
      </p>

      <h2>Despacho</h2>
      <p>
        El despacho se coordina por WhatsApp una vez confirmado el pedido y acordado el pago. Si
        necesitas coordinar un horario o una referencia de entrega, indícalo en las notas del
        pedido o por WhatsApp.
      </p>

      <h2>Productos por encargo</h2>
      <p>
        Los productos por encargo requieren tiempo de preparación adicional. Ese plazo se coordina
        por WhatsApp antes de confirmar la compra.
      </p>

      <h2>Si tu pedido llega con problemas</h2>
      <p>
        Si recibes un producto defectuoso, incompleto o distinto al que pediste, escríbenos por
        WhatsApp dentro de las 48 horas siguientes a la entrega. Incluye tu número de pedido y
        fotos del producto y del empaque para que podamos revisarlo.
      </p>

      <h2>Condiciones para cambios y devoluciones</h2>
      <p>
        Para aceptar un cambio o devolución, el producto debe estar sin usar, sin lavar y con sus
        etiquetas. También debes presentar el número de pedido.
      </p>

      <h2>Excepciones por higiene y personalización</h2>
      <p>
        Por higiene, no aceptamos devoluciones de cremas ni productos de cuidado personal abiertos
        o usados. Tampoco aceptamos devoluciones de piezas personalizadas o hechas por encargo,
        salvo que lleguen defectuosas o no correspondan a lo pedido.
      </p>

      <h2>Reembolsos y cambios</h2>
      <p>
        Cuando corresponda un reembolso o cambio, coordinamos el método por WhatsApp. Podemos
        ofrecer un cambio por otro producto, un crédito o la devolución del monto pagado, según el
        caso.
      </p>

      <h2>Contacto</h2>
      <p>
        Para iniciar un cambio, una devolución o resolver una duda sobre tu envío, escríbenos por
        WhatsApp:
      </p>
      <StoreContactDetails settings={settings} />
    </LegalPage>
  )
}
