-- QUERY_CEILING_2026_09_10
--
-- /research-network reported "Cross-References 1000 | Average Strength 6.6/10
-- | Reference Types 2" above a filter list offering five types. 1000 was not
-- a count, it was PostgREST's default row ceiling, and the other two figures
-- were computed in the browser over that truncated page.
--
-- Counts can be fixed with head-counts, which carry no rows and so are never
-- capped. avg() and count(distinct) cannot: they are aggregates. Doing them
-- client-side means shipping the whole table to the browser to perform
-- arithmetic Postgres does in a single sequential scan. That is the actual
-- fault here - the missing LIMIT was only how it became visible.
--
-- security_invoker = on so the view is subject to the same row-level policies
-- as the table it reads. Without it a view owned by postgres would report
-- aggregates over rows the caller is not permitted to see.
--
-- NOTE ON avg_strength: the old client code computed
--     sum(strength || 0) / rows
-- which counted a NULL strength as a zero and divided by every row. avg()
-- ignores NULLs. The number this returns is therefore not merely the
-- untruncated version of the old one, it is a different and better-defined
-- statistic. null_strength is exposed so the difference is inspectable
-- rather than mysterious.

create or replace view public.srangam_cross_reference_stats
with (security_invoker = on) as
select
  count(*)::bigint                              as total,
  count(distinct reference_type)::int           as distinct_types,
  round(avg(strength)::numeric, 2)              as avg_strength,
  min(strength)                                 as min_strength,
  max(strength)                                 as max_strength,
  count(*) filter (where strength is null)::int as null_strength,
  count(distinct source_article_id)::int        as source_articles,
  count(distinct target_article_id)::int        as target_articles
from public.srangam_cross_references;

comment on view public.srangam_cross_reference_stats is
  'QUERY_CEILING_2026_09_10. Exact aggregates for /research-network. Replaces '
  'client-side arithmetic over a PostgREST-capped fetch, which reported 1000 '
  'connections, 2 reference types and a mean over an arbitrary thousand rows.';

grant select on public.srangam_cross_reference_stats to anon, authenticated;
