import { readFileSync } from "node:fs"
import path from "node:path"
import bcrypt from "bcryptjs"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required")

const settings = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed-settings.json"), "utf8"),
)

const storeWhatsapp = (process.env.STORE_WHATSAPP ?? "").trim()
if (storeWhatsapp) {
  const digits = storeWhatsapp.replace(/\D/g, "")
  if (digits.length !== 8 && digits.length !== 11) {
    throw new Error("STORE_WHATSAPP must have 8 local digits or 11 digits including 504.")
  }
  settings.whatsapp = digits.length === 8 ? `504${digits}` : digits
}

if (settings.whatsapp === "50499998888") {
  console.warn(
    "STORE_WHATSAPP is still the placeholder 50499998888. Change it in Ajustes or set STORE_WHATSAPP.",
  )
}

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ""
const weakPasswords = new Set([
  "change-me-with-12-plus",
  "replace-this-with-a-real-password",
  "change-me-please",
])

if (!email) throw new Error("ADMIN_EMAIL is required")
if (password.length < 12 || weakPasswords.has(password)) {
  throw new Error("ADMIN_PASSWORD must be a real password of at least 12 characters.")
}

const pool = new pg.Pool({ connectionString })
const seedProducts = process.env.SEED_PRODUCTS === "true"
const { rows } = await pool.query("select count(*)::int as count from products")
const hasProducts = (rows[0]?.count ?? 0) > 0

if (seedProducts && !hasProducts) {
  const products = JSON.parse(
    readFileSync(path.join(process.cwd(), "data/productos.json"), "utf8"),
  )

  for (const [index, product] of products.entries()) {
    await pool.query(
      `insert into products (id, name, price_cents, category, description, image, active, sort_order)
       values ($1, $2, $3, $4, $5, $6, true, $7)
       on conflict (id) do update set
         name = excluded.name,
         price_cents = excluded.price_cents,
         category = excluded.category,
         description = excluded.description,
         image = excluded.image,
         sort_order = excluded.sort_order,
         updated_at = now()`,
      [
        product.id,
        product.nombre,
        Math.round(product.precio * 100),
        product.categoria,
        product.descripcion,
        product.imagen,
        index,
      ],
    )
  }
  console.log(`Seeded ${products.length} demo products.`)
} else if (seedProducts) {
  console.log("Products already exist; skipping product seed.")
} else {
  console.log("Skipping product seed; the production store starts empty.")
}

await pool.query(
  `insert into settings (id, data) values (1, $1::jsonb) on conflict (id) do nothing`,
  [JSON.stringify(settings)],
)

const passwordHash = await bcrypt.hash(password, 12)
await pool.query(
  `insert into admin_users (email, password_hash) values ($1, $2) on conflict (email) do nothing`,
  [email, passwordHash],
)

console.log(`Settings ready. Admin ready: ${email}.`)
await pool.end()
