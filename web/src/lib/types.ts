export interface Product {
  id: string
  nombre: string
  precio: number
  categoria: string
  descripcion: string
  imagen: string
}

export interface AdminProduct extends Product {
  active: boolean
  sortOrder: number
}

export interface CartItem {
  productId: string
  quantity: number
}

export type PaymentMethod = "contraentrega" | "transferencia" | "tarjeta" | "efectivo"

export interface Customer {
  nombre: string
  direccion: string
  telefono: string
  pago: PaymentMethod
  notas: string
}

export interface HeroContent {
  tagline: string
  headline: string
  accent: string
  description: string
  ctaLabel: string
  secondaryLabel: string
  trust: string[]
  image: string
  imageAlt: string
}

export interface StoreSettings {
  whatsapp: string
  instagram: string
  facebook: string
  tiktok: string
  payments: PaymentMethod[]
  hero: HeroContent
}

export interface CartLine {
  product: Product
  quantity: number
}
