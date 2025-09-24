/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs'],
  },
}

module.exports = nextConfig