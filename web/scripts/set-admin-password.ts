import "dotenv/config"
import bcrypt from "bcryptjs"
import { getDb } from "../src/db"
import { adminUsers } from "../src/db/schema"

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD ?? ""
  const roleInput = process.env.ADMIN_ROLE?.trim().toLowerCase()

  if (!email || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters.")
  }
  if (roleInput !== undefined && roleInput !== "owner" && roleInput !== "staff") {
    throw new Error("ADMIN_ROLE must be owner or staff.")
  }

  const role = (roleInput ?? "staff") as "owner" | "staff"

  const passwordHash = await bcrypt.hash(password, 12)

  await getDb()
    .insert(adminUsers)
    .values({ email, passwordHash, role })
    .onConflictDoUpdate({
      target: adminUsers.email,
      set: roleInput ? { passwordHash, role } : { passwordHash },
    })

  console.log(`Admin password updated for ${email}.`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
