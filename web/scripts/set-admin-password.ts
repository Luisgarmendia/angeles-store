import "dotenv/config"
import bcrypt from "bcryptjs"
import { getDb } from "../src/db"
import { adminUsers } from "../src/db/schema"

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? ""
  const role = (process.env.ADMIN_ROLE ?? "staff").trim().toLowerCase()

  if (!email || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters.")
  }
  if (role !== "owner" && role !== "staff") {
    throw new Error("ADMIN_ROLE must be owner or staff.")
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await getDb()
    .insert(adminUsers)
    .values({ email, passwordHash, role })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: { passwordHash },
    })

  console.log(`Admin password updated for ${email}.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
