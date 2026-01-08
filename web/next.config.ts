import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Rewrites handled by middleware.ts for dynamic Docker environment support
  // async rewrites() { ... }
};

export default nextConfig;
