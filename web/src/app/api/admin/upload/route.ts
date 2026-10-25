import { NextResponse, type NextRequest } from "next/server"
import { getAdminSession } from "@/lib/auth"
import { isR2Configured, MAX_IMAGE_BYTES, uploadImage, type UploadFolder } from "@/lib/r2"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const FOLDERS: UploadFolder[] = ["productos", "portada"]

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      {
        error:
          "R2 no está configurado. Agregá R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY en el entorno.",
      },
      { status: 503 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 })
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen." }, { status: 400 })
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera 1.5 MB. Comprimila o usá una URL." },
      { status: 400 },
    )
  }

  const requested = String(formData.get("folder") ?? "productos")
  const folder = FOLDERS.includes(requested as UploadFolder)
    ? (requested as UploadFolder)
    : "productos"

  try {
    const url = await uploadImage(file, folder)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("R2 upload failed", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo subir la imagen." },
      { status: 500 },
    )
  }
}
