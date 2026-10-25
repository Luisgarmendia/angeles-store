import type { Metadata, Viewport } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Angeles Store's — Cremas, camisas y moda para mujer en Honduras",
    template: "%s · Angeles Store's",
  },
  description:
    "Angeles Store's: cremas, camisas y piezas para mujer en Honduras. Elige tus favoritos y coordina tu pedido por WhatsApp.",
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-HN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
