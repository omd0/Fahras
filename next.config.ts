import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  cacheComponents: true,
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
