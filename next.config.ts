// next.config.js
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};

export default nextConfig;
