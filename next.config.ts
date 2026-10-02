import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // No local images are optimized. Unset, Next allows every local path and
    // logs the raw, attacker-controlled URL when the file is missing (log
    // injection). An empty list rejects local URLs before anything is logged.
    // Add patterns here if `/public` images are ever passed to <Image>.
    localPatterns: [],
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
