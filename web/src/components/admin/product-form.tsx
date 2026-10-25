"use client"

import { useActionState, useState, type ReactNode } from "react"
import Link from "next/link"
import { saveProductAction, type FormState } from "@/app/admin/actions"
import { ImageUpload } from "@/components/admin/image-upload"
import { ArrowLeftIcon, ArrowRightIcon, TrashIcon } from "@/components/Icons"
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
  image: string
}

const MAX_GALLERY_IMAGES = 8
const initialState: FormState = {}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(saveProductAction, initialState)
  const [images, setImages] = useState<string[]>(() => product?.imagenes ?? [])
  const [newImage, setNewImage] = useState("")
  const [madeToOrder, setMadeToOrder] = useState(() => product?.porEncargo ?? false)
  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    (product?.variants ?? []).map((variant) => ({
      id: variant.id,
      label: variant.label,
      stock: String(variant.stock),
      price: variant.precio === null ? "" : variant.precio.toFixed(2),
      image: variant.imagen ?? "",
    })),
  )

  function addImage(url: string) {
    const value = url.trim()
    if (!value || images.includes(value) || images.length >= MAX_GALLERY_IMAGES) return
    setImages((current) => [...current, value])
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((item) => item !== url))
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImages((current) => {
      const target = index + direction
      if (target < 0 || target >= current.length) return current

      const next = [...current]
      const moved = next[index]
      next[index] = next[target]
      next[target] = moved
      return next
    })
  }

  function addVariant() {
    setVariants((current) => [
      ...current,
      { id: "", label: "", stock: "0", price: "", image: "" },
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
      image: variant.image,
    })),
  )

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/productos" className="text-sm text-muted transition-colors hover:text-ink">
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
        <input type="hidden" name="images" value={JSON.stringify(images)} />
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

          <Field label="Precio anterior (opcional)">
            <input
              type="text"
              name="compareAtPrice"
              inputMode="decimal"
              defaultValue={
                product?.precioAnterior === null || product?.precioAnterior === undefined
                  ? ""
                  : product.precioAnterior.toFixed(2)
              }
              className={inputClass}
              placeholder="Ej. 590.00"
            />
            <span className="mt-1 block text-xs text-muted">
              Si lo completás, la tienda muestra el precio tachado y una etiqueta de descuento.
            </span>
          </Field>
        </div>

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

        {variants.length === 0 && !madeToOrder && (
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

        <div className="border-t border-ink/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs uppercase tracking-[0.16em] text-muted">
                Galería del producto
              </h3>
              <p className="mt-1 text-xs text-muted">
                Hasta {MAX_GALLERY_IMAGES} fotos. La primera es la portada que se usa en las
                tarjetas, el carrito y WhatsApp.
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted">
              {images.length}/{MAX_GALLERY_IMAGES}
            </span>
          </div>

          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((url, index) => (
                <div
                  key={url}
                  className="relative h-28 w-24 overflow-hidden rounded-xl border border-ink/10 bg-sand"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-ink/85 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-cream">
                      Portada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 rounded-full bg-wine/90 p-1 text-cream transition-colors hover:bg-wine"
                    aria-label={`Quitar foto ${index + 1}`}
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                  <div className="absolute inset-x-1 bottom-1 flex justify-between">
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      className="rounded-full bg-ink/80 p-1 text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Mover foto ${index + 1} antes`}
                    >
                      <ArrowLeftIcon className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                      className="rounded-full bg-ink/80 p-1 text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Mover foto ${index + 1} después`}
                    >
                      <ArrowRightIcon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_GALLERY_IMAGES && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  inputMode="url"
                  value={newImage}
                  onChange={(event) => setNewImage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return
                    event.preventDefault()
                    addImage(newImage)
                    setNewImage("")
                  }}
                  className={`${inputClass} min-w-0 flex-1`}
                  placeholder="https://angelesfile.styledflow.com/productos/foto.jpg"
                  aria-label="URL de la nueva foto"
                />
                <button
                  type="button"
                  onClick={() => {
                    addImage(newImage)
                    setNewImage("")
                  }}
                  disabled={!newImage.trim()}
                  className="w-full shrink-0 rounded-xl border border-ink/20 px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Agregar
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <ImageUpload folder="productos" onUploaded={addImage} label="Subir foto" />
                <span className="text-xs text-muted">o pegá una URL</span>
              </div>
            </div>
          )}

          <p className="mt-2 text-xs text-muted">
            Las fotos se suben al bucket R2 y quedan con URL pública.
          </p>
        </div>

        <div className="border-t border-ink/10 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs uppercase tracking-[0.16em] text-muted">
                Opciones / variantes
              </h3>
              <p className="mt-1 text-xs text-muted">
                {madeToOrder
                  ? "Tallas, colores o tamaños. En productos por encargo el stock no se controla."
                  : "Tallas, colores, tamaños u otra característica. Si agregás opciones, el stock se maneja por opción."}
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="w-full shrink-0 rounded-full border border-ink/20 px-3 py-1.5 text-xs transition-colors hover:border-ink hover:bg-sand sm:w-auto"
            >
              + Agregar opción
            </button>
          </div>

          {variants.length > 0 ? (
            <div className="mt-3 space-y-2">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-xl border border-ink/10 bg-white/50 p-3"
                >
                  <div className="grid gap-2 sm:grid-cols-[1fr_4.5rem_5.5rem_auto] sm:items-center">
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
                    <div className="grid grid-cols-2 gap-2 sm:contents">
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
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="justify-self-end rounded-full p-2 text-muted transition-colors hover:bg-wine/10 hover:text-wine sm:justify-self-auto"
                      aria-label={`Quitar opción ${index + 1}`}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      inputMode="url"
                      value={variant.image}
                      onChange={(event) =>
                        updateVariant(index, "image", event.target.value)
                      }
                      className={`${inputClass} min-w-0 flex-1`}
                      placeholder="Foto de esta opción (opcional)"
                      aria-label={`Foto de la opción ${index + 1}`}
                    />
                    <ImageUpload
                      folder="productos"
                      label="Subir"
                      onUploaded={(url) => updateVariant(index, "image", url)}
                      className="w-full justify-center sm:w-auto"
                    />
                  </div>

                  {variant.image && (
                    <div className="flex items-center gap-2">
                      <div className="h-16 w-14 overflow-hidden rounded-lg border border-ink/10 bg-sand">
                        <img
                          src={variant.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted">
                        Se muestra primero al elegir esta opción.
                      </p>
                    </div>
                  )}
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product?.active ?? true}
              className="h-4 w-4 accent-ink"
            />
            Visible en la tienda
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm">
            <input
              type="checkbox"
              name="madeToOrder"
              checked={madeToOrder}
              onChange={(event) => setMadeToOrder(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-ink"
            />
            <span>
              <span className="block">Producto por encargo</span>
              <span className="mt-0.5 block text-xs text-muted">
                No se controla stock y la tarjeta muestra la etiqueta.
              </span>
            </span>
          </label>
        </div>

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
