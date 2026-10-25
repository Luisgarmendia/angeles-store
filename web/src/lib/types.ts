export interface ProductVariant {
  id: string
  label: string
  stock: number
  precio: number | null
  imagen: string | null
}

export interface Product {
  id: string
  nombre: string
  precio: number
  categoria: string
  descripcion: string
  imagen: string
  imagenes: string[]
  stock: number | null
  porEncargo: boolean
  precioAnterior: number | null
  creadoEn: string
  variants: ProductVariant[]
}

export interface AdminProduct extends Product {
  active: boolean
  sortOrder: number
}

export interface CartItem {
  productId: string
  variantId?: string | null
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

export interface StoreInfo {
  name: string
  address: string
  description: string
}

export interface StoreSettings {
  store: StoreInfo
  whatsapp: string
  instagram: string
  facebook: string
  tiktok: string
  payments: PaymentMethod[]
  hero: HeroContent
}

export interface CartLine {
  product: Product
  variantId: string | null
  variantLabel: string | null
  unitPrice: number
  quantity: number
}

export type OrderStatus =
  | "pendiente"
  | "confirmado"
  | "enviado"
  | "entregado"
  | "cancelado"

export type OrderPaymentStatus = "pendiente" | "pagado" | "reembolsado"
