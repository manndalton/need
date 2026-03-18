-- Add github_stars to search_tools return type and output
-- Also add a trending_tools function for the /trending endpoint
CREATE OR REPLACE FUNCTION search_tools(
  query_embedding vector(1536),
  query_text text DEFAULT '',
  match_threshold float DEFAULT 0.4,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  name text,
  description text,
  short_description text,
  install_command text,
  package_manager text,
  platform text[],
  category text,
  source_url text,
  binaries text[],
  usage_examples jsonb,
  similarity float,
  success_rate float,
  use_count bigint,
  github_stars int
)
LANGUAGE sql STABLE
AS $$
  WITH
  star_max AS (
    SELECT GREATEST(MAX(github_stars), 1) AS max_stars FROM public.tools
  ),
  semantic AS (
    SELECT
      t.id,
      1 - (t.embedding <=> query_embedding) AS sem_score
    FROM public.tools t
    WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
  ),
  fts AS (
    SELECT
      s.id,
      CASE
        WHEN query_text IS NULL OR query_text = '' THEN 0.0
        ELSE COALESCE(
          ts_rank(
            to_tsvector('english', t.name || ' ' || t.description),
            plainto_tsquery('english', query_text)
          ),
          0.0
        )
      END AS fts_score
    FROM public.tools t
    JOIN semantic s ON s.id = t.id
  ),
  proven AS (
    SELECT
      sig.tool_id,
      COALESCE(
        SUM(CASE WHEN sig.success THEN 1.0 ELSE 0.0 END) /
        NULLIF(COUNT(*), 0),
        0.5
      ) AS proven_score
    FROM public.signals sig
    WHERE
      sig.query_embedding IS NOT NULL
      AND 1 - (sig.query_embedding <=> query_embedding) > 0.75
    GROUP BY sig.tool_id
  ),
  combined AS (
    SELECT
      t.id,
      t.name,
      t.description,
      t.short_description,
      t.install_command,
      t.package_manager,
      t.platform,
      t.category,
      t.source_url,
      t.binaries,
      t.usage_examples,
      t.github_stars,
      s.sem_score,
      LOG(t.github_stars + 1) / LOG(sm.max_stars + 1) AS star_score,
      LEAST(f.fts_score * 10, 1.0) AS fts_norm,
      COALESCE(p.proven_score, 0.5) AS proven_score,
      COALESCE(
        SUM(CASE WHEN sig.success THEN 1 ELSE 0 END)::float /
        NULLIF(COUNT(sig.id), 0),
        0.5
      ) AS success_rate,
      COUNT(sig.id) AS use_count
    FROM public.tools t
    JOIN semantic s ON s.id = t.id
    JOIN fts f ON f.id = t.id
    CROSS JOIN star_max sm
    LEFT JOIN proven p ON p.tool_id = t.id
    LEFT JOIN public.signals sig ON sig.tool_id = t.id
    GROUP BY t.id, t.name, t.description, t.short_description,
             t.install_command, t.package_manager, t.platform,
             t.category, t.source_url, t.binaries, t.usage_examples,
             s.sem_score, f.fts_score, sm.max_stars, t.github_stars,
             p.proven_score
  )
  SELECT
    id, name, description, short_description, install_command,
    package_manager, platform, category, source_url, binaries, usage_examples,
    sem_score AS similarity,
    success_rate,
    use_count,
    github_stars
  FROM combined
  ORDER BY (
    sem_score    * 0.50 +
    star_score   * 0.25 +
    proven_score * 0.15 +
    fts_norm     * 0.10
  ) DESC
  LIMIT match_count;
$$;

-- Trending tools: top N by signal count in the last D days
CREATE OR REPLACE FUNCTION trending_tools(
  days int DEFAULT 7,
  limit_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  name text,
  install_command text,
  github_stars int,
  agent_uses bigint,
  success_rate float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    t.id,
    t.name,
    t.install_command,
    t.github_stars,
    COUNT(sig.id) AS agent_uses,
    COALESCE(
      SUM(CASE WHEN sig.success THEN 1 ELSE 0 END)::float /
      NULLIF(COUNT(sig.id), 0),
      0.5
    ) AS success_rate
  FROM public.tools t
  JOIN public.signals sig ON sig.tool_id = t.id
  WHERE sig.created_at >= NOW() - (days || ' days')::interval
  GROUP BY t.id, t.name, t.install_command, t.github_stars
  ORDER BY agent_uses DESC
  LIMIT limit_count;
$$;
