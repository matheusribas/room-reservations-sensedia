import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.250'],
  images: {
    remotePatterns: [new URL("https://avatar.vercel.sh/shadcn1")],
  },
}

export default nextConfig
