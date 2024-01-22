import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.convoform.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://www.convoform.com/changelog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
