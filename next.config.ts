import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackSourceMaps: false,
  },
};

export default nextConfig;
