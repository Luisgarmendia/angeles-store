"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { UploadIcon } from "@/components/Icons"

interface ImageUploadProps {
  folder: "productos" | "portada"
  onUploaded: (url: string) => void
  label?: string
  className?: string
}

export function ImageUpload({
  folder,
  onUploaded,
  label = "Subir foto",
  className = "",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.")
      return
    }
    if (file.size > 1_500_000) {
      setError("La imagen supera 1.5 MB. Comprimila o usá una URL.")
      return
    }

    setBusy(true)
    setError(null)

    try {
      const body = new FormData()
      body.set("file", file)
      body.set("folder", folder)

      const response = await fetch("/api/admin/upload", { method: "POST", body })
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "No se pudo subir la imagen.")
      }

      onUploaded(data.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo subir la imagen.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`inline-flex items-center gap-2 rounded-xl border border-ink/20 px-3 py-2 text-sm transition-colors hover:border-ink hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        <UploadIcon className="h-4 w-4" />
        {busy ? "Subiendo…" : label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        onChange={handleFile}
      />

      {error && (
        <p className="mt-2 rounded-lg bg-wine/10 px-3 py-2 text-xs text-wine" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
