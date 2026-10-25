"use client"

import { useActionState, useState, type ReactNode } from "react"
import { saveSettingsAction, type FormState } from "@/app/admin/actions"
import { ImageUpload } from "@/components/admin/image-upload"
import { PAYMENT_OPTIONS } from "@/lib/payments"
import type { StoreSettings } from "@/lib/types"

const initialState: FormState = {}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, initialState)
  const [image, setImage] = useState(settings.hero.image)

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-xl text-ink">Portada</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Lo primero que ven tus clientes. La foto puede ser una URL de R2.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Etiqueta superior" className="sm:col-span-2">
            <input
              type="text"
              name="tagline"
              defaultValue={settings.hero.tagline}
              className={inputClass}
              placeholder="Cremas, camisas y mucho más para mujer"
            />
          </Field>

          <Field label="Título principal">
            <input
              type="text"
              name="headline"
              defaultValue={settings.hero.headline}
              required
              className={inputClass}
              placeholder="Cuida tu piel, renueva tu"
            />
          </Field>

          <Field label="Texto destacado en cursiva">
            <input
              type="text"
              name="accent"
              defaultValue={settings.hero.accent}
              className={inputClass}
              placeholder="look."
            />
          </Field>

          <Field label="Descripción" className="sm:col-span-2">
            <textarea
              name="description"
              defaultValue={settings.hero.description}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Botón principal">
            <input
              type="text"
              name="ctaLabel"
              defaultValue={settings.hero.ctaLabel}
              className={inputClass}
            />
          </Field>

          <Field label="Botón secundario">
            <input
              type="text"
              name="secondaryLabel"
              defaultValue={settings.hero.secondaryLabel}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="mt-3 grid gap-3 border-t border-ink/10 pt-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Field key={index} label={`Beneficio ${index + 1}`}>
              <input
                type="text"
                name={`trust${index}`}
                defaultValue={settings.hero.trust[index] ?? ""}
                className={inputClass}
              />
            </Field>
          ))}
        </div>

        <div className="mt-3 border-t border-ink/10 pt-3">
          <Field label="Foto de portada (URL)">
            <input
              type="text"
              name="image"
              inputMode="url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className={inputClass}
              placeholder="https://angelesfile.styledflow.com/portada/foto.jpg"
            />
          </Field>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ImageUpload folder="portada" onUploaded={(url) => setImage(url)} />
            <span className="text-xs text-muted">o pegá una URL</span>
          </div>

          {image && (
            <div className="mt-2 h-28 w-24 overflow-hidden rounded-xl border border-ink/10 bg-sand">
              <img src={image} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <Field label="Descripción de la foto" className="mt-3">
            <input
              type="text"
              name="imageAlt"
              defaultValue={settings.hero.imageAlt}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-xl text-ink">Contacto y redes</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          El WhatsApp recibe los pedidos. Las redes se muestran en el pie de la tienda.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="WhatsApp">
            <input
              type="tel"
              name="whatsapp"
              defaultValue={settings.whatsapp}
              required
              className={inputClass}
              placeholder="+504 9999-8888"
            />
          </Field>

          <Field label="Instagram">
            <input
              type="text"
              name="instagram"
              defaultValue={settings.instagram}
              className={inputClass}
              placeholder="@angelesstores"
            />
          </Field>

          <Field label="Facebook">
            <input
              type="text"
              name="facebook"
              defaultValue={settings.facebook}
              className={inputClass}
              placeholder="https://facebook.com/tutienda"
            />
          </Field>

          <Field label="TikTok">
            <input
              type="text"
              name="tiktok"
              defaultValue={settings.tiktok}
              className={inputClass}
              placeholder="@angelesstores"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-xl text-ink">Métodos de pago</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          El cliente solo verá los métodos activos al completar su pedido.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm transition-colors hover:border-ink/40"
            >
              <input
                type="checkbox"
                name="payments"
                value={option.id}
                defaultChecked={settings.payments.includes(option.id)}
                className="h-4 w-4 accent-ink"
              />
              {option.label}
            </label>
          ))}
        </div>
      </section>

      {state.error && (
        <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink py-3 text-sm font-medium text-cream transition-colors hover:bg-wine disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar ajustes"}
      </button>
    </form>
  )
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"

function Field({
  label,
  className = "",
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      {children}
    </label>
  )
}
