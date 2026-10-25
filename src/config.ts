/**
 * Single source of truth for brand identity, contact details and formatting.
 * Renaming the store or changing the phone number only requires editing this file
 * (the admin panel can also override the phone number at runtime).
 */
export const config = {
  brand: {
    name: "Angeles Store's",
    tagline: "Cremas, camisas y mucho más para mujer",
    description:
      "Cremas, camisas y piezas seleccionadas para mujer, con cariño desde Honduras. Elige tus favoritos y coordina tu pedido por WhatsApp.",
  },
  contact: {
    whatsapp: "50499998888",
    instagram: "https://instagram.com/angelesstores",
  },
  currency: {
    locale: "es-HN",
    code: "HNL",
  },
  shipping: {
    country: "Honduras",
    note: "Enviamos a todo Honduras. Coordinamos la entrega por WhatsApp según tu ciudad.",
  },
} as const

export type StoreConfig = typeof config
