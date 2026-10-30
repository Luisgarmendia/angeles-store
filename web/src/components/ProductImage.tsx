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

  useEffect(() => {
    setFailed(false)
  }, [src])

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
      sizes={sizes ?? "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
