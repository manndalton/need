# `need` — Tool Discovery Network for AI Agents

## What it is

`need` is an open-source CLI tool and MCP server that lets AI agents (and humans) discover the right CLI tool for any task using plain English. Results are ranked by what actually worked for other agents.

```
$ need "convert pdf to png"

  1. poppler      brew install poppler       96% success   4.1k uses
  2. imagemagick  brew install imagemagick   89% success   2.8k uses
  3. ghostscript  brew install ghostscript   82% success   900 uses
```

Install:

```
npm install -g @needtools/need
```

## How it works

1. Agent (or human) runs `need "description of task"`
2. CLI hits the API with the query
3. API embeds the query and does vector similarity search against the tool registry
4. Returns ranked results — semantic match + agent success signals
5. Agent picks a tool, installs it, uses it
6. Success/failure signal flows back to improve future rankings

### Plain English Search (Embeddings)

Agents don't know tool names. They describe what they need in natural language. Embeddings bridge the gap:

- Every tool in the registry has an embedding (vector) of its description
- When an agent searches "turn a pdf into an image", the query gets embedded
- Supabase (pgvector) finds the closest matching tools via cosine similarity
- Even if the words are completely different from the tool's description, it works

Embedding model: OpenAI `text-embedding-3-small` ($0.02/M tokens). No LLM calls — just vector math.

## Architecture

```
CLI/MCP Server  →  API (Cloudflare Workers)  →  Supabase (Postgres + pgvector)
(TypeScript)        (TypeScript)
```

### Supabase Tables

**tools**
- id, name, description, install_command, package_manager, platform, category, source_url, embedding (vector), created_at

**queries**
- id, query_text, query_embedding, timestamp

**signals**
- id, tool_id, query_text, success (boolean), agent_type, timestamp

### API Endpoints

- `GET /search?q=convert+pdf+to+png` — embed query, vector similarity search, return ranked tools
- `POST /signal` — agent reports success/failure after using a tool

### CLI Commands

- `need "query"` — search for tools
- `need serve` — run as MCP server
- `need report <tool> --success|--fail` — manual signal reporting

### MCP Server

Any agent that supports MCP can use `need` natively:

```json
{
  "mcpServers": {
    "need": {
      "command": "npx",
      "args": ["@needtools/need", "serve"]
    }
  }
}
```

The agent gets `need` as a tool it can call mid-conversation — search for and install tools without the user lifting a finger.

### Ranking Algorithm (v1)

Score = semantic similarity * 0.5 + (success_count / total_uses) * 0.5, weighted by recency. Simple. No ML. Upgrade later.

## Seeding the Registry

Scrape on day one:
- **Homebrew formulae** (~6k packages with descriptions) — primary source for v1
- Parse: name, description, install command (`brew install <name>`)
- Generate embedding for each tool description
- Bulk insert into Supabase

Later: npm CLI tools, PyPI console_scripts, awesome-lists on GitHub.

## Distribution Strategy

1. Launch on GitHub, get on awesome-mcp-servers lists
2. Demo videos on Twitter/X showing agents discovering tools in real time
3. Submit to Claude Code, Cursor plugin directories
4. Network effect: more usage → better recommendations → more users

## Business Model (later)

- Free for agents and developers (demand side)
- Tool makers pay for promoted listings (supply side)
- Like Google Search: free for users, tool makers pay for visibility

## v1 Scope

**Building now:**
1. CLI + MCP server (TypeScript, npm package)
2. API on Cloudflare Workers
3. Supabase database (tools, queries, signals + pgvector)
4. Seed script (scrape Homebrew formulae)

**Not in v1:**
- Website / web directory (next)
- Paid/promoted listings
- npm/PyPI scraping
- Auth
- Advanced ranking/ML

## Tech Stack

- **CLI/MCP Server:** TypeScript, commander, MCP SDK
- **API:** Cloudflare Workers (TypeScript)
- **Database:** Supabase (Postgres + pgvector)
- **Embeddings:** OpenAI text-embedding-3-small
- **Package:** npm (@needtools/need)
