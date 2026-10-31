import { beforeEach, describe, expect, it, vi } from "vitest"
import { productVariants, products, settings } from "@/db/schema"

// The production code reaches the database through a single `getDb()` call, so
// the double below replaces only that entry point and keeps the real table
// objects: the fake can then tell which table each statement targets.
const dbRef = vi.hoisted(() => ({ current: undefined as unknown }))

vi.mock("@/db", () => ({ getDb: () => dbRef.current }))

/**
 * A database double that models the one property under test: the row a
 * transaction *reads* and the row it *writes* are not the same fact. An admin
 * edit, or a transaction that committed between this statement and the next,
 * can leave the real stock below the snapshot this transaction selected.
 *
 * The double therefore applies the same rule Postgres applies to a guarded
 * `UPDATE ... WHERE stock >= n`: it matches zero rows when the real stock is
 * short, and reports how many rows it matched through `returning()`. A
 * statement that writes an absolute value instead of a guarded decrement is
 * recorded as such — that shape is exactly what silently overwrites a newer
 * number.
 */
interface FakeDbOptions {
  /** Stock the transaction's SELECT observes. */
  snapshotStock: number
  /** Stock actually persisted when the UPDATE runs. */
  realStock: number
  quantity: number
}

interface RecordedUpdate {
  table: string
  /** True when the statement expresses a decrement instead of a constant. */
  relative: boolean
  matched: number
}

function makeFakeDb(options: FakeDbOptions) {
  const updates: RecordedUpdate[] = []
  const inserts: string[] = []

  const product = {
    id: "p1",
    name: "Crema de prueba",
    priceCents: 25000,
    category: "cremas",
    description: "Producto de prueba",
    image: "",
    images: [],
    active: true,
    sortOrder: 0,
    stock: null,
    madeToOrder: false,
    compareAtPriceCents: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  }

  const variants = [
    {
      id: "v1",
      productId: "p1",
      label: "Único",
      stock: options.snapshotStock,
      priceCents: null,
      image: null,
      sortOrder: 0,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    },
  ]

  const guardedMatch = options.realStock >= options.quantity

  const tx = {
    select: () => ({
      from: (table: unknown) => {
        if (table === settings) {
          return {
            where: () => ({
              limit: async () => [{ data: { payments: ["efectivo"] } }],
            }),
          }
        }
        if (table === products) {
          return { where: () => ({ for: async () => [product] }) }
        }
        if (table === productVariants) {
          return { where: () => ({ orderBy: async () => variants }) }
        }
        throw new Error(`unexpected select: ${String(table)}`)
      },
    }),
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => ({
        where: () => {
          // Drizzle defers the write until the statement is awaited or
          // `.returning()` is called. Both shapes must resolve.
          const record = (): RecordedUpdate => {
            const relative = typeof values.stock !== "number"
            const matched = relative && !guardedMatch ? 0 : 1
            const update = {
              table: table === productVariants ? "productVariants" : "products",
              relative,
              matched,
            }
            updates.push(update)
            return update
          }
          const statement = {
            returning: async () => (record().matched > 0 ? [{ id: "v1" }] : []),
            then: (resolve: (value: unknown) => unknown) => resolve(record()),
          }
          return statement
        },
      }),
    }),
    insert: (table: unknown) => ({
      values: () => ({
        returning: async () => {
          inserts.push(table === productVariants ? "productVariants" : "row")
          return [{ id: "order-1", number: 1 }]
        },
        then: (resolve: (value: unknown) => unknown) => {
          inserts.push(table === productVariants ? "productVariants" : "row")
          return resolve(undefined)
        },
      }),
    }),
  }

  return {
    db: {
      select: tx.select,
      transaction: async (callback: (t: unknown) => unknown) => callback(tx),
    },
    updates,
    inserts,
  }
}

import { OrderError, createOrderInDb } from "./orders-server"

const orderInput = (quantity: number) => ({
  customer: {
    nombre: "Ana Pérez",
    direccion: "Calle de prueba 123",
    telefono: "9999-8888",
    pago: "efectivo" as const,
    notas: "",
  },
  items: [{ productId: "p1", variantId: "v1", quantity }],
})

let harness: ReturnType<typeof makeFakeDb>

function useDb(options: FakeDbOptions) {
  harness = makeFakeDb(options)
  dbRef.current = harness.db
}

beforeEach(() => {
  dbRef.current = undefined
})

describe("createOrderInDb stock guard (S1)", () => {
  it("decrements variant stock with a guarded statement, not a constant", async () => {
    useDb({ snapshotStock: 5, realStock: 5, quantity: 2 })

    await createOrderInDb(orderInput(2))

    const variantUpdate = harness.updates.find((entry) => entry.table === "productVariants")
    expect(variantUpdate).toBeDefined()
    expect(variantUpdate?.relative).toBe(true)
  })

  it("rejects the order when the persisted stock is below the snapshot it read", async () => {
    // The transaction selected a snapshot of 5, but a concurrent commit (an
    // admin edit or another checkout) already brought the row down to 1.
    useDb({ snapshotStock: 5, realStock: 1, quantity: 2 })

    await expect(createOrderInDb(orderInput(2))).rejects.toBeInstanceOf(OrderError)
  })

  it("does not create an order row when the stock guard rejects the line", async () => {
    useDb({ snapshotStock: 5, realStock: 1, quantity: 2 })

    await expect(createOrderInDb(orderInput(2))).rejects.toBeInstanceOf(OrderError)
    expect(harness.inserts).toHaveLength(0)
  })

  it("still accepts a line that fits the persisted stock", async () => {
    useDb({ snapshotStock: 5, realStock: 3, quantity: 2 })

    const order = await createOrderInDb(orderInput(2))

    expect(order.total).toBe(500)
    expect(harness.inserts.length).toBeGreaterThan(0)
  })
})
