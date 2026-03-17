const API_URL = process.env.NEED_API_URL || "https://need-api.schreibertucbiz.workers.dev";

export interface Tool {
  id: number;
  name: string;
  description: string;
  short_description: string | null;
  install_command: string;
  package_manager: string;
  platform: string[];
  category: string | null;
  source_url: string | null;
  binaries: string[];
  usage_examples: Array<{ description: string; command: string }>;
  similarity: number;
  success_rate: number;
  use_count: number;
}

export interface Category {
  category: string;
  count: number;
}

export async function searchTools(query: string, limit = 10): Promise<Tool[]> {
  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results;
}

export async function getToolByName(name: string): Promise<Tool | null> {
  const res = await fetch(`${API_URL}/tools/${encodeURIComponent(name)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch tool");
  return res.json();
}

export async function listTools(options: { category?: string; limit?: number; offset?: number } = {}): Promise<{ tools: Tool[]; total: number }> {
  const params = new URLSearchParams();
  if (options.category) params.set("category", options.category);
  if (options.limit) params.set("limit", String(options.limit));
  if (options.offset) params.set("offset", String(options.offset));
  const res = await fetch(`${API_URL}/tools?${params}`);
  if (!res.ok) throw new Error("Failed to list tools");
  return res.json();
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.categories;
}
