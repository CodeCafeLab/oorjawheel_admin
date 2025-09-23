// next.config.js
const path = require("path");
module.exports = {
  experimental: {
    esmExternals: 'loose',
  },
  // Enable images optimization
  images: {
    domains: ["placehold.co", "example.com", "anotherdomain.com"],
  },

  // Rewrite API routes
  async rewrites() {
    // Support both local development and production URL
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/:path*`,
        },
      ];
    } else if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/api/:path*",
          destination: "https://ow.codecafelab.in/api/:path*",
        },
      ];
    } else {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:9002/api/:path*",
        },
      ];
    }
  },

  // Set headers for API routes
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value:
              "http://localhost:9002, https://6000-firebase-studio-1754361228920.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev/, https://ow.codecafelab.in",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};
