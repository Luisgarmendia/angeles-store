const PIN_KEY = "amapola.admin.pin"
const SESSION_KEY = "amapola.admin.unlocked"

export const PIN_MIN_LENGTH = 4
export const PIN_MAX_LENGTH = 8

export function isValidPin(pin: string): boolean {
  return /^\d{4,8}$/.test(pin)
}

/**
 * cyrb53-style fallback for browsers without Web Crypto (for example a page
 * opened from `file://`). The stored value is always a hash, never the PIN.
 */
function fallbackHash(value: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57

  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index)
    h1 = Math.imul(h1 ^ char, 2654435761)
    h2 = Math.imul(h2 ^ char, 1597334677)
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return `${(h2 >>> 0).toString(16)}${(h1 >>> 0).toString(16)}`
}

async function hashPin(pin: string): Promise<string> {
  const payload = `angeles-store:${pin}`
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(payload),
    )
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
  }
  return fallbackHash(payload)
}

export function hasAdminPin(): boolean {
  try {
    return Boolean(localStorage.getItem(PIN_KEY))
  } catch {
    return false
  }
}

export async function saveAdminPin(pin: string): Promise<boolean> {
  if (!isValidPin(pin)) return false

  try {
    localStorage.setItem(PIN_KEY, await hashPin(pin))
    return true
  } catch {
    return false
  }
}

export async function verifyAdminPin(pin: string): Promise<boolean> {
  let stored: string | null = null

  try {
    stored = localStorage.getItem(PIN_KEY)
  } catch {
    return false
  }

  if (!stored) return false
  return stored === (await hashPin(pin))
}

/** The unlock lasts for the tab session, not forever. */
export function isAdminUnlocked(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
    return false
  }
}

export function unlockAdmin(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    // The panel still works for this render; a reload asks for the PIN again.
  }
}

export function lockAdmin(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // Nothing to clear.
  }
}
