import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hjlsujhjebxripjkpefa.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
