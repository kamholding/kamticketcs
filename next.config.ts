import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true" && process.env.NODE_ENV === "production",
});

const nextConfig: NextConfig = withBundleAnalyzer({
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
  webpack: (config) => {
    if (config.optimization?.splitChunks) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: "react-vendor",
          chunks: "all",
          enforce: true,
        },
      };
    }
    return config;
  },
});

export default nextConfig;
