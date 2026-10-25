import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, StoreContactDetails } from "@/components/legal-page"
import { getStoreSettings } from "@/db/queries"
import { paymentLabel } from "@/lib/payments"

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de compra, disponibilidad, precios, pagos, entregas, cancelaciones y responsabilidad.",
  alternates: { canonical: "/terminos" },
}

export default async function TermsPage() {
  const settings = await getStoreSettings()
  const paymentLabels = settings.payments.map(paymentLabel).join(", ")

  return (
    <LegalPage
      title="Términos y condiciones"
      intro={`Estos términos explican cómo funcionan los pedidos en ${settings.store.name}. Al comprar desde este sitio, aceptas estas condiciones.`}
    >
      <h2>Pedidos</h2>
      <p>
        Los pedidos que envías desde el sitio son solicitudes. Quedan confirmados cuando los
        revisamos y te respondemos por WhatsApp, y están sujetos a disponibilidad de stock. Si un
        producto no está disponible, te lo informamos antes de continuar.
      </p>
      <p>
        Al registrar el pedido recibes un número de pedido. Consérvalo para cualquier consulta.
      </p>

      <h2>Productos por encargo</h2>
      <p>
        Algunos productos se preparan por encargo. En esos casos, el tiempo de preparación se
        coordina por WhatsApp después de confirmar el pedido.
      </p>

      <h2>Precios y métodos de pago</h2>
      <p>
        Los precios se muestran en lempiras (HNL) y pueden cambiar sin previo aviso. El total
        vigente es el que aparece al confirmar el pedido.
      </p>
      <p>
        Los métodos de pago habilitados son: {paymentLabels}. El pago y sus detalles se coordinan
        por WhatsApp al confirmar el pedido.
      </p>

      <h2>Entrega</h2>
      <p>
        La entrega se coordina por WhatsApp. El costo y el tiempo dependen de tu ubicación y se
        confirman antes de despachar el pedido. Consulta{" "}
        <Link href="/envios-y-devoluciones">envíos y devoluciones</Link> para más detalles.
      </p>

      <h2>Cancelaciones y devoluciones</h2>
      <p>
        Puedes solicitar cambios o cancelaciones antes de que el pedido sea despachado,
        escribiéndonos por WhatsApp. Después del despacho aplican las condiciones de{" "}
        <Link href="/envios-y-devoluciones">envíos y devoluciones</Link>.
      </p>

      <h2>Uso aceptable</h2>
      <p>
        Te pedimos usar el sitio de forma honesta: proporcionar datos de contacto y entrega
        correctos, no registrar pedidos falsos ni intentar afectar el funcionamiento del sitio o
        de los sistemas de la tienda.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El nombre, el diseño, los textos, las fotografías y los demás contenidos de este sitio
        pertenecen a la tienda o se usan con autorización. No puedes reproducirlos ni usarlos
        comercialmente sin permiso.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        Hacemos lo posible por mantener actualizada la información de productos, precios y stock.
        Si detectamos un error de precio, descripción o disponibilidad, te contactamos antes de
        continuar y podemos cancelar el pedido y devolver cualquier pago recibido.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de Honduras. Cualquier controversia se atenderá
        primero por WhatsApp, de buena fe, antes de acudir a las instancias correspondientes.
      </p>

      <h2>Contacto</h2>
      <p>Si tienes dudas sobre estos términos, escríbenos por WhatsApp:</p>
      <StoreContactDetails settings={settings} />
    </LegalPage>
  )
}
