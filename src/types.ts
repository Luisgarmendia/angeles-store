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

export type PaymentMethod = "efectivo" | "transferencia" | "tarjeta"

export interface Customer {
  nombre: string
  direccion: string
  telefono: string
  pago: PaymentMethod
  notas: string
}

export interface StoreSettings {
  whatsapp: string
}

export interface CartLine {
  product: Product
  quantity: number
}
