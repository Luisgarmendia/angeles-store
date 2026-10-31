import "server-only"

import { randomUUID } from "node:crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

export const MAX_IMAGE_BYTES = 1_500_000

export type UploadFolder = "productos" | "portada"

export interface ImageFormat {
  extension: string
  contentType: string
}

export class InvalidImageFormatError extends Error {
  constructor() {
    super("Formato no permitido. Usá JPG, PNG, WEBP o AVIF.")
    this.name = "InvalidImageFormatError"
  }
}

/**
 * Sniffs the magic bytes of the image formats the app supports: JPEG, PNG,
 * WebP and AVIF. It ignores the client-declared content type entirely so a
 * crafted file cannot claim `image/*` and be stored as an image on the CDN.
 */
export function sniffImageFormat(bytes: Uint8Array): ImageFormat | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" }
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: "png", contentType: "image/png" }
  }

  // WebP: RIFF....WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: "webp", contentType: "image/webp" }
  }

  // AVIF: ISO BMFF "ftyp" box whose major brand is avif or avis
  if (
    bytes.length >= 12 &&
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70
  ) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11])
    if (brand === "avif" || brand === "avis") {
      return { extension: "avif", contentType: "image/avif" }
    }
  }

  return null
}

function config() {
  return {
    endpoint: process.env.R2_ENDPOINT,
    bucket: process.env.R2_BUCKET,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    publicUrl: process.env.R2_PUBLIC_URL?.replace(/\/$/, ""),
  }
}

export function isR2Configured(): boolean {
  const value = config()
  return Boolean(
    value.endpoint &&
      value.bucket &&
      value.accessKeyId &&
      value.secretAccessKey &&
      value.publicUrl,
  )
}

function getClient(): S3Client {
  const value = config()

  if (!isR2Configured()) {
    throw new Error("R2 no está configurado. Faltan variables de entorno.")
  }

  return new S3Client({
    region: "auto",
    endpoint: value.endpoint,
    credentials: {
      accessKeyId: value.accessKeyId!,
      secretAccessKey: value.secretAccessKey!,
    },
  })
}

export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen supera 1.5 MB. Comprimila o usá una URL.")
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const format = sniffImageFormat(bytes)
  if (!format) {
    throw new InvalidImageFormatError()
  }

  const value = config()
  const key = `${folder}/${randomUUID()}.${format.extension}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: value.bucket!,
      Key: key,
      Body: Buffer.from(bytes),
      ContentType: format.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )

  return `${value.publicUrl}/${key}`
}
