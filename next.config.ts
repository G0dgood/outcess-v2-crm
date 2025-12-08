import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    base_url: process.env.base_url,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.artic.edu',
        pathname: '/iiif/**',
      },
    ],
  },
};

export default nextConfig;
