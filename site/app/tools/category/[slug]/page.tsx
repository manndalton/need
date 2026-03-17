import { listTools } from "@/lib/api";
import { SearchBar } from "@/components/ui/search-bar";
import { ToolCard } from "@/components/ui/tool-card";

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
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-3xl font-bold capitalize tracking-tight">{category}</h1>
        <p className="text-muted-foreground">{total} tools</p>
        <SearchBar />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {currentPage > 1 && (
            <a
              href={`/tools/category/${slug}?page=${currentPage - 1}`}
              className="bg-muted rounded-lg px-4 py-2 text-sm"
            >
              Previous
            </a>
          )}
          <span className="text-muted-foreground px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={`/tools/category/${slug}?page=${currentPage + 1}`}
              className="bg-muted rounded-lg px-4 py-2 text-sm"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
