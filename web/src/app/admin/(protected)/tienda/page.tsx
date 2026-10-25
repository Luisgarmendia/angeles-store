import { SettingsForm } from "@/components/admin/settings-form"
import { getStoreSettings } from "@/db/queries"
import { requireOwner } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function StoreSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  await requireOwner()

  const { ok } = await searchParams
  const settings = await getStoreSettings()

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Configuración</p>
        <h2 className="font-display text-3xl text-ink">Tienda</h2>
        <p className="mt-1 text-sm text-muted">
          Portada, información de contacto y métodos de pago de la tienda.
        </p>
      </div>

      {ok && (
        <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm text-ink" role="status">
          Ajustes guardados.
        </p>
      )}

      <div className="mt-5">
        <SettingsForm settings={settings} />
      </div>
    </div>
  )
}
