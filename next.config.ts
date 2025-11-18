import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias["@react-native-async-storage/async-storage"] = path.resolve(
      __dirname,
      "emptyModule.js"
    );
    return config;
  },
};

export default nextConfig;

