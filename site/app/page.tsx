import { ArrowUpRightIcon, GithubIcon } from "lucide-react";
import Link from "next/link";

import NeedLogo from "../components/logos/need";
import { SearchBar } from "../components/ui/search-bar";
import { InstallCommand } from "../components/ui/install-command";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] font-mono text-[#e8e8e8]">
      {/* Header */}
      <header className="border-b border-[#27272a]">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
          <Link href="/" className="transition-opacity hover:opacity-80">
            <NeedLogo />
          </Link>
          <div className="flex-1 px-6">
            <SearchBar compact />
          </div>
          <a
            href="https://github.com/tuckerschreiber/need"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#a1a1aa] transition-colors hover:text-[#e8e8e8]"
          >
            <GithubIcon className="size-4" />
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 pt-16 pb-8">

        {/* Hero card */}
        <div>
          <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
            {/* Tagline */}
            <div className="px-8 py-16 text-center">
              <h1 className="text-sm uppercase tracking-[0.05em]">
                Tool discovery for AI agents
              </h1>
              <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-[#a1a1aa]">
                Describe what you need in plain English. Get results ranked by what actually worked for other agents.
              </p>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-2 border-t border-[#27272a] sm:grid-cols-4">
              <div className="border-r border-b border-[#27272a] px-4 py-5 text-center">
                <span className="text-xs uppercase tracking-[0.05em]">Open Source</span>
              </div>
              <div className="border-b border-[#27272a] sm:border-r px-4 py-5 text-center">
                <span className="text-xs uppercase tracking-[0.05em]">No API Keys</span>
              </div>
              <div className="border-r border-b border-[#27272a] px-4 py-5 text-center">
                <span className="text-xs uppercase tracking-[0.05em]">Zero Config</span>
              </div>
              <div className="border-b border-[#27272a] px-4 py-5 text-center">
                <span className="text-xs uppercase tracking-[0.05em]">MCP Ready</span>
              </div>
            </div>

            {/* Install command */}
            <div className="flex items-center justify-between border-b border-[#27272a] px-8 py-5">
              <span className="text-xs uppercase tracking-[0.05em] text-[#a1a1aa]">Get Started</span>
              <InstallCommand command={`npx @agentneeds/need "convert pdf to png"`} />
            </div>

            {/* GitHub link */}
            <a
              href="https://github.com/tuckerschreiber/need"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border-b border-[#27272a] px-8 py-4 transition-colors hover:bg-[#18181b]"
            >
              <span className="text-xs uppercase tracking-[0.05em] text-[#a1a1aa]">GitHub</span>
              <span className="flex items-center gap-2 text-xs text-[#a1a1aa] transition-colors group-hover:text-[#e8e8e8]">
                github.com/tuckerschreiber/need
                <ArrowUpRightIcon className="size-3" />
              </span>
            </a>

            {/* npm link */}
            <a
              href="https://www.npmjs.com/package/@agentneeds/need"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between px-8 py-4 transition-colors hover:bg-[#18181b]"
            >
              <span className="text-xs uppercase tracking-[0.05em] text-[#a1a1aa]">npm</span>
              <span className="flex items-center gap-2 text-xs text-[#a1a1aa] transition-colors group-hover:text-[#e8e8e8]">
                @agentneeds/need
                <ArrowUpRightIcon className="size-3" />
              </span>
            </a>
          </div>
        </div>

        {/* Demo section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-[0.05em] text-[#a1a1aa]">Demo</h2>
          </div>
          <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
            {/* Terminal header */}
            <div className="flex items-center gap-2 border-b border-[#27272a] bg-[#18181b] px-4 py-2">
              <span className="text-[0.6875rem] text-[#a1a1aa]">terminal</span>
            </div>
            {/* Terminal content */}
            <div className="bg-[#09090b] p-6 text-xs leading-7">
              <div>
                <span className="text-[#71717a]">$</span>{" "}
                <span className="text-[#e8e8e8]">need &quot;convert pdf to png&quot;</span>
              </div>
              <div className="mt-4">
                <div>
                  <span className="text-[#71717a]">{"  "}1.</span>{" "}
                  <span className="text-[#c8e64a]">poppler</span>
                  {"      "}
                  <span className="text-[#c8e64a]">96%</span>
                  <span className="text-[#71717a]">{" · "}4.1k uses</span>
                </div>
                <div className="text-[#71717a]">{"     "}brew install poppler</div>
                <div className="mt-2">
                  <span className="text-[#71717a]">{"  "}2.</span>{" "}
                  <span className="text-[#c8e64a]">imagemagick</span>
                  {"  "}
                  <span className="text-[#c8e64a]">89%</span>
                  <span className="text-[#71717a]">{" · "}2.8k uses</span>
                </div>
                <div className="text-[#71717a]">{"     "}brew install imagemagick</div>
                <div className="mt-2">
                  <span className="text-[#71717a]">{"  "}3.</span>{" "}
                  <span className="text-[#c8e64a]">ghostscript</span>
                  {"  "}
                  <span className="text-[#c8e64a]">82%</span>
                  <span className="text-[#71717a]">{" · "}900 uses</span>
                </div>
                <div className="text-[#71717a]">{"     "}brew install ghostscript</div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-[0.05em] text-[#a1a1aa]">How It Works</h2>
          </div>
          <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* CLI panel */}
              <div className="border-b border-[#27272a] lg:border-b-0 lg:border-r">
                <div className="border-b border-[#27272a] bg-[#18181b] px-4 py-2">
                  <span className="text-[0.6875rem] text-[#a1a1aa]">1. search</span>
                </div>
                <div className="bg-[#09090b] p-6 text-xs leading-7">
                  <div>
                    <span className="text-[#71717a]">$</span>{" "}
                    <span className="text-[#e8e8e8]">need &quot;compress png images&quot;</span>
                  </div>
                  <div className="mt-4">
                    <div>
                      <span className="text-[#71717a]">{"  "}1.</span>{" "}
                      <span className="text-[#c8e64a]">pngquant</span>
                      {"    "}
                      <span className="text-[#c8e64a]">92%</span>
                      <span className="text-[#71717a]">{" · "}3.2k uses</span>
                    </div>
                    <div className="text-[#71717a]">{"     "}brew install pngquant</div>
                    <div className="mt-2">
                      <span className="text-[#71717a]">{"  "}2.</span>{" "}
                      <span className="text-[#c8e64a]">optipng</span>
                      {"     "}
                      <span className="text-[#c8e64a]">87%</span>
                      <span className="text-[#71717a]">{" · "}1.8k uses</span>
                    </div>
                    <div className="text-[#71717a]">{"     "}brew install optipng</div>
                  </div>
                </div>
              </div>
              {/* MCP panel */}
              <div>
                <div className="border-b border-[#27272a] bg-[#18181b] px-4 py-2">
                  <span className="text-[0.6875rem] text-[#a1a1aa]">2. connect your agent</span>
                </div>
                <div className="bg-[#09090b] p-6 text-xs leading-7">
                  <div className="text-[#71717a]">{"{"}</div>
                  <div>
                    {"  "}<span className="text-[#71717a]">&quot;mcpServers&quot;:</span>{" "}{"{"}
                  </div>
                  <div>
                    {"    "}<span className="text-[#71717a]">&quot;need&quot;:</span>{" "}{"{"}
                  </div>
                  <div>
                    {"      "}<span className="text-[#71717a]">&quot;command&quot;:</span>{" "}<span className="text-[#60a5fa]">&quot;npx&quot;</span>,
                  </div>
                  <div>
                    {"      "}<span className="text-[#71717a]">&quot;args&quot;:</span>{" "}[<span className="text-[#60a5fa]">&quot;@agentneeds/need&quot;</span>, <span className="text-[#60a5fa]">&quot;serve&quot;</span>]
                  </div>
                  <div>{"    "}{"}"}</div>
                  <div>{"  "}{"}"}</div>
                  <div className="text-[#71717a]">{"}"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-8">
          <div className="mb-6">
            <h2 className="text-xs uppercase tracking-[0.05em] text-[#a1a1aa]">FAQ</h2>
          </div>
          <div className="shadow-[0_0_0_1.5px_#27272a,0_1px_2px_rgba(0,0,0,0.05)]">
            <FaqItem
              question="Can't I just Google this?"
              answer="You can. You'll get a Stack Overflow answer from 2019, three Medium articles behind paywalls, and a GitHub repo with 2 stars last updated in 2021. need gives you ranked, current results with install commands and success rates."
            />
            <FaqItem
              question="Can't AI agents just know which tools exist?"
              answer="They can't. LLMs have a training cutoff and frequently hallucinate package names. need gives them a real-time, verified index to search against."
            />
            <FaqItem
              question="What if I don't use AI agents?"
              answer="need works great as a standalone CLI. Think of it as tldr meets brew search with semantic understanding. The MCP integration is a bonus, not a requirement."
            />
            <FaqItem
              question="How is this different from package manager search?"
              answer={`brew search and apt search match keywords. need understands intent. Search "make images smaller" and you'll get pngquant, optipng, and jpegoptim — not just packages with "image" in the name.`}
            />
            <FaqItem
              question="Is it safe to let AI agents install things?"
              answer="The MCP install_tool only allows commands from a strict allowlist: brew install, apt install, npm install -g, pip install, cargo install. Shell metacharacters are rejected. No arbitrary code execution."
              last
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 flex items-center justify-between py-8 text-xs text-[#71717a]">
          <span>© 2026 Tucker Schreiber</span>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/tuckerschreiber/need"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e8e8]"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@agentneeds/need"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-[#e8e8e8]"
            >
              npm
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function FaqItem({ question, answer, last }: { question: string; answer: string; last?: boolean }) {
  return (
    <details className={`group ${last ? "" : "border-b border-[#27272a]"}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between px-7 py-5 text-xs transition-colors hover:bg-[#18181b] [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span className="text-[#71717a] transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="px-7 pb-5 text-xs leading-relaxed text-[#a1a1aa]">
        {answer}
      </div>
    </details>
  );
}
