import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return process.env.NEXT_PUBLIC_API_BASE_URL?.startsWith('http://localhost:')
      ? [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
          },
        ]
      : [];
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
