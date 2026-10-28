import type { Metadata } from "next"
import Link from "next/link"
import { LegalPage, StoreContactDetails } from "@/components/legal-page"
import { getStoreSettings } from "@/db/queries"
import { paymentLabel } from "@/lib/payments"

export const metadata: Metadata = {
  title: "Preguntas frecuentes | Angeles Store's",
  description:
    "Resuelve dudas sobre pedidos, pagos, envíos, devoluciones y productos por encargo en Honduras.",
  alternates: { canonical: "/preguntas-frecuentes" },
}

export default async function FaqPage() {
  const settings = await getStoreSettings()
  const paymentLabels = settings.payments.map(paymentLabel).join(", ")

  return (
    <LegalPage
      title="Preguntas frecuentes"
      intro={`Respuestas rápidas sobre pedidos, pagos, envíos y devoluciones en ${settings.store.name}.`}
    >
      <h2>¿Cómo hago un pedido?</h2>
      <p>
        Elige los productos en el catálogo, agrégalos al carrito y completa tus datos de entrega
        en el checkout. Al enviar el pedido se abre WhatsApp con el resumen para que lo confirmes
        con la tienda.
      </p>

      <h2>¿Qué métodos de pago aceptan?</h2>
      <p>
        Aceptamos los métodos habilitados en el checkout: {paymentLabels}. El pago se coordina por
        WhatsApp al confirmar el pedido.
      </p>

      <h2>¿Cuánto tarda y cuánto cuesta el envío?</h2>
      <p>
        El costo y el tiempo de entrega dependen de tu ubicación. Los coordinamos por WhatsApp
        antes de despachar el pedido.
      </p>

      <h2>¿Puedo cambiar o cancelar mi pedido?</h2>
      <p>
        Sí, mientras el pedido no haya sido despachado. Escríbenos por WhatsApp con tu número de
        pedido. Si ya salió, revisa las condiciones de{" "}
        <Link href="/envios-y-devoluciones">envíos y devoluciones</Link>.
      </p>

      <h2>¿Envían a todo Honduras?</h2>
      <p>Sí. La entrega se coordina por WhatsApp según tu ubicación.</p>

      <h2>¿Puedo devolver un producto?</h2>
      <p>
        Puedes solicitar una devolución o cambio si el producto está sin usar, sin lavar y con
        etiquetas. Repórtalo dentro de las 48 horas siguientes a la entrega con tu número de pedido
        y fotos. Las cremas, los productos de cuidado personal y las piezas personalizadas o por
        encargo tienen excepciones de higiene; consulta la página de{" "}
        <Link href="/envios-y-devoluciones">envíos y devoluciones</Link>.
      </p>

      <h2>¿Cómo sigo mi pedido?</h2>
      <p>
        Escríbenos por WhatsApp con tu número de pedido. Con ese número podemos revisar el estado
        y coordinar la entrega.
      </p>

      <h2>¿Qué es un producto por encargo?</h2>
      <p>
        Es una pieza que preparamos después de confirmar el pedido. Por eso el tiempo de
        preparación puede ser mayor y se coordina por WhatsApp.
      </p>

      <h2>Contacto</h2>
      <p>Si tu pregunta no está aquí, escríbenos por WhatsApp:</p>
      <StoreContactDetails settings={settings} />
    </LegalPage>
  )
}
