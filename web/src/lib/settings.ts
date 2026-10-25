import { config } from "./config"
import { ALL_PAYMENT_METHODS, enabledPaymentMethods } from "./payments"
import type { HeroContent, StoreSettings } from "./types"

export type StoredSettings = Partial<Omit<StoreSettings, "hero">> & {
  hero?: Partial<HeroContent>
}

export const DEFAULT_SETTINGS: StoreSettings = {
  whatsapp: config.contact.whatsapp,
  instagram: config.contact.instagram,
  facebook: config.contact.facebook,
  tiktok: config.contact.tiktok,
  payments: [...ALL_PAYMENT_METHODS],
  hero: { ...config.hero, trust: [...config.hero.trust] },
}

function mergeHero(fallback: HeroContent, value: Partial<HeroContent> | undefined): HeroContent {
  if (!value || typeof value !== "object") return fallback

  const pick = (key: keyof HeroContent, defaultValue: string): string =>
    typeof value[key] === "string" ? (value[key] as string) : defaultValue

  return {
    tagline: pick("tagline", fallback.tagline),
    headline: pick("headline", fallback.headline),
    accent: pick("accent", fallback.accent),
    description: pick("description", fallback.description),
    ctaLabel: pick("ctaLabel", fallback.ctaLabel),
    secondaryLabel: pick("secondaryLabel", fallback.secondaryLabel),
    trust: Array.isArray(value.trust)
      ? value.trust.filter((item): item is string => typeof item === "string")
      : fallback.trust,
    image: pick("image", fallback.image),
    imageAlt: pick("imageAlt", fallback.imageAlt),
  }
}

/** Fills a settings row from an older version with the current defaults. */
export function mergeSettings(stored: StoredSettings | null | undefined): StoreSettings {
  const safe = stored && typeof stored === "object" ? stored : {}

  return {
    whatsapp: typeof safe.whatsapp === "string" ? safe.whatsapp : DEFAULT_SETTINGS.whatsapp,
    instagram: typeof safe.instagram === "string" ? safe.instagram : DEFAULT_SETTINGS.instagram,
    facebook: typeof safe.facebook === "string" ? safe.facebook : DEFAULT_SETTINGS.facebook,
    tiktok: typeof safe.tiktok === "string" ? safe.tiktok : DEFAULT_SETTINGS.tiktok,
    payments: enabledPaymentMethods(safe.payments),
    hero: mergeHero(DEFAULT_SETTINGS.hero, safe.hero),
  }
}
