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
    facebook: "",
    tiktok: "",
  },
  hero: {
    tagline: "Cremas, camisas y mucho más para mujer",
    headline: "Cuida tu piel, renueva tu",
    accent: "look.",
    description:
      "Cremas, camisas y piezas seleccionadas para mujer, con cariño desde Honduras. Elige tus favoritos y coordina tu pedido por WhatsApp.",
    ctaLabel: "Ver cremas y camisas",
    secondaryLabel: "Cómo comprar",
    trust: ["Envíos a todo Honduras", "Pago contra entrega", "Atención personalizada"],
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Selección de cremas, camisas y prendas para mujer",
  },
  currency: {
    locale: "es-HN",
    code: "HNL",
  },
  shipping: {
    country: "Honduras",
    note: "El envío puede tener un costo extra según tu ciudad. Lo coordinamos por WhatsApp al confirmar tu pedido.",
  },
} as const

export type StoreConfig = typeof config
