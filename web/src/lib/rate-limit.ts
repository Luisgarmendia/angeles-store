const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

const attempts = new Map<string, { count: number; resetAt: number }>()

export function canAttempt(key: string): boolean {
  const entry = attempts.get(key)
  if (!entry) return true

  if (Date.now() > entry.resetAt) {
    attempts.delete(key)
    return true
  }

  return entry.count < MAX_ATTEMPTS
}

export function recordFailure(key: string): void {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  entry.count += 1
}

export function clearAttempts(key: string): void {
  attempts.delete(key)
}
