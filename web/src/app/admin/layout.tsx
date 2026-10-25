import type { Metadata } from "next"
import { ToastProvider } from "@/components/toast-provider"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>
}
