import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as { pool?: Pool }

export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not configured")

  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({ connectionString: url, max: 10 })
  }

  return drizzle(globalForDb.pool, { schema })
}
