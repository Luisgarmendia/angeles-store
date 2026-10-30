import { LegalPage, StoreContactDetails } from "@/components/legal-page"
import { getStoreSettings } from "@/db/queries"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Política de privacidad",
  description:
    "Conoce cómo Angeles Store's usa tus datos de compra, pedidos y contacto en Honduras.",
  path: "/privacidad",
})

export default async function PrivacyPage() {
  const settings = await getStoreSettings()

  return (
    <LegalPage
      title="Política de privacidad"
      intro={`En ${settings.store.name} usamos tus datos para registrar y gestionar tu pedido. Aquí explicamos qué información recibimos, para qué la usamos y cómo puedes solicitar su corrección o eliminación.`}
    >
      <h2>Datos que recopilamos</h2>
      <p>Cuando completas un pedido recibimos:</p>
      <ul>
        <li>Tu nombre.</li>
        <li>Tu dirección de entrega.</li>
        <li>Tu número de teléfono.</li>
        <li>El método de pago que elegiste.</li>
        <li>Las notas que agregues al pedido.</li>
        <li>El detalle de los productos, cantidades y precios de tu pedido.</li>
      </ul>
      <p>No solicitamos números de tarjeta ni datos bancarios desde este sitio.</p>

      <h2>Para qué usamos tus datos</h2>
      <ul>
        <li>Registrar y gestionar tu pedido.</li>
        <li>Coordinar el pago y la entrega por WhatsApp.</li>
        <li>Mantener el historial de pedidos para atender consultas, cambios o devoluciones.</li>
      </ul>

      <h2>Dónde se guardan</h2>
      <p>
        Los pedidos se guardan en una base de datos PostgreSQL alojada en el servidor de la
        tienda. Además, tu navegador guarda el carrito y tus datos de contacto en el
        almacenamiento local para que puedas retomar la compra y prellenar el siguiente pedido.
      </p>
      <p>
        Puedes borrar esos datos desde la configuración de tu navegador. Eso no elimina el pedido
        que ya fue registrado en la tienda.
      </p>

      <h2>Con quién compartimos tu información</h2>
      <p>No vendemos ni alquilamos tus datos. Los compartimos solo cuando es necesario para:</p>
      <ul>
        <li>Enviar tu pedido por WhatsApp, cuando tú decides enviarlo desde el checkout.</li>
        <li>
          Operar el sitio con proveedores de alojamiento e infraestructura que procesan datos por
          cuenta de la tienda.
        </li>
        <li>
          Cumplir obligaciones legales o atender requerimientos de autoridades competentes.
        </li>
      </ul>

      <h2>Cuánto tiempo conservamos los datos</h2>
      <p>
        Conservamos el historial de pedidos mientras sea necesario para gestionar la relación con
        los clientes y cumplir obligaciones legales. Los datos guardados en tu navegador
        permanecen ahí hasta que los borres.
      </p>

      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar acceso, corrección o eliminación de los datos asociados a tus pedidos.
        Escríbenos por WhatsApp con el número de pedido o el teléfono que usaste al comprar.
      </p>

      <h2>Cookies y almacenamiento local</h2>
      <p>
        Hoy no usamos cookies publicitarias ni rastreadores de terceros. Usamos el almacenamiento
        local del navegador para guardar el carrito y los datos de contacto que nos diste, y así
        facilitar tu próxima compra.
      </p>

      <h2>Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios en la tienda o en la ley.
        Publicaremos la versión vigente en esta página con su fecha de actualización.
      </p>

      <h2>Contacto</h2>
      <p>
        Si tienes preguntas sobre esta política o quieres ejercer tus derechos, escríbenos por
        WhatsApp:
      </p>
      <StoreContactDetails settings={settings} />
    </LegalPage>
  )
}
