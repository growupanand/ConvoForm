import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/api/og/"],
      disallow: [
        "/auth/",
        "/channels/",
        "/dashboard/",
        "/forms/",
        "/organizations/",
        "/playground/",
        "/settings/",
        "/api/",
      ],
    },
    sitemap: "https://www.convoform.com/sitemap.xml",
  };
}
