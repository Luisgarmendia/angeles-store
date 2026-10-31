import { afterEach, describe, expect, it, vi } from "vitest"
import {
  canAttempt,
  canCreateOrder,
  MAX_ENTRIES,
  rateLimitSizes,
  recordFailure,
  recordOrder,
} from "./rate-limit"

/** The limiter keeps a module-level map, so every test uses its own keys. */
function uniqueKey(label: string): string {
  return `order:test-${label}-${crypto.randomUUID()}`
}

function fill(key: string, times: number, record: (key: string) => void): void {
  for (let index = 0; index < times; index += 1) record(key)
}

afterEach(() => {
  vi.useRealTimers()
})

describe("order rate limit", () => {
  it("allows ten orders per key and blocks the eleventh", () => {
    const key = uniqueKey("burst")

    for (let index = 0; index < 10; index += 1) {
      expect(canCreateOrder(key)).toBe(true)
      recordOrder(key)
    }

    expect(canCreateOrder(key)).toBe(false)
  })

  it("keeps each key independent", () => {
    const blocked = uniqueKey("blocked")
    const other = uniqueKey("other")
    fill(blocked, 10, recordOrder)

    expect(canCreateOrder(blocked)).toBe(false)
    expect(canCreateOrder(other)).toBe(true)
  })

  it("resets the count after the one-hour window", () => {
    vi.useFakeTimers()
    const key = uniqueKey("window")
    fill(key, 10, recordOrder)
    expect(canCreateOrder(key)).toBe(false)

    vi.advanceTimersByTime(60 * 60 * 1000 + 1)

    expect(canCreateOrder(key)).toBe(true)
  })

  it("keeps the login limiter independent from the order limiter", () => {
    const key = uniqueKey("login")
    fill(key, 5, recordFailure)

    expect(canAttempt(key)).toBe(false)
    expect(canCreateOrder(key)).toBe(true)
  })
})

describe("bounded growth", () => {
  it("caps the stored order entries at MAX_ENTRIES", () => {
    for (let index = 0; index < MAX_ENTRIES + 50; index += 1) {
      recordOrder(`order:flood-${index}`)
    }

    expect(rateLimitSizes().orders).toBe(MAX_ENTRIES)
  })

  it("caps the stored attempt entries at MAX_ENTRIES", () => {
    for (let index = 0; index < MAX_ENTRIES + 50; index += 1) {
      recordFailure(`ip:flood-${index}`)
    }

    expect(rateLimitSizes().attempts).toBe(MAX_ENTRIES)
  })
})
