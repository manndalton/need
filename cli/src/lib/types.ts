export interface ToolResult {
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
  github_stars: number;
}
