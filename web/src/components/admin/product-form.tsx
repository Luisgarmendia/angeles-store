"use client"

import { useActionState, useState, type ReactNode } from "react"
import Link from "next/link"
import { saveProductAction, type FormState } from "@/app/admin/actions"
import { ImageUpload } from "@/components/admin/image-upload"
import { TrashIcon } from "@/components/Icons"
import type { AdminProduct } from "@/lib/types"

interface ProductFormProps {
  product?: AdminProduct
  categories: string[]
}

interface VariantDraft {
  id: string
  label: string
  stock: string
  price: string
}

const initialState: FormState = {}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState)
  const [image, setImage] = useState(product?.imagen ?? "")
  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    (product?.variants ?? []).map((variant) => ({
      id: variant.id,
      label: variant.label,
      stock: String(variant.stock),
      price: variant.precio === null ? "" : variant.precio.toFixed(2),
    })),
  )

  function addVariant() {
    setVariants((current) => [
      ...current,
      { id: "", label: "", stock: "0", price: "" },
    ])
  }

  function updateVariant(index: number, key: keyof VariantDraft, value: string) {
    setVariants((current) =>
      current.map((variant, position) =>
        position === index ? { ...variant, [key]: value } : variant,
      ),
    )
  }

  function removeVariant(index: number) {
    setVariants((current) => current.filter((_, position) => position !== index))
  }

  const variantsJson = JSON.stringify(
    variants.map((variant) => ({
      id: variant.id || undefined,
      label: variant.label,
      stock: variant.stock,
      price: variant.price,
    })),
  )

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
        <input type="hidden" name="variants" value={variantsJson} />

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

        {variants.length === 0 && (
          <Field label="Stock (opcional)">
            <input
              type="number"
              name="stock"
              min={0}
              step={1}
              defaultValue={product?.stock ?? ""}
              className={inputClass}
              placeholder="Vacío = stock ilimitado"
            />
            <span className="mt-1 block text-xs text-muted">
              Si no controlás stock, dejalo vacío.
            </span>
          </Field>
        )}

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

        <div className="border-t border-ink/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.16em] text-muted">
                Opciones / variantes
              </h3>
              <p className="mt-1 text-xs text-muted">
                Tallas, colores, tamaños u otra característica. Si agregás opciones, el stock
                se maneja por opción.
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-xs transition-colors hover:border-ink hover:bg-sand"
            >
              + Agregar
            </button>
          </div>

          {variants.length > 0 ? (
            <div className="mt-3 space-y-2">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_4.5rem_5.5rem_auto] items-center gap-2"
                >
                  <input
                    type="text"
                    value={variant.label}
                    onChange={(event) =>
                      updateVariant(index, "label", event.target.value)
                    }
                    className={`${inputClass} min-w-0`}
                    placeholder="Talla M · Negro"
                    aria-label={`Etiqueta de la opción ${index + 1}`}
                  />
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(index, "stock", event.target.value)
                    }
                    className={`${inputClass} min-w-0`}
                    placeholder="Stock"
                    aria-label={`Stock de la opción ${index + 1}`}
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={variant.price}
                    onChange={(event) =>
                      updateVariant(index, "price", event.target.value)
                    }
                    className={`${inputClass} min-w-0`}
                    placeholder="Precio"
                    aria-label={`Precio de la opción ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="rounded-full p-2 text-muted transition-colors hover:bg-wine/10 hover:text-wine"
                    aria-label={`Quitar opción ${index + 1}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <p className="text-xs text-muted">
                El precio de la opción es opcional; si lo dejás vacío, usa el precio del
                producto.
              </p>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-sand/70 px-3 py-2 text-xs text-muted">
              Sin opciones: se usa el stock y el precio del producto.
            </p>
          )}
        </div>

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
