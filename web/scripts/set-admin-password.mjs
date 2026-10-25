import bcrypt from "bcryptjs"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required")

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ""

if (!email || password.length < 8) {
  throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters.")
}

const pool = new pg.Pool({ connectionString })
const passwordHash = await bcrypt.hash(password, 12)

await pool.query(
  `insert into admin_users (email, password_hash) values ($1, $2)
   on conflict (email) do update set password_hash = excluded.password_hash`,
  [email, passwordHash],
)

await pool.end()
console.log(`Admin password updated for ${email}.`)
