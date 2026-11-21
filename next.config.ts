import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dqq6hmbhjgrfe.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;