/**
 * Single source of truth for brand identity, contact details and formatting.
 * Renaming the store or changing the phone number only requires editing this file
 * (the admin panel can also override the phone number at runtime).
 */
export const config = {
  brand: {
    name: "Amapola",
    tagline: "Moda femenina",
    description:
      "Indumentaria, calzado y accesorios pensados para que te sientas vos. Seleccioná tus prendas y coordiná el pedido por WhatsApp.",
  },
  contact: {
    whatsapp: "5491100000000",
    instagram: "https://instagram.com/amapola",
  },
  currency: {
    locale: "es-AR",
    code: "ARS",
  },
} as const

export type StoreConfig = typeof config
