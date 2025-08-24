// next.config.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

module.exports = {
  // Enable images optimization
  images: {
    domains: ['placehold.co', 'example.com', 'anotherdomain.com', 'localhost'],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
  },

  // Rewrite API routes to point to the backend server
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },

  // Set CORS headers for API routes
  async headers() {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:9002',
      'https://6000-firebase-studio-1754361228920.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev',
    ];

    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins.join(', '),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};