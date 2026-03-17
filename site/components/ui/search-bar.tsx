"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const placeholders = [
  "compress png images without losing quality",
  "monitor disk usage in real time",
  "format json in the terminal",
  "find and replace text across files",
  "convert video formats from the command line",
];

export function SearchBar({
  defaultValue,
  compact,
}: {
  defaultValue?: string;
  compact?: boolean;
}) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <form action="/tools/search" method="GET" className={cn("w-full", !compact && "max-w-2xl")}>
      <div
        className={cn(
          "flex items-center gap-2 border transition-colors",
          compact
            ? "border-white/10 bg-white/5 focus-within:bg-white/10 rounded-lg px-3 py-1.5"
            : "border-white/10 bg-white/5 focus-within:bg-white/10 rounded-xl px-5 py-4 gap-3"
        )}
      >
        <SearchIcon className={cn("text-muted-foreground shrink-0", compact ? "size-3.5" : "size-5")} />
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder={compact ? "Search tools..." : placeholders[placeholderIndex]}
          className={cn(
            "bg-transparent text-foreground placeholder:text-muted-foreground w-full outline-none",
            compact && "text-sm"
          )}
          autoComplete="off"
        />
      </div>
    </form>
  );
}
