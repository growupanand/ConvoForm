import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Validate environment variables
import "./src/env";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "@convoform/ai",
      "@convoform/react",
      "@convoform/ui",
      "@convoform/db",
      "@convoform/api",
      "@convoform/common",
      "@convoform/tailwind-config",
      "@convoform/websocket-client",
      "@clerk/nextjs",
      "@tanstack/react-query",
      "@trpc/react-query",
      "@trpc/server",
      "lucide-react",
      "zod",
      "@convoform/file-storage",
    ],
    viewTransition: true,
    ppr: true,
  },
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  transpilePackages: [
    "@convoform/ai",
    "@convoform/react",
    "@convoform/ui",
    "@convoform/db",
    "@convoform/api",
    "@convoform/common",
    "@convoform/websocket-client",
    "@convoform/file-storage",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Set your origin
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

/** @type {import('remark-gfm').Options} */
// const remarkGFMOptions = {};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  options: {
    remarkPlugins: [
      // Note: comment out to make turbopack work
      // [remarkGfm, remarkGFMOptions]
    ],
    rehypePlugins: [],
  },
});

// Enable bundle analyzer in production build
// const analyzeBundles = withBundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
// });

// // Apply all plugins
// export default analyzeBundles(withMDX(nextConfig));
export default withMDX(nextConfig);
