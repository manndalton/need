import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/tools/search",
    },
    sitemap: "https://agentneeds.dev/sitemap.xml",
  };
}
