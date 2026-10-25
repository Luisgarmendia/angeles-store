# Product Requirement Document (PRD)
## Tienda Online Serverless con Enrutamiento de Pedidos a WhatsApp

---

### 1. Resumen Ejecutivo (Executive Summary)

El objetivo de este proyecto es proveer una plataforma de comercio electrónico de arquitectura **Frontend-Only (Zero-Backend)**, liviana, rápida y sin costos de infraestructura recurrente. La solución permite a pequeños y medianos comercios gestionar su inventario localmente mediante archivos JSON y cerrar sus ventas directamente a través de un chat estructurado en **WhatsApp**.

---

### 2. Objetivos del Producto

*   **Cero Costos de Infraestructura:** Funcionar sin necesidad de mantener un servidor activo, base de datos relacional o pasarela de pago formal.
*   **Gestión Sencilla:** Permitir al administrador del negocio gestionar sus productos mediante una interfaz intuitiva con capacidad de exportación/importación en formato `.json`.
*   **Ficción Mínima de Compra:** Reducir los pasos del carrito para enviar un resumen claro y formateado al WhatsApp del vendedor.

---

### 3. Alcance y Arquitectura Técnica

#### **3.1 Stacks de Tecnologías**
*   **Framework:** React (Single File Component / SPA).
*   **Estilos:** Tailwind CSS / Utilities.
*   **Persistencia:** `localStorage` del navegador + Archivo `productos.json`.
*   **Integración:** API Universal de WhatsApp Web/App (`https://wa.me/{phone}?text={message}`).

#### **3.2 Arquitectura del Sistema (Zero-Backend)**
```
[ Frontend: React SPA ] 
      │
      ├──> [ LocalStorage ] (Persistencia local inmediata)
      ├──> [ Import / Export JSON ] (Control manual de productos)
      └──> [ URL Encode / wa.me API ] ───> [ WhatsApp Vendedor ]
```

---

### 4. Requerimientos Funcionales (RF)

#### **RF1: Módulo de Cliente / Catálogo de Productos**
*   **RF1.1:** Mapear y mostrar los productos almacenados en el catálogo.
*   **RF1.2:** Buscador en tiempo real por coincidencia de texto en título o descripción.
*   **RF1.3:** Filtros dinámicos basados en categorías extraídas automáticamente de los productos activos.
*   **RF1.4:** Tarjeta de producto con imagen, precio formateado, título, descripción y categoría.

#### **RF2: Carrito de Compras & Pre-Checkout**
*   **RF2.1:** Añadir/Eliminar productos al carrito.
*   **RF2.2:** Incrementar o decrementar unidades del mismo ítem.
*   **RF2.3:** Sumatoria automática y en tiempo real del total del pedido.
*   **RF2.4:** Captura de datos básicos del cliente:
    *   Nombre Completo (Obligatorio).
    *   Dirección de Entrega (Obligatoria).
    *   Teléfono de Contacto.
    *   Método de Pago Preferido (Efectivo, Transferencia, Tarjeta).
    *   Notas adicionales.

#### **RF3: Módulo de Integración con WhatsApp**
*   **RF3.1:** Transformar el carrito y los datos de envío en una plantilla de texto formateada (con emojis y negritas de Markdown de WhatsApp).
*   **RF3.2:** Aplicar codificación de URI (`encodeURIComponent`) sobre el mensaje generado.
*   **RF3.3:** Abrir en una pestaña nueva la URL de redirección a WhatsApp (`wa.me`).

#### **RF4: Panel de Administración e Inventario**
*   **RF4.1:** Formulario para agregar nuevos productos y editar los existentes.
*   **RF4.2:** Soporte de imágenes mediante URL externa o conversión local a Base64.
*   **RF4.3:** Modificación del número telefónico de recepción del negocio.
*   **RF4.4:** Función **Exportar JSON**: Descarga la lista actual de productos como `productos.json`.
*   **RF4.5:** Función **Importar JSON**: Permite cargar un archivo `.json` previo para reemplazar/actualizar el catálogo.

---

### 5. Estructura del Archivo de Datos (`productos.json`)

El archivo JSON debe responder al siguiente esquema de datos:

```json
[
  {
    "id": "p1",
    "nombre": "Camiseta Minimalista Algodón Orgánico",
    "precio": 24.99,
    "categoria": "Ropa",
    "descripcion": "Camiseta ligera fabricada en 100% algodón orgánico, ideal para uso diario.",
    "imagen": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518"
  },
  {
    "id": "p2",
    "nombre": "Taza Cerámica Artesanal",
    "precio": 14.50,
    "categoria": "Hogar",
    "descripcion": "Taza hecha a mano por artesanos locales.",
    "imagen": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
]
```

---

### 6. Plantilla del Mensaje de WhatsApp Generado

El mensaje enviado al comerciante sigue el siguiente formato estándar:

```text
🛒 *NUEVO PEDIDO DESDE LA TIENDA WEB*

👤 *Cliente:* Juan Pérez
📞 *Teléfono:* 9999-8888
📍 *Dirección:* Calle Principal #123, Colonia Centro
💳 *Método de Pago:* Efectivo / Contraentrega
📝 *Notas:* Entregar por la tarde.

📦 *DETALLE DEL PEDIDO:*
1. *Camiseta Minimalista Algodón Orgánico* x2 - $49.98
2. *Taza Cerámica Artesanal* x1 - $14.50

💰 *TOTAL A PAGAR:* *$64.48*
```

---

### 7. Guía de Despliegue e Infraestructura

1. **Alojamiento Recomendado:** Vercel, Netlify o GitHub Pages.
2. **Proceso de Publicación:**
   * Crear un repositorio en GitHub con el código fuente en React.
   * Conectar el repositorio a Vercel/Netlify.
   * Ejecutar el despliegue automático (*Build Command*: `npm run build`).
   * Asignar un dominio gratuito `.vercel.app` o asociar un dominio personalizado.

---

### 8. Métricas y Criterios de Éxito

* **Tiempo de carga inicial:** < 1.5 segundos (al no depender de respuestas de servidor backend).
* **Conversión de Checkouts:** Transición inmediata del formulario al chat de WhatsApp.
* **Cero costo recurrente:** Funciona totalmente dentro de las capas gratuitas de Vercel/Netlify y GitHub.