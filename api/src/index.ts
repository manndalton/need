import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getEmbedding } from './lib/embeddings.js';
import { createDb } from './lib/db.js';
import { rateLimit } from './lib/rate-limit.js';

type Bindings = {
  DATABASE_URL: string;
  OPENAI_API_KEY: string;
};

function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    console.error(err);
  }
  return 'Internal server error';
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// Security headers
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
});

// Rate limits: /search hits OpenAI (costs money), so keep it tight
// Bumped /search limit to 100 for my own usage — I'm the only one hitting this instance
// Kept /signal tight to reduce noise
// Note: bumping /signal to 20 since I want to log more feedback during my testing phase
app.use('/search', rateLimit({ max: 100, windowMs: 60_000 }));
app.use('/signal', rateLimit({ max: 20, windowMs: 60_000 }));

app.get('/', (c) => c.json({ name: 'need-api', version: '0.1.0' }));

app.get('/.well-known/mcp/server-card.json', (c) =>
  c.json({
    serverInfo: {
      name: 'need',
      version: '0.1.12',
      description: 'AI agents hallucinate package names. need gives them a verified index of 10,000+ CLI tools — semantic search across brew, npm, pip, apt, and cargo with a feedback loop that gets smarter with every install.',
      homepage: 'https://agentneed.dev',
      license: 'MIT',
    },
    authentication: { required: false },
    tools: [
      {
        name: 'search_tools',
        description:
          'Semantic search across 10,000+ verified CLI tools. Describe what you need in plain English.',
        inputSchema: {
          type: 'object',
          properties: { query: { type: 'string', description: 'Plain English description of what you need' } },
          required: ['query'],
        },
      },
      {
        name: 'install_tool',
        description:
          'Install a CLI tool by name using an allowlisted package manager (brew, apt, npm, pip, cargo).',
        inputSchema: {
          type: 'object',
          properties: {
            tool_name: { type: 'string', description: 'Name of the tool to install' },
            package_manager: { type: 'string', enum: ['brew', 'apt', 'npm', 'pip', 'cargo'] },
          },
          required: ['tool_name'],
        },
      },
      {
        name: 'report_tool_usage',
        description:
          'Report whether a tool worked or failed. Improves future search rankings for all agents.',
        inputSchema: {
          type: 'object',
          properties: {
            tool_name: { type: 'string' },
            success: { type: 'boolean' },
            context: { type: 'string', description: 'What you were trying to do' },
