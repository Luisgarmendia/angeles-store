import bcrypt from "bcryptjs"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required")

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ""
const role = (process.env.ADMIN_ROLE ?? "staff").trim().toLowerCase()
const weakPasswords = new Set([
  "change-me-with-12-plus",
  "replace-this-with-a-real-password",
  "change-me-please",
])

if (!email || password.length < 12 || weakPasswords.has(password)) {
  throw new Error("Set ADMIN_EMAIL and a real ADMIN_PASSWORD of at least 12 characters.")
}
if (role !== "owner" && role !== "staff") {
  throw new Error("ADMIN_ROLE must be owner or staff.")
}

const pool = new pg.Pool({ connectionString })
const passwordHash = await bcrypt.hash(password, 12)

await pool.query(
  `insert into admin_users (email, password_hash, role) values ($1, $2, $3)
   on conflict (email) do update set password_hash = excluded.password_hash`,
  [email, passwordHash, role],
)

await pool.end()
console.log(`Admin password updated for ${email}.`)
