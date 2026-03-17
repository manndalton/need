import { listTools } from "@/lib/api";
import { SearchBar } from "@/components/ui/search-bar";
import { ToolCard } from "@/components/ui/tool-card";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  const { total } = await listTools({ category, limit: 1 });

  return {
    title: `${category} Tools`,
    description: `Browse ${total} ${category} CLI tools for AI agents on agentneeds.dev.`,
    alternates: {
      canonical: `https://agentneeds.dev/tools/category/${encodeURIComponent(category)}`,
    },
    openGraph: {
      title: `${category} Tools`,
      description: `Browse ${total} ${category} CLI tools for AI agents.`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;
  const category = decodeURIComponent(slug);
  const currentPage = parseInt(page ?? "1", 10);
  const limit = 50;
  const offset = (currentPage - 1) * limit;

  const { tools, total } = await listTools({ category, limit, offset });
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10">
        <h1 className="text-xs uppercase tracking-[0.05em]">{category}</h1>
        <p className="mt-2 text-xs text-[#71717a]">{total} tools</p>
      </div>

      <div className="mb-10">
        <SearchBar />
      </div>

      <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={`/tools/category/${slug}?page=${currentPage - 1}`}
              className="border border-[#27272a] px-4 py-2 text-xs uppercase tracking-[0.05em] text-[#a1a1aa] transition-colors hover:bg-[#18181b] hover:text-[#e8e8e8]"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-xs text-[#71717a]">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={`/tools/category/${slug}?page=${currentPage + 1}`}
              className="border border-[#27272a] px-4 py-2 text-xs uppercase tracking-[0.05em] text-[#a1a1aa] transition-colors hover:bg-[#18181b] hover:text-[#e8e8e8]"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
