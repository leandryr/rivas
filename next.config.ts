/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'res.cloudinary.com'],
  },
  env: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  typescript: {
    // Ignora errores de TypeScript durante el build en producción
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora errores de ESLint durante el build en producción
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
