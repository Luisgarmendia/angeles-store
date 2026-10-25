export const MAX_IMAGE_BYTES = 1_500_000

/**
 * Reads an image as a Base64 data URL after checking its type and size.
 * Phase 2 (Cloudflare R2) can replace this with an upload that returns a URL.
 */
export function readImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("El archivo debe ser una imagen."))
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error("La imagen supera 1.5 MB. Usa una URL o una foto más liviana."))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."))
    reader.readAsDataURL(file)
  })
}
