"use client"

import QRCode from "react-qr-code"

interface OrderReceiptQrProps {
  value: string
  size?: number
}

/** QR that points to the private customer receipt for an order. */
export function OrderReceiptQr({ value, size = 132 }: OrderReceiptQrProps) {
  return (
    <QRCode
      value={value}
      size={size}
      level="M"
      bgColor="#ffffff"
      fgColor="#2b2320"
      title="Comprobante del pedido"
    />
  )
}
