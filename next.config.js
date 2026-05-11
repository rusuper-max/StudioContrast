/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pokaži Next-u tačan “root” (sprečava lutanje zbog više lockfile-ova)
  turbopack: {
    root: __dirname,
  },

  // Ako ipak promakne lint error, build neće pasti (sigurnosna mreža)
  eslint: {
    ignoreDuringBuilds: true,
    // (opciono) ograniči lint samo na projekt:
    // dirs: ['src', 'scripts']
  },

  images: {
    unoptimized: true,
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;