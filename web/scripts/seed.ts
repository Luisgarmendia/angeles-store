import "dotenv/config"
import { readFileSync } from "node:fs"
import path from "node:path"
import bcrypt from "bcryptjs"
import { getDb } from "../src/db"
import { adminUsers, products, settings } from "../src/db/schema"
import { DEFAULT_SETTINGS } from "../src/lib/settings"
import type { Product } from "../src/lib/types"

async function main() {
  const seedProducts = JSON.parse(
    readFileSync(path.join(process.cwd(), "src/data/productos.json"), "utf8"),
  ) as Product[]

  const email = (process.env.ADMIN_EMAIL ?? "admin@angelesstore.local").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? "angeles1234"

  const db = getDb()

  for (const [index, product] of seedProducts.entries()) {
    await db
      .insert(products)
      .values({
        id: product.id,
        name: product.nombre,
        priceCents: Math.round(product.precio * 100),
        category: product.categoria,
        description: product.descripcion,
        image: product.imagen,
        active: true,
        sortOrder: index,
        madeToOrder: product.porEncargo ?? false,
        compareAtPriceCents:
          product.precioAnterior === null || product.precioAnterior === undefined
            ? null
            : Math.round(product.precioAnterior * 100),
      })
      .onConflictDoUpdate({
        target: products.id,
        set: {
          name: product.nombre,
          priceCents: Math.round(product.precio * 100),
          category: product.categoria,
          description: product.descripcion,
          image: product.imagen,
          sortOrder: index,
          madeToOrder: product.porEncargo ?? false,
          compareAtPriceCents:
            product.precioAnterior === null || product.precioAnterior === undefined
              ? null
              : Math.round(product.precioAnterior * 100),
          updatedAt: new Date(),
        },
      })
  }

  await db.insert(settings).values({ id: 1, data: DEFAULT_SETTINGS }).onConflictDoNothing()

  await db
    .insert(adminUsers)
    .values({ email, passwordHash: await bcrypt.hash(password, 12) })
    .onConflictDoNothing()

  console.log(`Seed listo: ${seedProducts.length} productos, ajustes y admin ${email}.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
