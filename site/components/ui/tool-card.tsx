import Link from "next/link";
import type { Tool } from "@/lib/api";

export function ToolCard({ tool, showSimilarity }: { tool: Tool; showSimilarity?: boolean }) {
  return (
    <Link
      href={`/tools/${tool.name}`}
      className="bg-muted/30 hover:bg-muted/50 flex flex-col gap-3 rounded-xl px-5 py-4 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-foreground font-mono text-sm font-semibold">{tool.name}</span>
        <span className="text-muted-foreground text-xs">{tool.package_manager}</span>
        {showSimilarity && tool.similarity > 0 && (
          <span className="text-muted-foreground/60 ml-auto text-xs">
            {Math.round(tool.similarity * 100)}% match
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {tool.short_description || tool.description.slice(0, 120)}
      </p>
    </Link>
  );
}
