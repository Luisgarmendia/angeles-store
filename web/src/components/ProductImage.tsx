"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useStoreSettings } from "./store-settings-provider"

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  sizes,
}: ProductImageProps) {
  const { store } = useStoreSettings()
  const [failed, setFailed] = useState(false)

  const [prevSrc, setPrevSrc] = useState(src)
  if (src !== prevSrc) {
    setPrevSrc(src)
    setFailed(false)
  }

  // Objects on the R2 CDN are already served with immutable caching and no
  // transformation, while the Next optimizer has to reach that hostname from
  // the server runtime. When Cloudflare blocks that request, the optimizer
  // answers 403 and every product image disappears. Letting the browser fetch
  // external URLs directly removes the server from the path entirely; bundled
  // assets keep the optimizer.
  const unoptimized = /^https?:\/\//i.test(src)

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand px-3 text-center text-muted">
        <span className="font-display text-sm uppercase leading-tight tracking-[0.16em]">
          {store.name}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em]">Sin imagen</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={unoptimized}
      sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
