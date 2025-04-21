import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og/*", "/privacy", "/changelog"],
      disallow: ["/private/*", "/auth/*", "/api/auth/*"],
    },
    sitemap: "https://www.convoform.com/sitemap.xml",
  };
}
