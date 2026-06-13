import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['wagmi', 'viem', '@wagmi/core', '@wagmi/connectors'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
