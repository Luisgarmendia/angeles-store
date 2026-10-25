import { useState, type ChangeEvent, type FormEvent } from "react"
import { formatPrice } from "../lib/format"
import type { Product, StoreSettings } from "../types"
import {
  ArrowRightIcon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
  XIcon,
} from "./Icons"

interface AdminPanelProps {
  products: Product[]
  settings: StoreSettings
  onClose: () => void
  onSaveProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onSaveSettings: (settings: StoreSettings) => void
  onImport: (products: Product[]) => void
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.nombre === "string" &&
    typeof candidate.precio === "number" &&
    typeof candidate.categoria === "string" &&
    typeof candidate.descripcion === "string" &&
    typeof candidate.imagen === "string"
  )
}

export function AdminPanel({
  products,
  settings,
  onClose,
  onSaveProduct,
  onDeleteProduct,
  onSaveSettings,
  onImport,
}: AdminPanelProps) {
  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [phone, setPhone] = useState(settings.whatsapp)
  const [error, setError] = useState<string | null>(null)

  const categories = Array.from(new Set(products.map((product) => product.categoria)))

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(product: Product) {
    setEditing(product)
    setFormOpen(true)
  }

  function handleSave(product: Product) {
    onSaveProduct(product)
    setFormOpen(false)
    setEditing(null)
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "productos.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!Array.isArray(parsed) || !parsed.every(isProduct)) {
        throw new Error("El archivo no tiene el formato de productos esperado.")
      }
      onImport(parsed)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo leer el archivo.")
    }
  }

  function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 8) {
      setError("Ingresá un número de WhatsApp válido, con código de país.")
      return
    }
    setError(null)
    onSaveSettings({ whatsapp: digits })
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Amapola</p>
            <h1 className="font-display text-2xl text-ink">Panel de administración</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-full border border-ink px-5 py-2.5 text-sm transition-colors hover:bg-ink hover:text-cream"
          >
            Volver a la tienda
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-ink">Productos</h2>
              <p className="text-sm text-muted">{products.length} artículos en el catálogo</p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-cream transition-colors hover:bg-wine"
            >
              <PlusIcon className="h-4 w-4" />
              Nuevo
            </button>
          </div>

          <ul className="mt-5 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/50">
            {products.map((product) => (
              <li key={product.id} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={product.imagen}
                  alt=""
                  className="h-14 w-12 shrink-0 rounded-lg bg-sand object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight text-ink">
                    {product.nombre}
                  </p>
                  <p className="text-xs text-muted">
                    {product.categoria} · {formatPrice(product.precio)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
                  aria-label={`Editar ${product.nombre}`}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProduct(product.id)}
                  className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-wine"
                  aria-label={`Eliminar ${product.nombre}`}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
            {products.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-muted">
                Todavía no hay productos. Creá el primero.
              </li>
            )}
          </ul>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink/10 bg-white/50 p-5">
            <h2 className="font-display text-xl text-ink">WhatsApp del negocio</h2>
            <p className="mt-1 text-sm text-muted">
              Los pedidos se envían a este número, con código de país y sin espacios.
            </p>
            <form onSubmit={handleSettingsSubmit} className="mt-4 flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
                placeholder="5491100000000"
              />
              <button
                type="submit"
                className="rounded-xl bg-ink px-4 py-2.5 text-sm text-cream transition-colors hover:bg-wine"
              >
                Guardar
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/50 p-5">
            <h2 className="font-display text-xl text-ink">Catálogo en JSON</h2>
            <p className="mt-1 text-sm text-muted">
              Exportá el catálogo para respaldarlo o importá uno existente para reemplazarlo.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 rounded-xl border border-ink/20 px-4 py-2.5 text-sm transition-colors hover:border-ink hover:bg-sand"
              >
                <DownloadIcon className="h-4 w-4" />
                Exportar productos.json
              </button>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink/20 px-4 py-2.5 text-sm transition-colors hover:border-ink hover:bg-sand">
                <UploadIcon className="h-4 w-4" />
                Importar JSON
                <input type="file" accept="application/json,.json" className="sr-only" onChange={handleImport} />
              </label>
            </div>
          </section>

          {error && (
            <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
              {error}
            </p>
          )}
        </aside>
      </main>

      {formOpen && (
        <ProductForm
          initial={editing}
          categories={categories}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"

function ProductForm({
  initial,
  categories,
  onCancel,
  onSave,
}: {
  initial: Product | null
  categories: string[]
  onCancel: () => void
  onSave: (product: Product) => void
}) {
  const [form, setForm] = useState({
    nombre: initial?.nombre ?? "",
    precio: initial ? String(initial.precio) : "",
    categoria: initial?.categoria ?? "",
    descripcion: initial?.descripcion ?? "",
    imagen: initial?.imagen ?? "",
  })
  const [error, setError] = useState<string | null>(null)

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (file.size > 1_500_000) {
      setError("La imagen supera 1,5 MB. Usá una URL o una imagen más liviana.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setError(null)
      update("imagen", String(reader.result))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const precio = Number(form.precio)
    if (!form.nombre.trim() || !form.categoria.trim() || !form.descripcion.trim()) {
      setError("Completá nombre, categoría y descripción.")
      return
    }
    if (!Number.isFinite(precio) || precio <= 0) {
      setError("Ingresá un precio mayor a cero.")
      return
    }

    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      nombre: form.nombre.trim(),
      precio,
      categoria: form.categoria.trim(),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Cerrar formulario"
      />

      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Editar producto" : "Nuevo producto"}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">
            {initial ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Cerrar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(event) => update("nombre", event.target.value)}
              className={inputClass}
              placeholder="Vestido midi satinado"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
                Precio (ARS)
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={form.precio}
                onChange={(event) => update("precio", event.target.value)}
                className={inputClass}
                placeholder="48900"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
                Categoría
              </span>
              <input
                type="text"
                list="admin-categories"
                value={form.categoria}
                onChange={(event) => update("categoria", event.target.value)}
                className={inputClass}
                placeholder="Vestidos"
              />
              <datalist id="admin-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
              Descripción
            </span>
            <textarea
              value={form.descripcion}
              onChange={(event) => update("descripcion", event.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Vestido en satén fluido con tiras regulables…"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
              Imagen
            </span>
            <input
              type="url"
              value={form.imagen.startsWith("data:") ? "" : form.imagen}
              onChange={(event) => update("imagen", event.target.value)}
              className={inputClass}
              placeholder="https://…"
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="cursor-pointer rounded-xl border border-ink/20 px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink hover:bg-sand">
                Subir archivo
                <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
              </label>
              {form.imagen && (
                <img
                  src={form.imagen}
                  alt="Vista previa"
                  className="h-12 w-10 rounded-lg bg-sand object-cover"
                />
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-ink/10 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition-colors hover:bg-wine"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
