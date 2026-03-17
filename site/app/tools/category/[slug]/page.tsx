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
    <div className="mx-auto max-w-4xl px-4">
      <div className="relative flex flex-col items-center gap-4 py-16 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/40 to-transparent" />
        <h1 className="text-2xl font-bold capitalize tracking-tight">{category}</h1>
        <p className="text-muted-foreground/60 text-sm">{total} tools</p>
        <SearchBar />
      </div>

      <div className="flex flex-col gap-2 pb-16">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pb-16">
          {currentPage > 1 && (
            <a
              href={`/tools/category/${slug}?page=${currentPage - 1}`}
              className="bg-muted/30 hover:bg-muted/50 rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Previous
            </a>
          )}
          <span className="text-muted-foreground/60 px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={`/tools/category/${slug}?page=${currentPage + 1}`}
              className="bg-muted/30 hover:bg-muted/50 rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
