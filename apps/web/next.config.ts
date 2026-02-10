import createMDX from "@next/mdx";
import { withPostHogConfig } from "@posthog/nextjs-config";
import type { NextConfig } from "next";

// Validate environment variables
import "./src/env";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    NEXT_PUBLIC_AXIOM_DATASET: process.env.AXIOM_DATASET,
  },
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
    // ppr: true,
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
  typescript: { ignoreBuildErrors: false },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
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
// export default withMDX(nextConfig);

function getFinalNextConfig() {
  if (process.env.POSTHOG_API_KEY && process.env.POSTHOG_ENV_ID) {
    return withPostHogConfig(withMDX(nextConfig), {
      personalApiKey: process.env.POSTHOG_API_KEY ?? "", // Personal API Key
      envId: process.env.POSTHOG_ENV_ID ?? "", // Environment ID
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "", // (optional), defaults to https://us.posthog.com
      sourcemaps: {
        // (optional)
        enabled: true, // (optional) Enable sourcemaps generation and upload, default to true on production builds
        project: "my-application", // (optional) Project name, defaults to repository name
        version: "1.0.0", // (optional) Release version, defaults to current git commit
        deleteAfterUpload: true, // (optional) Delete sourcemaps after upload, defaults to true
      },
    });
  }

  return withMDX(nextConfig);
}

export default getFinalNextConfig();
