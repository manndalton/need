import type { MetadataRoute } from "next";
import { getCategories, listTools } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://agentneeds.dev";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const categories = await getCategories();

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/tools/category/${encodeURIComponent(cat.category)}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = [];

  for (const cat of categories) {
    const { tools } = await listTools({ category: cat.category, limit: 1000 });
    for (const tool of tools) {
      toolPages.push({
        url: `${baseUrl}/tools/${encodeURIComponent(tool.name)}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...categoryPages, ...toolPages];
}
