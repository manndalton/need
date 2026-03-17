import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/api";

export function ToolCard({ tool, showSimilarity }: { tool: Tool; showSimilarity?: boolean }) {
  return (
    <Link
      href={`/tools/${tool.name}`}
      className="bg-card border-border hover:border-primary/30 flex flex-col gap-2 rounded-xl border p-4 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-foreground font-mono text-sm font-semibold">{tool.name}</span>
        <Badge variant="outline" size="sm" className="text-xs">
          {tool.package_manager}
        </Badge>
        {showSimilarity && tool.similarity > 0 && (
          <Badge variant="secondary" size="sm" className="ml-auto text-xs">
            {Math.round(tool.similarity * 100)}%
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {tool.short_description || tool.description.slice(0, 120)}
      </p>
      {tool.platform && tool.platform.length > 0 && (
        <div className="flex gap-1">
          {tool.platform.map((p) => (
            <span key={p} className="text-muted-foreground text-xs">{p}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
