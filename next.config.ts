import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Las fotos de las motos se sirven desde /public/motos.
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
