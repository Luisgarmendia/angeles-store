import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "angelesfile.styledflow.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
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
