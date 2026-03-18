import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

if (!DATABASE_URL) throw new Error('DATABASE_URL required');
if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN required');

const sql = neon(DATABASE_URL);

function extractGithubRepo(url: string | null): { owner: string; repo: string } | null {
  if (!url) return null;
  const m = url.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

async function fetchStars(owner: string, repo: string): Promise<number | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    throw new Error(`GitHub API error ${res.status} (rate limit remaining: ${remaining})`);
  }

  const data = await res.json() as { stargazers_count: number };
  return data.stargazers_count;
}

async function main() {
  const tools = await sql`
    SELECT id, name, source_url FROM public.tools ORDER BY id
  ` as Array<{ id: number; name: string; source_url: string | null }>;

  console.log(`Processing ${tools.length} tools...`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const tool of tools) {
    const repo = extractGithubRepo(tool.source_url);
    if (!repo) {
      skipped++;
      continue;
    }

    try {
      const stars = await fetchStars(repo.owner, repo.repo);
      if (stars === null) {
        skipped++;
        continue;
      }

      await sql`UPDATE public.tools SET github_stars = ${stars} WHERE id = ${tool.id}`;
      updated++;

      if (updated % 100 === 0) {
        console.log(`  ${updated} updated, ${skipped} skipped, ${failed} failed`);
      }
    } catch (err) {
      console.error(`  x ${tool.name}: ${err}`);
      failed++;
      if (String(err).includes('403') || String(err).includes('429')) {
        console.error('Rate limit hit — wait 60s and re-run');
        break;
      }
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (no GitHub URL), ${failed} failed`);

  const top = await sql`
    SELECT name, github_stars FROM public.tools
    WHERE github_stars > 0
    ORDER BY github_stars DESC
    LIMIT 10
  `;
  console.log('\nTop 10 by stars:');
  top.forEach((r: any) => console.log(`  ${r.name}: ${r.github_stars.toLocaleString()}`));
}

main().catch(err => { console.error(err); process.exit(1); });
