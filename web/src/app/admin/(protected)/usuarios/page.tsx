import { AdminUserForm } from "@/components/admin/admin-user-form"
import { DeleteUserButton } from "@/components/admin/delete-user-button"
import { Select } from "@/components/Select"
import { listAdminUsers } from "@/db/queries"
import { requireOwner } from "@/lib/auth"
import { ADMIN_ROLE_OPTIONS, roleLabel } from "@/lib/roles"
import {
  resetAdminPasswordAction,
  updateAdminRoleAction,
} from "@/app/admin/usuarios/actions"

export const dynamic = "force-dynamic"

const OK_MESSAGES: Record<string, string> = {
  role: "Rol actualizado.",
  password: "Contraseña actualizada.",
  deleted: "Usuario eliminado.",
}

const ERROR_MESSAGES: Record<string, string> = {
  "last-owner": "No podés degradar ni eliminar al último dueño del panel.",
  self: "No podés eliminar tu propia cuenta.",
  password: "La contraseña debe tener al menos 12 caracteres.",
  invalid: "Ese usuario ya no existe o los datos no son válidos.",
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const session = await requireOwner()
  const { ok, error } = await searchParams
  const users = await listAdminUsers()
  const ownerCount = users.filter((user) => user.role === "owner").length
  const formatter = new Intl.DateTimeFormat("es-HN", { dateStyle: "medium" })

  const okMessage = ok ? (OK_MESSAGES[ok] ?? "Cambios guardados.") : null
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "No se pudo completar la acción.") : null

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Equipo</p>
        <h2 className="font-display text-3xl text-ink">Usuarios</h2>
        <p className="mt-1 text-sm text-muted">
          Solo los dueños pueden crear cuentas, cambiar roles o resetear contraseñas.
        </p>
      </div>

      {okMessage && (
        <p className="mt-4 rounded-xl bg-sand px-4 py-3 text-sm text-ink" role="status">
          {okMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mt-4 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
          {errorMessage}
        </p>
      )}

      <section className="mt-5 rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h3 className="font-display text-xl text-ink">Agregar usuario</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Las cuentas nuevas entran como dependientas salvo que elijas Dueño. La contraseña
          necesita 12 caracteres o más.
        </p>
        <div className="mt-4">
          <AdminUserForm />
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <h3 className="font-display text-2xl text-ink">Equipo</h3>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            {users.length} {users.length === 1 ? "usuario" : "usuarios"}
          </p>
        </div>

        <div className="mt-3 space-y-3">
          {users.map((user) => {
            const isSelf = user.id === session.id
            const isLastOwner = user.role === "owner" && ownerCount <= 1

            return (
              <article
                key={user.id}
                className="rounded-2xl border border-ink/10 bg-white/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
                      <span className="break-all">{user.email}</span>
                      {isSelf && (
                        <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cream">
                          Vos
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Desde {formatter.format(user.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ${
                      user.role === "owner" ? "bg-ink text-cream" : "bg-sand text-ink"
                    }`}
                  >
                    {roleLabel(user.role)}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-3 border-t border-ink/10 pt-3">
                  <form
                    action={updateAdminRoleAction}
                    className="flex flex-wrap items-end gap-2"
                  >
                    <input type="hidden" name="id" value={user.id} />
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-muted">
                        Rol
                      </span>
                      <Select
                        variant="pill"
                        name="role"
                        defaultValue={user.role}
                        aria-label={`Rol de ${user.email}`}
                        className="min-w-32"
                      >
                        {ADMIN_ROLE_OPTIONS.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <button
                      type="submit"
                      className="rounded-full border border-ink/20 px-3 py-1.5 text-xs transition-colors hover:border-ink hover:bg-sand"
                    >
                      Cambiar rol
                    </button>
                  </form>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <details>
                      <summary className="w-fit cursor-pointer list-none rounded-full border border-ink/15 px-3 py-1.5 text-xs text-muted transition-colors hover:border-ink hover:text-ink">
                        Cambiar contraseña
                      </summary>
                      <form
                        action={resetAdminPasswordAction}
                        className="mt-2 flex flex-col gap-2 sm:flex-row"
                      >
                        <input type="hidden" name="id" value={user.id} />
                        <input
                          type="password"
                          name="password"
                          autoComplete="new-password"
                          minLength={12}
                          required
                          placeholder="Nueva contraseña (12+)"
                          className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20 sm:w-52"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-cream transition-colors hover:bg-wine"
                        >
                          Guardar contraseña
                        </button>
                      </form>
                    </details>

                    {isSelf ? (
                      <p className="text-xs text-muted">Tu cuenta no se puede eliminar.</p>
                    ) : (
                      <DeleteUserButton
                        id={user.id}
                        email={user.email}
                        disabled={isLastOwner}
                      />
                    )}
                  </div>

                  {isLastOwner && (
                    <p className="text-xs text-muted">
                      Es el único dueño: no se puede degradar ni eliminar.
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
