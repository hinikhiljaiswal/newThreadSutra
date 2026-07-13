import type { NextConfig } from 'next';

const apiPort = process.env.API_PORT ?? '5050';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL ?? `http://127.0.0.1:${apiPort}`}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
