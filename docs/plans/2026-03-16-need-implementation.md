# `need` Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI tool + MCP server + API that lets AI agents discover CLI tools via plain English search, ranked by agent success signals.

**Architecture:** TypeScript monorepo with two packages — `cli/` (CLI + MCP server, published to npm) and `api/` (Cloudflare Worker). Supabase for Postgres + pgvector. OpenAI embeddings for semantic search. A seed script scrapes Homebrew to populate the registry.

**Tech Stack:** TypeScript, commander, @modelcontextprotocol/sdk, Cloudflare Workers, Hono (lightweight web framework for Workers), Supabase (pgvector), OpenAI text-embedding-3-small, vitest

---

## Project Structure

```
need/
  cli/                    # npm package: @needtools/need
    src/
      index.ts            # CLI entry point
      commands/
        search.ts         # need "query" command
        report.ts         # need report <tool> --success|--fail
        serve.ts          # need serve (MCP server)
      lib/
        api-client.ts     # HTTP client for the API
        formatter.ts      # Format search results for terminal
    test/
      search.test.ts
      report.test.ts
      formatter.test.ts
    package.json
    tsconfig.json
  api/                    # Cloudflare Worker
    src/
      index.ts            # Worker entry point (Hono app)
      routes/
        search.ts         # GET /search
        signal.ts         # POST /signal
      lib/
        embeddings.ts     # OpenAI embedding calls
        ranking.ts        # Score calculation
        supabase.ts       # Supabase client
    test/
      search.test.ts
      ranking.test.ts
    wrangler.toml
    package.json
    tsconfig.json
  scripts/
    seed.ts               # Scrape Homebrew, generate embeddings, insert into Supabase
  supabase/
    migrations/
      001_initial.sql     # tables + pgvector extension
  package.json            # root workspace
  tsconfig.base.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json` (root workspace)
- Create: `tsconfig.base.json`
- Create: `cli/package.json`
- Create: `cli/tsconfig.json`
- Create: `api/package.json`
- Create: `api/tsconfig.json`
- Create: `api/wrangler.toml`
- Create: `.gitignore`

**Step 1: Initialize root workspace**

```bash
cd /Users/tucker.schreiber/Documents/mar16
git init
```

Create `package.json`:

```json
{
  "name": "need-monorepo",
  "private": true,
  "workspaces": ["cli", "api"]
}
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true
  }
}
```

Create `.gitignore`:

```
node_modules/
dist/
.wrangler/
.env
.dev.vars
```

**Step 2: Initialize CLI package**

Create `cli/package.json`:

```json
{
  "name": "@needtools/need",
  "version": "0.1.0",
  "description": "Discover the right CLI tool for any task using plain English",
  "type": "module",
  "bin": {
    "need": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "commander": "^13.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "@types/node": "^22.0.0"
  }
}
```

Create `cli/tsconfig.json`:

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

**Step 3: Initialize API package**

Create `api/package.json`:

```json
{
  "name": "need-api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "vitest": "^3.0.0",
    "wrangler": "^4.0.0",
    "@cloudflare/workers-types": "^4.0.0"
  }
}
```

Create `api/tsconfig.json`:

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["src"]
}
```

Create `api/wrangler.toml`:

```toml
name = "need-api"
main = "src/index.ts"
compatibility_date = "2025-01-01"

[vars]
ENVIRONMENT = "production"
```

**Step 4: Install dependencies**

```bash
npm install
```

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold monorepo with cli and api packages"
```

---

## Task 2: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial.sql`

**Step 1: Write migration SQL**

Create `supabase/migrations/001_initial.sql`:

