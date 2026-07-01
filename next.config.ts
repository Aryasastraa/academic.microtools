import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Required for GitHub Pages (Static HTML Export)
  images: {
    unoptimized: true, // Required because GitHub Pages doesn't support Next.js Image Optimization API
  },
};

export default nextConfig;
