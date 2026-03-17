import { getCategories, listTools } from "@/lib/api";
import { SearchBar } from "@/components/ui/search-bar";
import Link from "next/link";

export const metadata = {
  title: "Browse CLI Tools | need",
  description: "Search and browse thousands of CLI tools. Find the right command-line tool in plain English.",
};

export default async function ToolsPage() {
  const categories = await getCategories();

  // If no categories exist yet, show total tool count from listTools
  const toolCount = categories.length > 0
    ? categories.reduce((sum, c) => sum + c.count, 0)
    : (await listTools({ limit: 1 })).total;

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="relative flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/40 to-transparent" />
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Find the right CLI tool
        </h1>
        <p className="text-muted-foreground/80 max-w-lg">
          Search {toolCount.toLocaleString()}+ tools in plain English
        </p>
        <SearchBar />
      </div>

      {categories.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pb-16 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.category}
              href={`/tools/category/${encodeURIComponent(cat.category)}`}
              className="bg-muted/30 hover:bg-muted/50 rounded-xl px-5 py-4 transition-colors"
            >
              <div className="text-foreground text-sm font-medium capitalize">{cat.category}</div>
              <div className="text-muted-foreground/60 text-sm">{cat.count} tools</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