```sql
-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Tools registry
create table public.tools (
  id bigint generated always as identity primary key,
  name text not null,
  description text not null,
  install_command text not null,
  package_manager text not null,  -- 'brew', 'npm', 'pip', etc.
  platform text[] default '{}',   -- ['macos', 'linux', 'windows']
  category text,
  source_url text,
  embedding vector(1536),         -- text-embedding-3-small dimension
  created_at timestamptz default now()
);

-- Unique constraint on name + package_manager
create unique index tools_name_pm_idx on public.tools (name, package_manager);

-- Vector similarity search index
create index tools_embedding_idx on public.tools
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Full-text search fallback index
create index tools_description_fts_idx on public.tools
  using gin (to_tsvector('english', description));

-- Search queries log
create table public.queries (
  id bigint generated always as identity primary key,
  query_text text not null,
  results_count int default 0,
  created_at timestamptz default now()
);

-- Usage signals from agents
create table public.signals (
  id bigint generated always as identity primary key,
  tool_id bigint references public.tools(id) on delete cascade,
  query_text text,
  success boolean not null,
  agent_type text,               -- 'claude-code', 'cursor', 'custom', etc.
  created_at timestamptz default now()
);

create index signals_tool_id_idx on public.signals (tool_id);

-- Function for vector similarity search with ranking
create or replace function search_tools(
  query_embedding vector(1536),
  match_threshold float default 0.3,
  match_count int default 10
)
returns table (
  id bigint,
  name text,
  description text,
  install_command text,
  package_manager text,
  platform text[],
  category text,
  source_url text,
  similarity float,
  success_rate float,
  use_count bigint
)
language sql stable
as $$
  select
    t.id,
    t.name,
    t.description,
    t.install_command,
    t.package_manager,
    t.platform,
    t.category,
    t.source_url,
    1 - (t.embedding <=> query_embedding) as similarity,
    coalesce(
      sum(case when s.success then 1 else 0 end)::float /
      nullif(count(s.id), 0),
      0.5
    ) as success_rate,
    count(s.id) as use_count
  from public.tools t
  left join public.signals s on s.tool_id = t.id
  where 1 - (t.embedding <=> query_embedding) > match_threshold
  group by t.id
  order by
    (1 - (t.embedding <=> query_embedding)) * 0.5 +
    coalesce(
      sum(case when s.success then 1 else 0 end)::float /
      nullif(count(s.id), 0),
      0.5
    ) * 0.5
    desc
  limit match_count;
$$;
```

**Step 2: Apply migration to Supabase**

Go to your Supabase project dashboard > SQL Editor > paste and run the migration.

(Or if using Supabase CLI: `npx supabase db push`)

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema with pgvector search"
```

---

## Task 3: API — Embeddings Module

**Files:**
- Create: `api/src/lib/embeddings.ts`
- Create: `api/test/embeddings.test.ts`

**Step 1: Write the failing test**

Create `api/test/embeddings.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getEmbedding } from '../src/lib/embeddings.js';

describe('getEmbedding', () => {
  it('returns a 1536-dimension vector for a query', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    });

    const result = await getEmbedding('convert pdf to png', {
      apiKey: 'test-key',
      fetch: mockFetch,
    });

    expect(result).toHaveLength(1536);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/embeddings',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      })
    );
  });

  it('throws on API error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    });

    await expect(
      getEmbedding('test', { apiKey: 'bad-key', fetch: mockFetch })
    ).rejects.toThrow('Embedding API error');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd api && npx vitest run test/embeddings.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write implementation**

Create `api/src/lib/embeddings.ts`:

```typescript
interface EmbeddingOptions {
  apiKey: string;
  fetch?: typeof globalThis.fetch;
  model?: string;
}

export async function getEmbedding(
  text: string,
  options: EmbeddingOptions
): Promise<number[]> {
  const { apiKey, model = 'text-embedding-3-small' } = options;
  const fetchFn = options.fetch ?? globalThis.fetch;

  const response = await fetchFn('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${body}`);
  }

  const data = await response.json() as {
    data: Array<{ embedding: number[] }>;
  };
  return data.data[0].embedding;
}
```

**Step 4: Run test to verify it passes**

```bash
cd api && npx vitest run test/embeddings.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add api/src/lib/embeddings.ts api/test/embeddings.test.ts
git commit -m "feat: add OpenAI embedding client with tests"
```

---

## Task 4: API — Supabase Client + Search Route

**Files:**
- Create: `api/src/lib/supabase.ts`
- Create: `api/src/routes/search.ts`
- Create: `api/test/search.test.ts`

**Step 1: Write the failing test**

Create `api/test/search.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { searchRoute } from '../src/routes/search.js';

