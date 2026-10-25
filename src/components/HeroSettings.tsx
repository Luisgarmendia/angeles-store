import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { readImageFile } from "../lib/image"
import type { HeroContent, StoreSettings } from "../types"
import { TrashIcon, UploadIcon } from "./Icons"

interface HeroSettingsProps {
  settings: StoreSettings
  onSave: (settings: StoreSettings) => void
}

export function HeroSettings({ settings, onSave }: HeroSettingsProps) {
  const [form, setForm] = useState<HeroContent>(settings.hero)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function update<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  function updateTrust(index: number, value: string) {
    setForm((current) => {
      const trust = [...current.trust]
      while (trust.length <= index) trust.push("")
      trust[index] = value
      return { ...current, trust }
    })
    setSaved(false)
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      update("image", await readImageFile(file))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo leer la imagen.")
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.headline.trim()) {
      setError("Escribe el título principal de la portada.")
      return
    }

    setError(null)
    const accent = form.accent.trim()
    const rawHeadline = form.headline.trim()
    const headline =
      accent && rawHeadline.endsWith(accent)
        ? rawHeadline.slice(0, -accent.length).trimEnd()
        : rawHeadline

    onSave({
      ...settings,
      hero: {
        ...form,
        tagline: form.tagline.trim(),
        headline,
        accent,
        description: form.description.trim(),
        ctaLabel: form.ctaLabel.trim(),
        secondaryLabel: form.secondaryLabel.trim(),
        trust: form.trust.slice(0, 3).map((item) => item.trim()),
        image: form.image.trim(),
        imageAlt: form.imageAlt.trim(),
      },
    })
    setSaved(true)
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-white/60 p-5 lg:col-span-2">
      <h2 className="font-display text-xl text-ink">Portada</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Personaliza lo primero que ven tus clientes. La foto puede ser una URL o subirse desde tu
        equipo.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Etiqueta superior" className="sm:col-span-2">
            <input
              type="text"
              value={form.tagline}
              onChange={(event) => update("tagline", event.target.value)}
              className={inputClass}
              placeholder="Cremas, camisas y mucho más para mujer"
            />
          </Field>

          <Field label="Título principal">
            <input
              type="text"
              value={form.headline}
              onChange={(event) => update("headline", event.target.value)}
              className={inputClass}
              placeholder="Cuida tu piel, renueva tu"
            />
          </Field>

          <Field label="Texto destacado en cursiva">
            <input
              type="text"
              value={form.accent}
              onChange={(event) => update("accent", event.target.value)}
              className={inputClass}
              placeholder="look."
            />
          </Field>

          <Field label="Descripción" className="sm:col-span-2">
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Cremas, camisas y piezas seleccionadas para mujer…"
            />
          </Field>

          <Field label="Botón principal">
            <input
              type="text"
              value={form.ctaLabel}
              onChange={(event) => update("ctaLabel", event.target.value)}
              className={inputClass}
              placeholder="Ver cremas y camisas"
            />
          </Field>

          <Field label="Botón secundario">
            <input
              type="text"
              value={form.secondaryLabel}
              onChange={(event) => update("secondaryLabel", event.target.value)}
              className={inputClass}
              placeholder="Cómo comprar"
            />
          </Field>
        </div>

        <div className="grid gap-3 border-t border-ink/10 pt-4 sm:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Field key={index} label={`Beneficio ${index + 1}`}>
              <input
                type="text"
                value={form.trust[index] ?? ""}
                onChange={(event) => updateTrust(index, event.target.value)}
                className={inputClass}
                placeholder={index === 0 ? "Envíos a todo Honduras" : "Beneficio"}
              />
            </Field>
          ))}
        </div>

        <div className="border-t border-ink/10 pt-4">
          <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted">
            Foto de portada
          </span>

          <div className="flex items-start gap-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-sand">
              {form.image ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted">
                  Sin foto
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              <input
                type="text"
                inputMode="url"
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(event) => update("image", event.target.value)}
                className={`${inputClass} w-full`}
                placeholder="https://ejemplo.com/foto.jpg"
                aria-label="URL de la foto de portada"
              />

              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-ink/20 px-3 py-2 text-sm transition-colors hover:border-ink hover:bg-sand">
                  <UploadIcon className="h-4 w-4" />
                  Subir foto
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
                </label>

                {form.image && (
                  <button
                    type="button"
                    onClick={() => update("image", "")}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink/20 px-3 py-2 text-sm text-muted transition-colors hover:border-wine hover:text-wine"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Quitar
                  </button>
                )}
              </div>

              <p className="text-xs leading-relaxed text-muted">
                JPG o PNG hasta 1.5 MB. También podés pegar una URL.
              </p>
            </div>
          </div>

          <Field label="Descripción de la foto (accesibilidad)" className="mt-3">
            <input
              type="text"
              value={form.imageAlt}
              onChange={(event) => update("imageAlt", event.target.value)}
              className={inputClass}
              placeholder="Selección de cremas, camisas y prendas para mujer"
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
        >
          Guardar portada
        </button>

        {saved && (
          <p className="text-sm text-muted" role="status">
            Portada guardada.
          </p>
        )}
      </form>
    </section>
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
