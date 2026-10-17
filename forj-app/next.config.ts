import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  // Silence the Supabase realtime warning in Next.js 15
  serverExternalPackages: ["@supabase/realtime-js"],
};

export default nextConfig;
