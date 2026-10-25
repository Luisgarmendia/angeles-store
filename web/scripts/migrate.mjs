import pg from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required")

const pool = new pg.Pool({ connectionString })
await migrate(drizzle(pool), { migrationsFolder: "./drizzle" })
await pool.end()

console.log("Migrations applied.")
