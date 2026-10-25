const BASES = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/@",
} as const

export type SocialPlatform = keyof typeof BASES

/**
 * Turns what the owner typed in the admin panel into a usable link.
 * Accepts a full URL, a bare handle, or an `@handle`.
 */
export function socialHref(value: string, platform: SocialPlatform): string {
  const raw = value.trim()
  if (!raw) return ""
  if (/^https?:\/\//i.test(raw)) return raw

  const base = BASES[platform]
  return raw.startsWith("@") ? `${base}${raw.slice(1)}` : `${base}${raw}`
}
