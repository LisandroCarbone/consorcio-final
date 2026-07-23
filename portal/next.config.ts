import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: { serverActions: { allowedOrigins: ["localhost:3000"], bodySizeLimit: "10mb" } },
};

export default nextConfig;
