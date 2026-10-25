import "server-only"

import { randomUUID } from "node:crypto"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
}

export const MAX_IMAGE_BYTES = 1_500_000

export type UploadFolder = "productos" | "portada"

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
  const extension = EXTENSIONS[file.type]
  if (!extension) {
    throw new Error("Formato no permitido. Usá JPG, PNG, WEBP o AVIF.")
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("La imagen supera 1.5 MB. Comprimila o usá una URL.")
  }

  const value = config()
  const key = `${folder}/${randomUUID()}.${extension}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: value.bucket!,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )

  return `${value.publicUrl}/${key}`
}
