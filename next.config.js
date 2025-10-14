/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Ignorar errores de TypeScript al compilar
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Ignorar errores de ESLint al compilar
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

