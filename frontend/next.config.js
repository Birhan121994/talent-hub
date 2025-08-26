/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'talent-hub-backend-k3f3.onrender.com'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://talent-hub-backend-k3f3.onrender.com',
  },
  output: 'standalone',
};

module.exports = nextConfig;
