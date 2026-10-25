import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"
import { config } from "../config"
import { formatPrice } from "../lib/format"
import { formatHonduranPhone, normalizeHonduranPhone } from "../lib/phone"
import { useModalBehavior } from "../lib/useModal"
import type { Product, StoreSettings } from "../types"
import {
  ArrowRightIcon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
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

type Tab = "productos" | "ajustes"

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === "string" &&
    typeof candidate.nombre === "string" &&
    typeof candidate.precio === "number" &&
    candidate.precio > 0 &&
    typeof candidate.categoria === "string" &&
    typeof candidate.descripcion === "string" &&
    typeof candidate.imagen === "string"
  )
}

function parsePrice(value: string): number {
  const cleaned = value.replace(/[^\d.]/g, "")
  return cleaned ? Number(cleaned) : Number.NaN
}

function localDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("504") && digits.length === 11 ? digits.slice(3) : digits
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
  const [tab, setTab] = useState<Tab>("productos")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("Todas")
  const [editing, setEditing] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const categories = Array.from(new Set(products.map((product) => product.categoria)))
  const withoutImage = products.filter((product) => !product.imagen.trim()).length

  const term = search.trim().toLowerCase()
  const filtered = products.filter((product) => {
    const matchesCategory = categoryFilter === "Todas" || product.categoria === categoryFilter
    const matchesTerm =
      !term ||
      product.nombre.toLowerCase().includes(term) ||
      product.categoria.toLowerCase().includes(term) ||
      product.descripcion.toLowerCase().includes(term)
    return matchesCategory && matchesTerm
  })

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
    link.download = "productos-amapola.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed.every(isProduct)) {
        throw new Error("El archivo no tiene el formato de productos esperado.")
      }
      setImportError(null)
      onImport(parsed)
    } catch (cause) {
      setImportError(cause instanceof Error ? cause.message : "No se pudo leer el archivo.")
    }
  }

  function clearFilters() {
    setSearch("")
    setCategoryFilter("Todas")
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
                {config.brand.name} · Administración
              </p>
              <h1 className="font-display text-2xl text-ink sm:text-3xl">Tu tienda, en orden</h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex shrink-0 items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-cream"
            >
              Ver tienda
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Secciones del panel"
            className="flex w-full gap-1 rounded-full bg-sand p-1 sm:w-fit"
          >
            <TabButton active={tab === "productos"} onClick={() => setTab("productos")}>
              Productos
            </TabButton>
            <TabButton active={tab === "ajustes"} onClick={() => setTab("ajustes")}>
              Ajustes
            </TabButton>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === "productos" ? (
          <>
            <section className="grid grid-cols-3 gap-3">
              <Stat label="Productos" value={products.length} />
              <Stat label="Categorías" value={categories.length} />
              <Stat label="Sin foto" value={withoutImage} tone={withoutImage > 0 ? "warn" : "default"} />
            </section>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por nombre, categoría o descripción…"
                  aria-label="Buscar productos en el panel"
                  className="w-full rounded-full border border-ink/15 bg-white/60 py-2.5 pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-rose focus:ring-2 focus:ring-rose/20"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filtrar por categoría"
                className="rounded-full border border-ink/15 bg-white/60 px-4 py-2.5 text-sm text-ink outline-none focus:border-rose focus:ring-2 focus:ring-rose/20"
              >
                <option value="Todas">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={openCreate}
                className="flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
              >
                <PlusIcon className="h-4 w-4" />
                Nuevo producto
              </button>
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted">
              {filtered.length} de {products.length} productos
            </p>

            {products.length === 0 ? (
              <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
                <p className="font-display text-2xl text-ink">Tu catálogo está vacío</p>
                <p className="max-w-sm text-sm text-muted">
                  Crea tu primer producto o importa un catálogo desde la pestaña Ajustes.
                </p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-1 rounded-full bg-ink px-6 py-2.5 text-sm text-cream transition-colors hover:bg-wine"
                >
                  Crear el primer producto
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/15 px-6 py-12 text-center">
                <p className="font-display text-xl text-ink">No encontramos productos con ese filtro</p>
                <p className="text-sm text-muted">Prueba con otra palabra o limpia los filtros.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-1 rounded-full border border-ink px-5 py-2 text-sm transition-colors hover:bg-ink hover:text-cream"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-ink/10 overflow-hidden rounded-2xl border border-ink/10 bg-white/60">
                {filtered.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-4">
                    {product.imagen ? (
                      <img
                        src={product.imagen}
                        alt=""
                        className="h-16 w-14 shrink-0 rounded-xl bg-sand object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl bg-sand px-1 text-center text-[9px] uppercase tracking-[0.12em] text-muted">
                        Sin foto
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg leading-tight text-ink">
                        {product.nombre}
                      </p>
                      <p className="text-xs text-muted">
                        {product.categoria} · {formatPrice(product.precio)}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted/80">
                        {product.descripcion}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
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
                        onClick={() => setConfirmDelete(product)}
                        className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-wine"
                        aria-label={`Eliminar ${product.nombre}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <SettingsTab
            products={products}
            settings={settings}
            importError={importError}
            onExport={handleExport}
            onImport={handleImport}
            onSaveSettings={onSaveSettings}
          />
        )}
      </main>

      {formOpen && (
        <ProductDrawer
          initial={editing}
          categories={categories}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <DeleteConfirm
          product={confirmDelete}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            onDeleteProduct(confirmDelete.id)
            setConfirmDelete(null)
          }}
        />
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 rounded-full px-5 py-2 text-sm font-medium transition-colors sm:flex-none ${
        active ? "bg-ink text-cream shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  )
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number
  tone?: "default" | "warn"
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "warn" ? "border-rose/40 bg-rose/5" : "border-ink/10 bg-white/60"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p
        className={`mt-1 font-display text-3xl ${
          tone === "warn" ? "text-rose-dark" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  )
}

function SettingsTab({
  products,
  settings,
  importError,
  onExport,
  onImport,
  onSaveSettings,
}: {
  products: Product[]
  settings: StoreSettings
  importError: string | null
  onExport: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
  onSaveSettings: (settings: StoreSettings) => void
}) {
  const [phone, setPhone] = useState(() => localDigits(settings.whatsapp))
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const normalizedPhone = normalizeHonduranPhone(phone)

  function handleSettingsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeHonduranPhone(phone)

    if (!normalized) {
      setPhoneError("Escribe los 8 dígitos del número hondureño, por ejemplo 9999-8888.")
      return
    }

    setPhoneError(null)
    setPhone(localDigits(normalized))
    onSaveSettings({ whatsapp: normalized })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-xl text-ink">WhatsApp de pedidos</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Aquí llegan los pedidos de tus clientes. Escribe el número hondureño sin el código de
          país.
        </p>

        <form onSubmit={handleSettingsSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
              Número de WhatsApp
            </span>
            <div className="flex items-stretch gap-2">
              <span className="flex items-center rounded-xl border border-ink/15 bg-sand px-3 text-sm text-muted">
                +504
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="9999-8888"
                className={inputClass}
              />
            </div>
          </label>

          {normalizedPhone ? (
            <p className="text-xs text-muted">
              Los pedidos se enviarán a{" "}
              <strong className="font-medium text-ink">{formatHonduranPhone(normalizedPhone)}</strong>.
            </p>
          ) : (
            <p className="text-xs text-muted">Ejemplo: 9999-8888</p>
          )}

          {phoneError && (
            <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
              {phoneError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
          >
            Guardar número
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white/60 p-5">
        <h2 className="font-display text-xl text-ink">Catálogo en JSON</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Respalda tu catálogo o cárgalo en otro dispositivo. El archivo incluye los{" "}
          {products.length} productos actuales.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center justify-center gap-2 rounded-xl border border-ink/20 px-4 py-2.5 text-sm transition-colors hover:border-ink hover:bg-sand"
          >
            <DownloadIcon className="h-4 w-4" />
            Exportar
          </button>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink/20 px-4 py-2.5 text-sm transition-colors hover:border-ink hover:bg-sand">
            <UploadIcon className="h-4 w-4" />
            Importar
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={onImport}
            />
          </label>
        </div>

        <p className="mt-3 rounded-xl bg-sand/70 px-3 py-2 text-xs leading-relaxed text-muted">
          Al importar, el catálogo actual se reemplaza por completo. Exporta primero si quieres
          conservar una copia.
        </p>

        {importError && (
          <p className="mt-3 rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
            {importError}
          </p>
        )}
      </section>
    </div>
  )
}

const inputClass =
  "min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"

function ProductDrawer({
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
  useModalBehavior(true, onCancel)

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
      setError("La imagen supera 1.5 MB. Usa una URL o una foto más liviana.")
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

    const precio = parsePrice(form.precio)
    if (!form.nombre.trim() || !form.categoria.trim() || !form.descripcion.trim()) {
      setError("Completa nombre, categoría y descripción.")
      return
    }
    if (!Number.isFinite(precio) || precio <= 0) {
      setError("Escribe un precio mayor a cero.")
      return
    }

    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      nombre: form.nombre.trim(),
      precio: Math.round(precio),
      categoria: form.categoria.trim(),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Cerrar formulario"
      />

      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-cream shadow-2xl sm:h-full sm:max-h-none sm:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-label={initial ? "Editar producto" : "Nuevo producto"}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/10 px-6 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              {initial ? "Editar" : "Nuevo"}
            </p>
            <h2 className="font-display text-2xl text-ink">
              {initial ? initial.nombre : "Nuevo producto"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-muted transition-colors hover:bg-sand hover:text-ink"
            aria-label="Cerrar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
                Nombre
              </span>
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
                  Precio (lempiras)
                </span>
                <div className="flex items-stretch gap-2">
                  <span className="flex items-center rounded-xl border border-ink/15 bg-sand px-3 text-sm text-muted">
                    L
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.precio}
                    onChange={(event) => update("precio", event.target.value)}
                    className={inputClass}
                    placeholder="1,290"
                  />
                </div>
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

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => update("categoria", category)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      form.categoria === category
                        ? "border-ink bg-ink text-cream"
                        : "border-ink/15 text-muted hover:border-ink/40 hover:text-ink"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">
                Descripción
              </span>
              <textarea
                value={form.descripcion}
                onChange={(event) => update("descripcion", event.target.value)}
                rows={3}
                className={`${inputClass} resize-none`}
                placeholder="Vestido en satén fluido con tiras ajustables…"
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

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer rounded-xl border border-ink/20 px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors hover:border-ink hover:bg-sand">
                  Subir foto
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
                </label>
                {form.imagen && (
                  <button
                    type="button"
                    onClick={() => update("imagen", "")}
                    className="rounded-xl px-3 py-2 text-xs text-muted transition-colors hover:text-wine"
                  >
                    Quitar foto
                  </button>
                )}
                <span className="text-[11px] text-muted">JPG o PNG de hasta 1.5 MB</span>
              </div>

              <div className="mt-3 overflow-hidden rounded-xl bg-sand">
                {form.imagen ? (
                  <img
                    src={form.imagen}
                    alt="Vista previa del producto"
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-xs uppercase tracking-[0.2em] text-muted">
                    Sin imagen
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-wine/10 px-4 py-3 text-sm text-wine" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-ink/10 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
            >
              Guardar producto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  product,
  onCancel,
  onConfirm,
}: {
  product: Product
  onCancel: () => void
  onConfirm: () => void
}) {
  useModalBehavior(true, onCancel)

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Cancelar eliminación"
      />

      <div
        className="relative w-full max-w-sm rounded-3xl bg-cream p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
        aria-label={`Eliminar ${product.nombre}`}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-wine/10 text-wine">
          <TrashIcon className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-display text-2xl text-ink">¿Eliminar este producto?</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          <strong className="font-medium text-ink">{product.nombre}</strong> saldrá del catálogo y
          también de tu carrito actual. Esta acción no se puede deshacer.
        </p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2.5 text-sm text-muted transition-colors hover:text-ink"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-wine px-5 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine/90"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
