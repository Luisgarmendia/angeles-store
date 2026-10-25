import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/auth"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Entrar al panel",
}

export default async function LoginPage() {
  const session = await getAdminSession()
  if (session) redirect("/admin")

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10">
      <LoginForm />
    </main>
  )
}
