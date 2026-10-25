export interface Product {
  id: string
  nombre: string
  precio: number
  categoria: string
  descripcion: string
  imagen: string
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

export interface StoreSettings {
  whatsapp: string
  instagram: string
  facebook: string
  tiktok: string
}

export interface CartLine {
  product: Product
  quantity: number
}
