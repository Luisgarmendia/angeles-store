import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    // The repository holds two applications: this Vite storefront at the root
    // and the Next.js app under `web/`, which has its own runner and its own
    // `@/` alias. Collecting both here made `npm test` fail on files this
    // config cannot resolve, so each project now owns its own scope.
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
