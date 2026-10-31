const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

interface Entry {
  count: number
  resetAt: number
}

// Caps the number of live keys so a flood of distinct IPs cannot grow the
// maps without bound. Far larger than real traffic; only reached under abuse.
export const MAX_ENTRIES = 1000

const attempts = new Map<string, Entry>()

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
    insert(attempts, key, { count: 1, resetAt: now + WINDOW_MS })
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

const orders = new Map<string, Entry>()

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
    insert(orders, key, { count: 1, resetAt: now + ORDER_WINDOW_MS })
    return
  }

  entry.count += 1
}

/** Removes entries whose window has already passed. */
function sweep(map: Map<string, Entry>): void {
  const now = Date.now()
  for (const [key, entry] of map) {
    if (now > entry.resetAt) map.delete(key)
  }
}

/**
 * Inserts an entry, sweeping expired ones first and, when the map is still at
 * capacity, evicting the entry closest to expiring so the map stays bounded.
 */
function insert(map: Map<string, Entry>, key: string, entry: Entry): void {
  sweep(map)

  if (!map.has(key) && map.size >= MAX_ENTRIES) {
    let oldestKey: string | undefined
    let oldestResetAt = Number.POSITIVE_INFINITY
    for (const [candidate, candidateEntry] of map) {
      if (candidateEntry.resetAt < oldestResetAt) {
        oldestResetAt = candidateEntry.resetAt
        oldestKey = candidate
      }
    }
    if (oldestKey !== undefined) map.delete(oldestKey)
  }

  map.set(key, entry)
}

/** Live key counts, exposed for tests and monitoring. */
export function rateLimitSizes(): { attempts: number; orders: number } {
  return { attempts: attempts.size, orders: orders.size }
}
