import { readFileSync } from "node:fs"
import path from "node:path"
import bcrypt from "bcryptjs"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required")

const products = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/productos.json"), "utf8"),
)
const settings = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed-settings.json"), "utf8"),
)

const pool = new pg.Pool({ connectionString })

const { rows } = await pool.query("select count(*)::int as count from products")
const hasProducts = (rows[0]?.count ?? 0) > 0

if (!hasProducts) {
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
  console.log(`Seeded ${products.length} products.`)
} else {
  console.log("Products already exist; skipping product seed.")
}

await pool.query(
  `insert into settings (id, data) values (1, $1::jsonb) on conflict (id) do nothing`,
  [JSON.stringify(settings)],
)

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD ?? ""

if (email && password) {
  const passwordHash = await bcrypt.hash(password, 12)
  await pool.query(
    `insert into admin_users (email, password_hash) values ($1, $2) on conflict (email) do nothing`,
    [email, passwordHash],
  )
  console.log(`Admin ready: ${email}.`)
} else {
  console.warn("ADMIN_EMAIL or ADMIN_PASSWORD missing; admin user was not created.")
}

await pool.end()
