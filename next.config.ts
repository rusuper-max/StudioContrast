// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // da Next ne traži root po celoj mašini (onaj warning sa lockfile-om)
  turbopack: { root: __dirname },

  // NE ruši build zbog ESLint-a (ključ za Vercel)
  eslint: { ignoreDuringBuilds: true },

  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;