import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return {
      fallback: [
        {
          source: "/maps/tiles/6/yanis,18/:zoom([0-5])/:tile([0-5],\\d{1,3},\\d{1,3}).jpg",
          destination: "https://map.gtadb.org/tiles/6/yanis,18/:zoom/:tile.jpg",
        },
      ],
    };
  },
  turbopack: {
    rules: {
      "*.tailwind.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
