# Srangam Platform Scalability Roadmap

**Last Updated**: 2026-02-15 (Enterprise Hardening Roadmap — Phase A)

---

## Current State (February 2026 — verified from live database)

| Metric | Jan 2025 | Feb 2026 | Actual Growth Rate |
|--------|----------|----------|-------------------|
| Articles | 41 | 49 | ~0.6/month (projected ~10/month — slower than expected) |
| Cross-References | 740 | 1,066 | ~25/month (projected ~200/month — much slower, but ratio per article is higher) |
| Cultural Terms | 1,628 | 1,699 | ~5/month (projected ~100/month — stabilized, most terms already extracted) |
| Tags | 146 | 170 | ~2/month (projected ~20/month — taxonomy maturing) |
| Bibliography | 25 | 30 | ~0.4/month |

**Analysis**: Growth has been slower than the Jan 2025 projections assumed. At current rates, the 100-article threshold (Phase 20 trigger) is ~7 years away unless publication pace increases. The system is well within current capacity. Scalability preparations (Phases 20-23) remain correctly deferred.

---

## Data Growth Projections

### 6 Months (July 2025)

| Metric | Projected | Impact |
|--------|-----------|--------|
| Articles | ~100 | Cross-ref calculation ~1s |
| Cross-References | ~2,000 | Graph may lag |
| Cultural Terms | ~2,500 | N+1 pattern noticeable |
| Tags | ~250 | Context window adequate |

### 12 Months (January 2026)

| Metric | Projected | Impact |
|--------|-----------|--------|
| Articles | ~200 | Cross-ref O(N) problematic |
| Cross-References | ~5,000 | Graph needs pagination |
| Cultural Terms | ~4,000 | Batch operations required |
| Tags | ~400 | May need sampling strategy |

### 24 Months (January 2027)

| Metric | Projected | Impact |
|--------|-----------|--------|
| Articles | ~500 | Vector search required |
| Cross-References | ~15,000 | Async computation needed |
| Cultural Terms | ~8,000 | Caching layer beneficial |
| Tags | ~800 | Category-based sampling |

---

## Bottleneck Analysis

### Tier 1: Immediate (Current)

| Bottleneck | Current | Threshold | Solution |
|------------|---------|-----------|----------|
| Tag categorization context | 0 examples | N/A | ✅ Phase 19a (done) |
| Slug resolution queries | 2 sequential | N/A | ✅ Phase 19c (done) |

### Tier 2: Short-Term (100 articles)

| Bottleneck | Current | Threshold | Solution |
|------------|---------|-----------|----------|
| Cultural term N+1 | 1,628 queries | 5,000 | Phase 19c: Batch upsert |
| Article list fetch | Full table | 100 rows | Phase 19d: Pagination |
| Graph visualization | 740 nodes | 2,000 | Phase 19d: Lazy loading |

### Tier 3: Medium-Term (500 articles)

| Bottleneck | Current | Threshold | Solution |
|------------|---------|-----------|----------|
| Cross-ref calculation | O(N) scan | 500 | Phase 19b: Tag vector index |
| Tag sampling | Top 100 | 500 | Weighted category sampling |
| Import concurrency | Single | 500 | Job queue with workers |

### Tier 4: Long-Term (1000+ articles)

| Bottleneck | Current | Threshold | Solution |
|------------|---------|-----------|----------|
| Semantic search | Tag matching | 1000 | pgvector embeddings |
| Table partitioning | Single table | 10000 | Partition by theme/year |
| CDN for assets | Edge proxy | 10000 | Dedicated CDN |

---

## Implementation Phases

### Phase 19: Reliability & Scalability Foundation ✅

**Status:** Complete (core tasks); remaining items deferred to Phase E triggers

| Task | Priority | Status |
|------|----------|--------|
| 19a: Tag categorization context | HIGH | ✅ Complete |
| 19c: Centralized slug resolver | HIGH | ✅ Complete |
| 19.0: Documentation | HIGH | ✅ Complete |
| 19b: Tag vector column | MEDIUM | 🔲 Deferred — cross-ref calc ~500ms at 49 articles, threshold is >1s |
| 19c: Batch cultural term upsert | MEDIUM | ✅ Implemented (per pipeline hardening) |
| 19d: Article pagination | MEDIUM | 🔲 Deferred — 49 articles, threshold is >100 |
| 19e: Structured error handling | MEDIUM | ✅ Partially complete — E-codes in import pipeline |

### Phase 20: Performance Optimization

**Trigger:** 100+ articles or cross-ref calculation > 1s

| Task | Description |
|------|-------------|
| 20a | Add `tag_vector` column with GIN index |
| 20b | Replace O(N) cross-ref with indexed search |
| 20c | Implement article list pagination |
| 20d | Add graph filtering (min connections) |

### Phase 21: Async Processing

