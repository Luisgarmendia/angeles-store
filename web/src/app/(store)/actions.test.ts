import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  ip: "203.0.113.1",
  calls: [] as Array<{ customer: { telefono: string } }>,
  failNext: false,
}))

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": state.ip }),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/lib/orders-server", () => {
  class OrderError extends Error {}
  return {
    OrderError,
    createOrderInDb: vi.fn(async (input: { customer: { telefono: string } }) => {
      state.calls.push(input)
      if (state.failNext) {
        state.failNext = false
        throw new OrderError("No hay stock suficiente.")
      }
      return {
        id: `order-${state.calls.length}`,
        number: state.calls.length,
        lines: [],
        total: 0,
      }
    }),
  }
})

import { createOrderAction } from "./actions"

const input = (telefono: string) => ({
  customer: {
    nombre: "Ana Pérez",
    direccion: "Calle de prueba 123",
    telefono,
    pago: "efectivo" as const,
    notas: "",
  },
  items: [{ productId: "p1", variantId: null, quantity: 1 }],
})

let ip = 1
beforeEach(() => {
  state.calls.length = 0
  state.failNext = false
  state.ip = `203.0.113.${ip++}`
})

describe("createOrderAction checkout integrity (S2)", () => {
  it("rejects an invalid phone before touching the database", async () => {
    const result = await createOrderAction(input("123"))
    expect(result.error).toBe("Escribe un teléfono hondureño válido, por ejemplo 9999-8888.")
    expect(state.calls).toHaveLength(0)
  })

  it("normalizes the phone on the server before inserting", async () => {
    const result = await createOrderAction(input("9999-8888"))
    expect(result.error).toBeUndefined()
    expect(state.calls).toHaveLength(1)
    expect(state.calls[0].customer.telefono).toBe("50499998888")
    expect(result.id).toBe("order-1")
  })

  it("allows ten successful orders per forwarded IP and blocks the eleventh", async () => {
    for (let index = 0; index < 10; index += 1) {
      expect((await createOrderAction(input("9999-8888"))).error).toBeUndefined()
    }
    expect(state.calls).toHaveLength(10)
    expect((await createOrderAction(input("9999-8888"))).error).toBe(
      "Recibimos demasiados pedidos desde tu conexión. Esperá una hora e intentá de nuevo.",
    )
    expect(state.calls).toHaveLength(10)
  })

  it("does not count a failed insert against the limit", async () => {
    state.failNext = true
    expect((await createOrderAction(input("9999-8888"))).error).toBe("No hay stock suficiente.")
    for (let index = 0; index < 10; index += 1) {
      expect((await createOrderAction(input("9999-8888"))).error).toBeUndefined()
    }
    expect((await createOrderAction(input("9999-8888"))).error).toContain("demasiados pedidos")
  })

  it("keeps the limit per forwarded IP", async () => {
    state.ip = "198.51.100.7"
    for (let index = 0; index < 10; index += 1) await createOrderAction(input("9999-8888"))
    expect((await createOrderAction(input("9999-8888"))).error).toContain("demasiados pedidos")
    state.ip = "198.51.100.8"
    expect((await createOrderAction(input("9999-8888"))).error).toBeUndefined()
  })
})