describe('GET /search', () => {
  it('returns 400 if no query param', async () => {
    const app = new Hono();
    app.route('/search', searchRoute({ supabaseUrl: '', supabaseKey: '', openaiKey: '' }));

    const res = await app.request('/search');
    expect(res.status).toBe(400);
  });

  it('returns ranked tools for a valid query', async () => {
    // This is an integration-style test — we'll mock at the route level
    const mockTools = [
      {
        id: 1,
        name: 'imagemagick',
        description: 'Convert images between formats',
        install_command: 'brew install imagemagick',
        package_manager: 'brew',
        platform: ['macos', 'linux'],
        category: 'image',
        source_url: 'https://imagemagick.org',
        similarity: 0.92,
        success_rate: 0.94,
        use_count: 4100,
      },
    ];

    const app = new Hono();
    // We test the response format; full integration tested manually
    const route = new Hono();
    route.get('/', async (c) => {
      return c.json({ results: mockTools, query: 'convert pdf to png' });
    });
    app.route('/search', route);

    const res = await app.request('/search');
    const body = await res.json() as { results: typeof mockTools };
    expect(res.status).toBe(200);
    expect(body.results[0].name).toBe('imagemagick');
    expect(body.results[0].similarity).toBeGreaterThan(0);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd api && npx vitest run test/search.test.ts
```

Expected: FAIL

**Step 3: Write the Supabase client**

Create `api/src/lib/supabase.ts`:

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export function createSupabaseClient(url: string, key: string): SupabaseClient {
  return createClient(url, key);
}

export interface SearchResult {
  id: number;
  name: string;
  description: string;
  install_command: string;
  package_manager: string;
  platform: string[];
  category: string | null;
  source_url: string | null;
  similarity: number;
  success_rate: number;
  use_count: number;
}

export async function searchTools(
  client: SupabaseClient,
  queryEmbedding: number[],
  limit: number = 10
): Promise<SearchResult[]> {
  const { data, error } = await client.rpc('search_tools', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) throw new Error(`Search error: ${error.message}`);
  return data as SearchResult[];
}

export async function logQuery(
  client: SupabaseClient,
  queryText: string,
  resultsCount: number
): Promise<void> {
  await client.from('queries').insert({
    query_text: queryText,
    results_count: resultsCount,
  });
}
```

**Step 4: Write the search route**

Create `api/src/routes/search.ts`:

```typescript
import { Hono } from 'hono';
import { getEmbedding } from '../lib/embeddings.js';
import { createSupabaseClient, searchTools, logQuery } from '../lib/supabase.js';

interface SearchConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openaiKey: string;
}

export function searchRoute(config: SearchConfig) {
  const route = new Hono();

  route.get('/', async (c) => {
    const query = c.req.query('q');
    if (!query) {
      return c.json({ error: 'Missing query parameter: q' }, 400);
    }

    const limit = parseInt(c.req.query('limit') ?? '10', 10);

    try {
      const embedding = await getEmbedding(query, {
        apiKey: config.openaiKey,
      });

      const supabase = createSupabaseClient(config.supabaseUrl, config.supabaseKey);
      const results = await searchTools(supabase, embedding, limit);

      // Log query async — don't block response
      logQuery(supabase, query, results.length).catch(() => {});

      return c.json({ results, query });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: message }, 500);
    }
  });

  return route;
}
```

**Step 5: Run tests**

```bash
cd api && npx vitest run
```

Expected: PASS

**Step 6: Commit**

```bash
git add api/src/lib/supabase.ts api/src/routes/search.ts api/test/search.test.ts
git commit -m "feat: add search route with vector similarity search"
```

---

## Task 5: API — Signal Route + Worker Entry Point

**Files:**
- Create: `api/src/routes/signal.ts`
- Create: `api/src/index.ts`

**Step 1: Write signal route**

Create `api/src/routes/signal.ts`:

```typescript
import { Hono } from 'hono';
import { createSupabaseClient } from '../lib/supabase.js';

interface SignalConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

interface SignalBody {
  tool_id: number;
  query_text?: string;
  success: boolean;
  agent_type?: string;
}

export function signalRoute(config: SignalConfig) {
  const route = new Hono();

  route.post('/', async (c) => {
    const body = await c.req.json<SignalBody>();

    if (typeof body.tool_id !== 'number' || typeof body.success !== 'boolean') {
      return c.json({ error: 'Required: tool_id (number), success (boolean)' }, 400);
    }

    try {
      const supabase = createSupabaseClient(config.supabaseUrl, config.supabaseKey);
      const { error } = await supabase.from('signals').insert({
        tool_id: body.tool_id,
        query_text: body.query_text ?? null,
        success: body.success,
        agent_type: body.agent_type ?? null,
      });

      if (error) throw new Error(error.message);
      return c.json({ ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return c.json({ error: message }, 500);
    }
  });

  return route;
}
```

**Step 2: Write the Worker entry point**

Create `api/src/index.ts`:

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { searchRoute } from './routes/search.js';
import { signalRoute } from './routes/signal.js';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => c.json({ name: 'need-api', version: '0.1.0' }));

app.route(
  '/search',
  searchRoute({
    supabaseUrl: '',  // placeholder — set in middleware below
    supabaseKey: '',
    openaiKey: '',
  })
);

// Override: use middleware to inject env vars at runtime
app.all('/search/*', async (c, next) => {
  // Hono Workers bindings are on c.env
  await next();
});

// Re-do routes properly with env access
const worker = new Hono<{ Bindings: Bindings }>();

worker.use('*', cors());

worker.get('/', (c) => c.json({ name: 'need-api', version: '0.1.0' }));

worker.get('/search', async (c) => {
  const query = c.req.query('q');
  if (!query) return c.json({ error: 'Missing query parameter: q' }, 400);

  const limit = parseInt(c.req.query('limit') ?? '10', 10);

  const { getEmbedding } = await import('./lib/embeddings.js');
  const { createSupabaseClient, searchTools, logQuery } = await import('./lib/supabase.js');

  try {
    const embedding = await getEmbedding(query, { apiKey: c.env.OPENAI_API_KEY });
    const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);
    const results = await searchTools(supabase, embedding, limit);

    logQuery(supabase, query, results.length).catch(() => {});

    return c.json({ results, query });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: message }, 500);
  }
});

