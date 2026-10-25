export const dynamic = "force-dynamic"

function readPublicConfig(): unknown | null {
  const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
  if (!raw?.trim()) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null
    return parsed
  } catch {
    return null
  }
}

export function GET() {
  const config = readPublicConfig()

  return new Response(`self.FIREBASE_CONFIG = ${JSON.stringify(config)};`, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-store",
    },
  })
}
