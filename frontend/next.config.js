  /** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-render-app.onrender.com'],
    unoptimized: true, // Required for static exports if needed
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://your-render-app.onrender.com',
  },
  // Enable static exports for Vercel
  output: 'standalone',
}

module.exports = nextConfig
















// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       domains: ['localhost'],
//     },
//     async rewrites() {
//       return [
//         {
//           source: '/api/:path*',
//           destination: 'http://localhost:8000/api/:path*',
//         },
//       ];
//     },
//   }
  
//   module.exports = nextConfig

