import { getToolByName, listTools } from "@/lib/api";
import { InstallCommand } from "@/components/ui/install-command";
import { ToolCard } from "@/components/ui/tool-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const tool = await getToolByName(decodeURIComponent(name));
  if (!tool) notFound();

  // Fetch related tools from same category
  const related = tool.category
    ? await listTools({ category: tool.category, limit: 6 }).then((r) =>
        r.tools.filter((t) => t.id !== tool.id).slice(0, 5)
      )
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {/* Top */}
      <div className="flex flex-col gap-4">
        <h1 className="font-mono text-2xl font-bold sm:text-3xl">{tool.name}</h1>
        {tool.short_description && (
          <p className="text-muted-foreground/80 text-lg">{tool.short_description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-muted-foreground text-sm">{tool.package_manager}</span>
          {tool.platform?.map((p) => (
            <span key={p} className="text-muted-foreground/60 text-sm">{p}</span>
          ))}
          {tool.category && (
            <Link
              href={`/tools/category/${encodeURIComponent(tool.category)}`}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {tool.category}
            </Link>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-muted-foreground/50 text-xs">Try with need</p>
          <InstallCommand command={`npx @needtools/need ${tool.name}`} />
          <p className="text-muted-foreground/50 mt-2 text-xs">Or install directly</p>
          <InstallCommand command={tool.install_command} />
        </div>
        {tool.source_url && (
          <a
            href={tool.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:text-muted-foreground inline-flex items-center gap-1 text-sm transition-colors"
          >
            Source <ExternalLinkIcon className="size-3" />
          </a>
        )}
      </div>

      {/* Middle */}
      <div className="mt-12 flex flex-col gap-10">
        <div>
          <h2 className="text-muted-foreground/60 mb-3 text-xs font-medium uppercase tracking-wider">About</h2>
          <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
        </div>

        {tool.binaries && tool.binaries.length > 0 && (
          <div>
            <h2 className="text-muted-foreground/60 mb-3 text-xs font-medium uppercase tracking-wider">Commands</h2>
            <div className="flex flex-wrap gap-2">
              {tool.binaries.map((bin) => (
                <code key={bin} className="bg-muted/30 rounded-md px-2.5 py-1 font-mono text-sm">{bin}</code>
              ))}
            </div>
          </div>
        )}

        {tool.usage_examples && tool.usage_examples.length > 0 && (
          <div>
            <h2 className="text-muted-foreground/60 mb-3 text-xs font-medium uppercase tracking-wider">Examples</h2>
            <div className="flex flex-col gap-4">
              {tool.usage_examples.map((example, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="text-muted-foreground/80 text-sm">{example.description}</span>
                  <code className="bg-muted/30 rounded-lg px-4 py-3 font-mono text-sm">
                    <span className="text-muted-foreground/50">$ </span>{example.command}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-muted-foreground/60 mb-4 text-xs font-medium uppercase tracking-wider">Related Tools</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
