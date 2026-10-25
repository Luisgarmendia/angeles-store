const COUNTRY_CODE = "504"
const LOCAL_LENGTH = 8

/**
 * Accepts a Honduran number written as "9999-8888", "+504 9999 8888" or
 * "50499998888" and returns the international digits-only form. Returns null
 * when the number cannot be a valid Honduran mobile/landline number.
 */
export function normalizeHonduranPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")

  if (digits.length === LOCAL_LENGTH) {
    return `${COUNTRY_CODE}${digits}`
  }

  if (digits.length === COUNTRY_CODE.length + LOCAL_LENGTH && digits.startsWith(COUNTRY_CODE)) {
    return digits
  }

  return null
}

/** Human-friendly display: "+504 9999-8888". Invalid input is returned trimmed. */
export function formatHonduranPhone(input: string): string {
  const digits = input.replace(/\D/g, "")
  const local =
    digits.length === COUNTRY_CODE.length + LOCAL_LENGTH && digits.startsWith(COUNTRY_CODE)
      ? digits.slice(COUNTRY_CODE.length)
      : digits

  if (local.length !== LOCAL_LENGTH) return input.trim()

  return `+${COUNTRY_CODE} ${local.slice(0, 4)}-${local.slice(4)}`
}
