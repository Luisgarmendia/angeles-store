"use client"

import { useEffect, useState } from "react"
import { ArrowLeftIcon, ArrowRightIcon } from "./Icons"
import { ProductImage } from "./ProductImage"

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [images.join("|")])

  const total = images.length
  const current = total > 0 ? Math.min(index, total - 1) : 0

  function go(delta: number) {
    if (total < 2) return
    setIndex((value) => (value + delta + total) % total)
  }

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
        <ProductImage
          src={images[current] ?? ""}
          alt={alt}
          className="h-full w-full object-cover"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-cream/85 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cream"
              aria-label="Foto anterior"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-cream/85 text-ink shadow-sm backdrop-blur transition-colors hover:bg-cream"
              aria-label="Foto siguiente"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, position) => (
            <button
              key={`${image}-${position}`}
              type="button"
              onClick={() => setIndex(position)}
              className={`h-16 w-14 shrink-0 overflow-hidden rounded-xl border transition-colors ${
                position === current
                  ? "border-ink"
                  : "border-transparent hover:border-ink/30"
              }`}
              aria-label={`Ver foto ${position + 1}`}
              aria-pressed={position === current}
            >
              <ProductImage
                src={image}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
