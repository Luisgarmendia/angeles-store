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

// In-memory and per server instance: this is a mitigation, not a distributed
// guarantee. A shared store can replace it if the app runs on several nodes.
const ORDER_WINDOW_MS = 60 * 60 * 1000
const MAX_ORDERS = 10

const orders = new Map<string, { count: number; resetAt: number }>()

export function canCreateOrder(key: string): boolean {
  const entry = orders.get(key)
  if (!entry) return true

  if (Date.now() > entry.resetAt) {
    orders.delete(key)
    return true
  }

  return entry.count < MAX_ORDERS
}

export function recordOrder(key: string): void {
  const now = Date.now()
  const entry = orders.get(key)

  if (!entry || now > entry.resetAt) {
    orders.set(key, { count: 1, resetAt: now + ORDER_WINDOW_MS })
    return
  }

  entry.count += 1
}
