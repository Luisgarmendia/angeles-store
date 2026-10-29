import { createProductReviewAction } from "@/app/admin/actions"
import type { ProductReview } from "@/lib/types"

interface ProductReviewsFormProps {
  productId: string
  reviews: ProductReview[]
}

export function ProductReviewsForm({ productId, reviews }: ProductReviewsFormProps) {
  return (
    <section className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted">Opiniones verificadas</p>
      <h2 className="mt-1 font-display text-2xl text-ink">Agregar opinión de una clienta</h2>
      <p className="mt-2 text-sm text-muted">
        Solo agrega opiniones reales con autorización de la clienta. Se publican inmediatamente.
      </p>
      <form action={createProductReviewAction} className="mt-5 grid gap-3">
        <input type="hidden" name="productId" value={productId} />
        <input
          name="authorName"
          required
          maxLength={80}
          placeholder="Nombre visible"
          className="rounded-xl border border-ink/15 bg-transparent px-3 py-2 text-sm"
        />
        <select
          name="rating"
          defaultValue="5"
          className="rounded-xl border border-ink/15 bg-transparent px-3 py-2 text-sm"
          aria-label="Calificación"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} de 5 estrellas
            </option>
          ))}
        </select>
        <textarea
          name="body"
          required
          minLength={5}
          maxLength={1000}
          rows={3}
          placeholder="Opinión de la clienta"
          className="rounded-xl border border-ink/15 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="w-fit rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream hover:bg-wine"
        >
          Publicar opinión
        </button>
      </form>
      {reviews.length > 0 && (
        <div className="mt-6 space-y-3 border-t border-ink/10 pt-5">
          {reviews.map((review) => (
            <div key={review.id} className="text-sm">
              <p className="font-medium text-ink">
                {review.authorName} · {"★".repeat(review.rating)}
              </p>
              <p className="mt-1 text-muted">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
