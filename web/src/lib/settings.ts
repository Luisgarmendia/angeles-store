import { config } from "./config"
import { ALL_PAYMENT_METHODS, enabledPaymentMethods } from "./payments"
import type { HeroContent, StoreInfo, StoreSettings } from "./types"

export type StoredSettings = Partial<Omit<StoreSettings, "hero" | "store">> & {
  hero?: Partial<HeroContent>
  store?: Partial<StoreInfo>
}

export const DEFAULT_SETTINGS: StoreSettings = {
  store: {
    name: config.brand.name,
    address: "Tegucigalpa, Honduras",
    description: config.brand.description,
  },
  whatsapp: config.contact.whatsapp,
  instagram: config.contact.instagram,
  facebook: config.contact.facebook,
  tiktok: config.contact.tiktok,
  payments: [...ALL_PAYMENT_METHODS],
  hero: { ...config.hero, trust: [...config.hero.trust] },
}

function mergeStore(fallback: StoreInfo, value: Partial<StoreInfo> | undefined): StoreInfo {
  if (!value || typeof value !== "object") return fallback

  return {
    name:
      typeof value.name === "string" && value.name.trim().length > 0
        ? value.name
        : fallback.name,
    address: typeof value.address === "string" ? value.address : fallback.address,
    description:
      typeof value.description === "string" ? value.description : fallback.description,
  }
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
    store: mergeStore(DEFAULT_SETTINGS.store, safe.store),
    whatsapp: typeof safe.whatsapp === "string" ? safe.whatsapp : DEFAULT_SETTINGS.whatsapp,
    instagram: typeof safe.instagram === "string" ? safe.instagram : DEFAULT_SETTINGS.instagram,
    facebook: typeof safe.facebook === "string" ? safe.facebook : DEFAULT_SETTINGS.facebook,
    tiktok: typeof safe.tiktok === "string" ? safe.tiktok : DEFAULT_SETTINGS.tiktok,
    payments: enabledPaymentMethods(safe.payments),
    hero: mergeHero(DEFAULT_SETTINGS.hero, safe.hero),
  }
}
