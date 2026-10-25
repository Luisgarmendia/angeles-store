import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: process.env.BUILD_TARGET === "docker" ? "standalone" : undefined,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
