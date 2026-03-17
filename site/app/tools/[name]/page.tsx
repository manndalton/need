import { getToolByName, listTools } from "@/lib/api";
import { InstallCommand } from "@/components/ui/install-command";
import { ToolCard } from "@/components/ui/tool-card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const tool = await getToolByName(decodeURIComponent(name));
  if (!tool) return { title: "Tool not found" };

  const description =
    tool.short_description || tool.description?.slice(0, 160) || "";
  const keywords = [
    tool.name,
    tool.package_manager,
    tool.category,
    "CLI tool",
    "AI agent",
    "developer tool",
  ].filter(Boolean) as string[];

  return {
    title: tool.name,
    description,
    keywords,
    alternates: {
      canonical: `https://agentneeds.dev/tools/${encodeURIComponent(tool.name)}`,
    },
    openGraph: {
      title: tool.name,
      description,
      type: "article",
      url: `https://agentneeds.dev/tools/${encodeURIComponent(tool.name)}`,
    },
    twitter: {
      card: "summary_large_image",
      title: tool.name,
      description,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const tool = await getToolByName(decodeURIComponent(name));
  if (!tool) notFound();

  const related = tool.category
    ? await listTools({ category: tool.category, limit: 6 }).then((r) =>
        r.tools.filter((t) => t.id !== tool.id).slice(0, 5)
      )
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category || "DeveloperApplication",
    operatingSystem: tool.platform?.join(", "),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: `https://agentneeds.dev/tools/${encodeURIComponent(tool.name)}`,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Top */}
      <div className="flex flex-col gap-4">
        <h1 className="font-mono text-xl">{tool.name}</h1>
        {tool.short_description && (
          <p className="text-sm text-[#a1a1aa]">{tool.short_description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[#71717a]">{tool.package_manager}</span>
          {tool.platform?.map((p) => (
            <span key={p} className="text-xs text-[#71717a]">{p}</span>
          ))}
          {tool.category && (
            <Link
              href={`/tools/category/${encodeURIComponent(tool.category)}`}
              className="text-xs text-[#60a5fa] transition-colors hover:text-[#93bbfc]"
            >
              {tool.category}
            </Link>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.05em] text-[#71717a]">Try with need</span>
          <InstallCommand command={`npx @agentneeds/need ${tool.name}`} />
          <span className="text-xs uppercase tracking-[0.05em] text-[#71717a]">Or install directly</span>
          <InstallCommand command={tool.install_command} />
        </div>
        {tool.source_url && (
          <a
            href={tool.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#60a5fa] transition-colors hover:text-[#93bbfc]"
          >
            Source <ExternalLinkIcon className="size-3" />
          </a>
        )}
      </div>

      {/* Middle */}
      <div className="mt-12 flex flex-col gap-10">
        <div>
          <h2 className="mb-3 text-xs uppercase tracking-[0.05em] text-[#71717a]">About</h2>
          <p className="text-sm leading-relaxed text-[#a1a1aa]">{tool.description}</p>
        </div>

        {tool.binaries && tool.binaries.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs uppercase tracking-[0.05em] text-[#71717a]">Commands</h2>
            <div className="flex flex-wrap gap-2">
              {tool.binaries.map((bin) => (
                <code key={bin} className="border border-[#27272a] bg-[#09090b] px-2.5 py-1 font-mono text-sm text-[#e8e8e8]">{bin}</code>
              ))}
            </div>
          </div>
        )}

        {tool.usage_examples && tool.usage_examples.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs uppercase tracking-[0.05em] text-[#71717a]">Examples</h2>
            <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
              {tool.usage_examples.map((example, i) => (
                <div key={i} className={`flex flex-col gap-1.5 px-5 py-4 ${i < tool.usage_examples!.length - 1 ? "border-b border-[#27272a]" : ""}`}>
                  <span className="text-xs text-[#a1a1aa]">{example.description}</span>
                  <code className="font-mono text-sm text-[#e8e8e8]">
                    <span className="text-[#71717a]">$ </span>{example.command}
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
          <h2 className="mb-4 text-xs uppercase tracking-[0.05em] text-[#71717a]">Related Tools</h2>
          <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
            {related.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
