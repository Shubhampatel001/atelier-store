import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Sample catalogue imagery (see `unsplash()` in src/lib/catalog.ts).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
        search: "?auto=format&fit=crop&w=2000&q=80",
      },
    ],
  },
};

export default nextConfig;
