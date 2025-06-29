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
    // Mejor corregir errores que ignorarlos por completo
    ignoreBuildErrors: false,
  },
  eslint: {
    // Mejor corregir lints que ignorarlos por completo
    ignoreDuringBuilds: false,
  },
  // Opcional: asegura Node 18 en Vercel
  engines: {
    node: '18.x',
  },
}

export default nextConfig
