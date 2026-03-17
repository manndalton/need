"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const placeholders = [
  "compress png images without losing quality",
  "monitor disk usage in real time",
  "format json in the terminal",
  "find and replace text across files",
  "convert video formats from the command line",
];

export function SearchBar({ defaultValue }: { defaultValue?: string }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <form action="/tools/search" method="GET" className="w-full max-w-2xl">
      <div className="bg-muted/50 border-border focus-within:border-primary/50 flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors">
        <SearchIcon className="text-muted-foreground size-5 shrink-0" />
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholders[placeholderIndex]}
          className="bg-transparent text-foreground placeholder:text-muted-foreground w-full text-sm outline-none"
          autoComplete="off"
        />
      </div>
    </form>
  );
}
