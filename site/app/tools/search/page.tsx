import { searchTools } from "@/lib/api";
import { SearchBar } from "@/components/ui/search-bar";
import { ToolCard } from "@/components/ui/tool-card";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (!q) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="flex flex-col items-center gap-6">
          <SearchBar />
          <p className="text-xs text-[#71717a]">Enter a search query to find CLI tools.</p>
        </div>
      </div>
    );
  }

  const results = await searchTools(q, 20);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10">
        <SearchBar defaultValue={q} />
        <p className="mt-3 text-xs text-[#71717a]">
          {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
        </p>
      </div>

      <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
        {results.map((tool) => (
          <ToolCard key={tool.id} tool={tool} showSimilarity />
        ))}
        {results.length === 0 && (
          <p className="py-12 text-center text-xs text-[#71717a]">No tools found. Try a different search.</p>
        )}
      </div>
    </div>
  );
}
