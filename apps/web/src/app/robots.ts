import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/auth/"],
    },
    sitemap: "https://convoform.com/sitemap.xml",
  };
}
