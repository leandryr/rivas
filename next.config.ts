/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['http://192.168.1.42:3000'],
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default nextConfig;