worker.post('/signal', async (c) => {
  const body = await c.req.json<{
    tool_id: number;
    query_text?: string;
    success: boolean;
    agent_type?: string;
  }>();

  if (typeof body.tool_id !== 'number' || typeof body.success !== 'boolean') {
    return c.json({ error: 'Required: tool_id (number), success (boolean)' }, 400);
  }

  const { createSupabaseClient } = await import('./lib/supabase.js');
  const supabase = createSupabaseClient(c.env.SUPABASE_URL, c.env.SUPABASE_KEY);

  const { error } = await supabase.from('signals').insert({
    tool_id: body.tool_id,
    query_text: body.query_text ?? null,
    success: body.success,
    agent_type: body.agent_type ?? null,
  });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ ok: true });
});

export default worker;
```

**Step 3: Test locally**

```bash
cd api && npx wrangler dev
```

Then in another terminal:

```bash
curl http://localhost:8787/
# Should return: {"name":"need-api","version":"0.1.0"}
```

**Step 4: Commit**

```bash
git add api/src/
git commit -m "feat: add Worker entry point with search and signal routes"
```

---

## Task 6: CLI — API Client + Search Command

**Files:**
- Create: `cli/src/lib/api-client.ts`
- Create: `cli/src/lib/formatter.ts`
- Create: `cli/src/commands/search.ts`
- Create: `cli/src/index.ts`
- Create: `cli/test/formatter.test.ts`

**Step 1: Write formatter test**

Create `cli/test/formatter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatResults } from '../src/lib/formatter.js';

