import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
import { getStoreSettings } from "@/db/queries"
import { roleLabel } from "@/lib/roles"
import { logoutAction } from "../actions"
import { AdminTabs } from "@/components/admin/admin-tabs"
import { NotificationBell } from "@/components/admin/notification-bell"
import { ForegroundPushListener } from "@/components/admin/foreground-push-listener"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  const settings = await getStoreSettings()

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                {settings.store.name} · Administración
              </p>
              <h1 className="font-display text-2xl text-ink sm:text-3xl">Tu tienda, en orden</h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <NotificationBell />
              <Link
                href="/"
                className="rounded-full border border-ink px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-cream"
              >
                Ver tienda
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm text-muted transition-colors hover:border-wine hover:text-wine"
                >
                  Salir
                </button>
              </form>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <AdminTabs role={session.role} />
            <p className="hidden shrink-0 text-xs text-muted sm:block">
              {session.email} · {roleLabel(session.role)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <ForegroundPushListener />
    </div>
  )
}
