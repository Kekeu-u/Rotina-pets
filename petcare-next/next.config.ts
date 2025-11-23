import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desabilita cache durante desenvolvimento
  experimental: {
    // Força revalidação do cache de dados
    staleTimes: {
      dynamic: 0,
      static: 30, // Minimum value required by Next.js
    },
  },

  // Headers para evitar cache no Vercel/CDN durante desenvolvimento
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        },
        {
          key: 'CDN-Cache-Control',
          value: 'no-store'
        },
        {
          key: 'Vercel-CDN-Cache-Control',
          value: 'no-store'
        }
      ]
    }
  ],

  // Gera build IDs únicos para evitar cache entre deploys
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
