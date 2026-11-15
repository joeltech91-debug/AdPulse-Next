import type { MetadataRoute } from "next";

const siteUrl = "https://getadpulse.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/guide-optimisation`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