**Trigger:** 500+ articles or import latency > 10s

| Task | Description |
|------|-------------|
| 21a | Implement job queue for imports |
| 21b | Async cross-reference recalculation |
| 21c | Background cultural term processing |
| 21d | Import progress notifications |

### Phase 22: Search & Discovery

**Trigger:** 500+ articles or user feedback

| Task | Description |
|------|-------------|
| 22a | Add pgvector extension |
| 22b | Generate article embeddings |
| 22c | Implement semantic search |
| 22d | "Similar articles" recommendations |

### Phase 23: Infrastructure Scaling

**Trigger:** 1000+ articles or 10k+ monthly visitors

| Task | Description |
|------|-------------|
| 23a | Evaluate table partitioning |
| 23b | Add read replicas if needed |
| 23c | Implement CDN for static assets |
| 23d | Review and optimize indexes |

---

## Database Evolution

### Current Schema (v1)

```
srangam_articles
├── slug (text, unique)
├── slug_alias (text, unique, nullable)
├── tags (text[])
└── ... other columns

srangam_cross_references
├── source_article_id (uuid, FK)
├── target_article_id (uuid, FK)
├── reference_type (text)
└── strength (int)
```

### Phase 19b Schema Addition

```sql
-- Add for fast tag similarity search
ALTER TABLE srangam_articles 
ADD COLUMN tag_vector tsvector 
GENERATED ALWAYS AS (array_to_tsvector(COALESCE(tags, '{}'))) STORED;

CREATE INDEX idx_articles_tag_vector 
ON srangam_articles USING GIN(tag_vector);
```

### Future: Vector Search Schema

```sql
-- Phase 22: Semantic embeddings
ALTER TABLE srangam_articles
ADD COLUMN content_embedding vector(1536);

CREATE INDEX idx_articles_embedding 
ON srangam_articles 
USING ivfflat (content_embedding vector_cosine_ops);
```

---

## Performance Monitoring

### Key Metrics to Track

| Metric | Current | Warning | Critical |
|--------|---------|---------|----------|
| Import latency | ~3s | > 10s | > 30s |
| Page load time | ~1.5s | > 3s | > 5s |
| Cross-ref calc | ~300ms | > 1s | > 5s |
| Graph render | ~500ms | > 2s | > 5s |
| API error rate | < 0.1% | > 1% | > 5% |

### Monitoring Locations

- Edge function logs: Supabase Dashboard → Logs
- Query performance: Supabase Dashboard → Database → Query Performance
- Frontend errors: Browser console / Sentry (if added)

---

## External Services

| Service | Purpose | Dependency | Phase |
|---------|---------|------------|-------|
| Sanskrit Automaton API | Sanskrit text analysis | Railway/Render | 21 |
| Sanskrit Heritage | Morphological data | inria.fr | 21 |
| IndicTrans2 | Machine translation | Hugging Face | 21 |
| ElevenLabs | English TTS | elevenlabs.io | 20 |
| Google Cloud TTS | Indic TTS | Google Cloud | 20 |

---

## Cost Projections

### Current Costs (Lovable Cloud)

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| Database | Included | $0 |
| Edge Functions | Included | $0 |
| AI (Lovable AI) | ~1000 calls | Included |
| Storage | < 1GB | $0 |

### Projected at 500 Articles

| Resource | Usage | Monthly Cost |
|----------|-------|--------------|
| Database | ~5GB | ~$0 (included) |
| Edge Functions | ~10k calls | ~$0 (included) |
| AI (Lovable AI) | ~5000 calls | May need credits |
| Storage | ~5GB | ~$0 (included) |

### Cost Optimization Strategies

1. **Audio caching:** Already implemented - avoids repeated TTS calls
2. **OG image caching:** Store in GDrive, not regenerate
3. **Tag context caching:** Cache category examples (5 min TTL)
4. **Batch operations:** Reduce per-call overhead

---

## Risk Mitigation

### Single Points of Failure

| Component | Risk | Mitigation |
|-----------|------|------------|
| Lovable AI | Service outage | Fallback to manual tagging |
| Google Drive | API limits | Consider alternative storage |
| Supabase | Outage | Data exports, status monitoring |

### Data Integrity Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Orphaned cross-refs | Low | Medium | FK constraints, cleanup job |
| Duplicate tags | Low | Low | Fuzzy matching on insert |
| Inconsistent counts | Low | Low | Periodic reconciliation |

---

## Success Metrics

| Milestone | Criteria |
|-----------|----------|
| Phase 19 complete | All tasks done, tests pass |
| 100 articles | < 5s import, < 2s page load |
| 500 articles | < 15s import, < 3s page load |
| 1000 articles | Async import, < 3s page load |

---

## Review Schedule

- **Monthly:** Review performance metrics
- **Quarterly:** Assess bottleneck thresholds
- **Bi-annually:** Full architecture review
