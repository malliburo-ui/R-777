import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  headers: async () => [
    {
      source: "/cases/web/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/drawings/web/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
