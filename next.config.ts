import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return [
      { source: "/ui-builder", destination: "/code-studio?tab=ui", permanent: false },
      { source: "/sentinel", destination: "/code-studio?tab=review", permanent: false },
    ];
  },
};

export default nextConfig;
