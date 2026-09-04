import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: "/train",
        destination: "/?tab=train",
      },
      {
        source: "/train/:day",
        destination: "/?tab=train&day=:day",
      },
      {
        source: "/weight",
        destination: "/?tab=weight",
      },
      {
        source: "/home",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;