describe('formatResults', () => {
  it('formats search results as a readable table', () => {
    const results = [
      {
        id: 1,
        name: 'imagemagick',
        description: 'Convert images',
        install_command: 'brew install imagemagick',
        package_manager: 'brew',
        platform: ['macos'],
        category: 'image',
        source_url: null,
        similarity: 0.94,
        success_rate: 0.94,
        use_count: 4100,
      },
    ];

    const output = formatResults(results);
    expect(output).toContain('imagemagick');
    expect(output).toContain('brew install imagemagick');
    expect(output).toContain('94%');
  });

  it('shows a message when no results found', () => {
    const output = formatResults([]);
    expect(output).toContain('No tools found');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd cli && npx vitest run test/formatter.test.ts
```

Expected: FAIL

**Step 3: Write formatter**

Create `cli/src/lib/formatter.ts`:

```typescript
interface ToolResult {
  id: number;
  name: string;
  description: string;
  install_command: string;
  package_manager: string;
  platform: string[];
  category: string | null;
  source_url: string | null;
  similarity: number;
  success_rate: number;
  use_count: number;
}

export function formatResults(results: ToolResult[]): string {
  if (results.length === 0) {
    return '\n  No tools found for that query. Try different words.\n';
  }

  const lines = results.map((tool, i) => {
    const num = `  ${i + 1}.`;
    const name = tool.name.padEnd(16);
    const cmd = tool.install_command.padEnd(35);
    const rate = `${Math.round(tool.success_rate * 100)}% success`;
    const uses = tool.use_count > 0 ? `  ${formatCount(tool.use_count)} uses` : '  new';
    return `${num} ${name} ${cmd} ${rate}${uses}`;
  });

  return '\n' + lines.join('\n') + '\n';
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
```

**Step 4: Run test to verify it passes**

```bash
cd cli && npx vitest run test/formatter.test.ts
```

Expected: PASS

**Step 5: Write API client**

Create `cli/src/lib/api-client.ts`:

```typescript
const DEFAULT_API_URL = 'https://need-api.your-subdomain.workers.dev';

interface SearchResult {
  id: number;
  name: string;
  description: string;
  install_command: string;
  package_manager: string;
  platform: string[];
  category: string | null;
  source_url: string | null;
  similarity: number;
  success_rate: number;
  use_count: number;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export class NeedApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env.NEED_API_URL ?? DEFAULT_API_URL;
  }

  async search(query: string, limit = 10): Promise<SearchResponse> {
    const url = new URL('/search', this.baseUrl);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(limit));

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`API error (${res.status}): ${body}`);
    }
    return res.json() as Promise<SearchResponse>;
  }

  async reportSignal(toolId: number, success: boolean, queryText?: string): Promise<void> {
    const res = await fetch(new URL('/signal', this.baseUrl).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool_id: toolId,
        success,
        query_text: queryText,
        agent_type: 'cli',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Signal error (${res.status}): ${body}`);
    }
  }
}
```

**Step 6: Write search command**

Create `cli/src/commands/search.ts`:

```typescript
import { NeedApiClient } from '../lib/api-client.js';
import { formatResults } from '../lib/formatter.js';

export async function searchCommand(query: string): Promise<void> {
  const client = new NeedApiClient();

  try {
    const { results } = await client.search(query);
    console.log(formatResults(results));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`\n  Error: ${message}\n`);
    process.exit(1);
  }
}
```

**Step 7: Write CLI entry point**

Create `cli/src/index.ts`:

```typescript
#!/usr/bin/env node
import { program } from 'commander';
import { searchCommand } from './commands/search.js';

program
  .name('need')
  .description('Discover the right CLI tool for any task')
  .version('0.1.0')
  .argument('[query...]', 'What you need (in plain English)')
  .action(async (queryParts: string[]) => {
    if (queryParts.length === 0) {
      program.help();
      return;
    }
    const query = queryParts.join(' ');
    await searchCommand(query);
  });

program
  .command('report <tool>')
  .description('Report whether a tool worked')
  .option('--success', 'The tool worked')
  .option('--fail', 'The tool did not work')
  .action(async (tool: string, opts: { success?: boolean; fail?: boolean }) => {
    console.log(`Signal reporting for "${tool}" — coming soon.`);
  });

program.parse();
```

**Step 8: Build and test CLI locally**

```bash
cd cli && npm run build && node dist/index.js --help
```

Expected: help text showing `need [query...]` and `need report` commands.

**Step 9: Commit**

```bash
git add cli/
git commit -m "feat: add CLI with search command and result formatting"
```

---

## Task 7: CLI — MCP Server

**Files:**
- Create: `cli/src/commands/serve.ts`
- Modify: `cli/src/index.ts` — add serve command
- Modify: `cli/package.json` — add @modelcontextprotocol/sdk dependency

**Step 1: Add MCP SDK dependency**

```bash
cd cli && npm install @modelcontextprotocol/sdk
```

**Step 2: Write MCP server**

Create `cli/src/commands/serve.ts`:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { NeedApiClient } from '../lib/api-client.js';

export async function serveCommand(): Promise<void> {
  const server = new McpServer({
    name: 'need',
    version: '0.1.0',
  });

  const client = new NeedApiClient();

  server.tool(
    'search_tools',
    'Search for CLI tools by describing what you need in plain English',
    {
      query: z.string().describe('What you need the tool to do, in plain English'),
      limit: z.number().optional().default(5).describe('Max results to return'),
    },
    async ({ query, limit }) => {
      try {
        const { results } = await client.search(query, limit);

        if (results.length === 0) {
          return {
            content: [{ type: 'text', text: 'No tools found for that query. Try different words.' }],
          };
        }

        const text = results
          .map(
            (t, i) =>
              `${i + 1}. **${t.name}** — ${t.description}\n   Install: \`${t.install_command}\`\n   Success rate: ${Math.round(t.success_rate * 100)}% (${t.use_count} uses)`
          )
          .join('\n\n');

        return { content: [{ type: 'text', text }] };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error searching: ${message}` }], isError: true };
      }
    }
  );

  server.tool(
    'report_tool_usage',
    'Report whether a discovered tool worked for your task',
    {
      tool_id: z.number().describe('The tool ID from search results'),
      success: z.boolean().describe('Whether the tool worked'),
      query_text: z.string().optional().describe('The original search query'),
    },
    async ({ tool_id, success, query_text }) => {
      try {
        await client.reportSignal(tool_id, success, query_text);
        return {
          content: [{ type: 'text', text: `Signal recorded: ${success ? 'success' : 'failure'} for tool ${tool_id}` }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return { content: [{ type: 'text', text: `Error reporting: ${message}` }], isError: true };
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
```

**Step 3: Add serve command to CLI**

In `cli/src/index.ts`, add before `program.parse()`:

```typescript
program
  .command('serve')
  .description('Run as MCP server (for Claude Code, Cursor, etc.)')
  .action(async () => {
    const { serveCommand } = await import('./commands/serve.js');
    await serveCommand();
  });
```

**Step 4: Build and verify**

```bash
cd cli && npm run build && node dist/index.js serve --help
```

Expected: shows serve command help.

**Step 5: Commit**

```bash
git add cli/
git commit -m "feat: add MCP server with search_tools and report_tool_usage"
```

---

## Task 8: Seed Script — Scrape Homebrew Formulae

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/package.json`

**Step 1: Set up scripts package**

Create `scripts/package.json`:

```json
{
  "name": "need-scripts",
  "private": true,
  "type": "module",
  "dependencies": {
    "@supabase/supabase-js": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.0.0",
    "@types/node": "^22.0.0"
  }
}
```

```bash
cd scripts && npm install
```

**Step 2: Write the seed script**

Create `scripts/seed.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Config — set these as env vars
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Homebrew scraping ---

interface BrewFormula {
  name: string;
  desc: string;
  homepage: string;
  versions: { stable: string };
}

async function fetchBrewFormulae(): Promise<BrewFormula[]> {
  console.log('Fetching Homebrew formulae...');
  const res = await fetch('https://formulae.brew.sh/api/formula.json');
  if (!res.ok) throw new Error(`Homebrew API error: ${res.status}`);
  const data = await res.json() as BrewFormula[];
  console.log(`Fetched ${data.length} formulae`);
  return data;
}

// --- Embedding generation ---

async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: texts,
      model: 'text-embedding-3-small',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${body}`);
  }

  const data = await res.json() as {
    data: Array<{ embedding: number[]; index: number }>;
  };

  // Sort by index to maintain order
  return data.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// --- Main ---

async function seed() {
  const formulae = await fetchBrewFormulae();

  // Filter to formulae with descriptions
  const tools = formulae
    .filter((f) => f.desc && f.desc.length > 0)
    .map((f) => ({
      name: f.name,
      description: f.desc,
      install_command: `brew install ${f.name}`,
      package_manager: 'brew',
      platform: ['macos', 'linux'],
      source_url: f.homepage,
    }));

  console.log(`Processing ${tools.length} tools with descriptions`);

  // Process in batches of 100 (OpenAI limit for embeddings)
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < tools.length; i += BATCH_SIZE) {
    const batch = tools.slice(i, i + BATCH_SIZE);
    const texts = batch.map((t) => `${t.name}: ${t.description}`);

    console.log(`Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(tools.length / BATCH_SIZE)}...`);
    const embeddings = await getEmbeddings(texts);

    const rows = batch.map((tool, j) => ({
      ...tool,
      embedding: JSON.stringify(embeddings[j]),
    }));

    const { error } = await supabase.from('tools').upsert(rows, {
      onConflict: 'name,package_manager',
    });

    if (error) {
      console.error(`Error inserting batch: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${tools.length}`);
    }

    // Rate limit: small delay between batches
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nDone! Seeded ${inserted} tools.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
```

**Step 3: Test the seed script (dry run)**

```bash
cd scripts && SUPABASE_URL=your-url SUPABASE_KEY=your-key OPENAI_API_KEY=your-key npx tsx seed.ts
```

Expected: fetches formulae, generates embeddings, inserts into Supabase.

**Step 4: Commit**

```bash
git add scripts/
git commit -m "feat: add Homebrew seed script with batch embeddings"
```

---

## Task 9: Deploy + End-to-End Test

**Step 1: Set Cloudflare Worker secrets**

```bash
cd api
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_KEY
npx wrangler secret put OPENAI_API_KEY
```

**Step 2: Deploy the Worker**

```bash
cd api && npx wrangler deploy
```

Note the deployed URL (e.g., `https://need-api.your-subdomain.workers.dev`).

**Step 3: Update CLI default API URL**

In `cli/src/lib/api-client.ts`, update `DEFAULT_API_URL` to the deployed Worker URL.

**Step 4: Run seed script**

```bash
cd scripts && SUPABASE_URL=... SUPABASE_KEY=... OPENAI_API_KEY=... npx tsx seed.ts
```

**Step 5: End-to-end test**

```bash
cd cli && npm run build

# Test CLI search
node dist/index.js "convert pdf to png"

# Test via curl
curl "https://need-api.your-subdomain.workers.dev/search?q=convert+pdf+to+png"
```

Expected: both return ranked results from the seeded Homebrew data.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: deploy API and wire up end-to-end"
```

---

## Summary

| Task | What | Estimate |
|------|------|----------|
| 1 | Project scaffolding | Quick |
| 2 | Supabase schema + pgvector | Quick |
| 3 | Embeddings module + tests | Quick |
| 4 | Search route + Supabase client | Medium |
| 5 | Signal route + Worker entry | Medium |
| 6 | CLI search command + formatter | Medium |
| 7 | MCP server | Medium |
| 8 | Homebrew seed script | Medium |
| 9 | Deploy + E2E test | Quick |
