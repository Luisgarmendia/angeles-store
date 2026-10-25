import { useEffect, useState } from "react"
import { config } from "../config"

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand px-3 text-center text-muted">
        <span className="font-display text-sm uppercase leading-tight tracking-[0.16em]">
          {config.brand.name}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em]">Sin imagen</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
