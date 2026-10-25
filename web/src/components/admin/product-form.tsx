"use client"

import { useActionState, useState, type ReactNode } from "react"
import Link from "next/link"
import { saveProductAction, type FormState } from "@/app/admin/actions"
import { ImageUpload } from "@/components/admin/image-upload"
import type { AdminProduct } from "@/lib/types"

interface ProductFormProps {
  product?: AdminProduct
  categories: string[]
}

const initialState: FormState = {}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState)
  const [image, setImage] = useState(product?.imagen ?? "")

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin" className="text-sm text-muted transition-colors hover:text-ink">
        ← Volver a productos
      </Link>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted">
          {product ? "Editar" : "Nuevo"}
        </p>
        <h2 className="font-display text-3xl text-ink">
          {product ? product.nombre : "Nuevo producto"}
        </h2>
      </div>

      <form
        action={formAction}
        className="mt-5 space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-5"
      >
        {product && <input type="hidden" name="id" value={product.id} />}

        <Field label="Nombre">
          <input
            type="text"
            name="name"
            defaultValue={product?.nombre ?? ""}
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            placeholder="Camisa blanca clásica"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Precio (lempiras)">
            <input
              type="text"
              name="price"
              inputMode="decimal"
              defaultValue={product ? product.precio.toFixed(2) : ""}
              required
              className={inputClass}
              placeholder="1,290.00"
            />
          </Field>

          <Field label="Categoría">
            <input
              type="text"
              name="category"
              list="admin-categories"
              defaultValue={product?.categoria ?? ""}
              required
              minLength={2}
              maxLength={60}
              className={inputClass}
              placeholder="Camisas"
            />
            <datalist id="admin-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            name="description"
            defaultValue={product?.descripcion ?? ""}
            required
            minLength={5}
            maxLength={1000}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Describe la prenda, el material y para qué ocasión queda bien."
          />
        </Field>

        <Field label="Imagen (URL)">
          <div className="space-y-2">
            <input
              type="text"
              name="image"
              inputMode="url"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              className={inputClass}
              placeholder="https://angelesfile.styledflow.com/productos/foto.jpg"
            />
            <div className="flex flex-wrap items-center gap-2">
              <ImageUpload folder="productos" onUploaded={(url) => setImage(url)} />
              <span className="text-xs text-muted">o pegá una URL</span>
            </div>
            <p className="text-xs text-muted">
              La foto se sube al bucket R2 y queda con URL pública.
            </p>
          </div>
        </Field>

        {image && (
          <div className="h-32 w-28 overflow-hidden rounded-xl border border-ink/10 bg-sand">
            <img src={image} alt="" className="h-full w-full object-cover" />
          </div>
        )}

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? true}
            className="h-4 w-4 accent-ink"
          />
          Visible en la tienda
        </label>

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
          {pending ? "Guardando…" : product ? "Guardar cambios" : "Crear producto"}
        </button>
      </form>
    </div>
  )
}

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-rose focus:ring-2 focus:ring-rose/20"

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-muted">{label}</span>
      {children}
    </label>
  )
}
