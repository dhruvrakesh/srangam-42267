/**
 * CANONICAL_SLUG_MAP — registry article id → canonical DB slug/alias.
 *
 * Phase 2.2 (Enterprise Roadmap, 2026-07-12).
 *
 * WHY THIS EXISTS
 * ---------------
 * The markdown importer standardizes long filenames into short slugs (e.g.
 * "Reassessing the Antiquity of the Rigveda.docx.md" → DB slug
 * `reassessing-antiquity-rigvedadocx`). The static TS registry, however, keeps
 * the original hand-authored id (`reassessing-rigveda-antiquity`). Because the
 * two ids differ, the list-page merge (`mergeArticleSources`) cannot tell they
 * are the SAME article, so BOTH cards render — the duplicate-card bug visible
 * on /articles.
 *
 * This map lets the merge (and, later, the resolver / search / parity script)
 * recognise a registry article by its published DB twin and collapse the
 * duplicate. It is DB-authoritative by design: when a registry id maps to a
 * slug that is present in the fetched DB set, the DB card wins and the static
 * card is dropped (matching the "database is the source of truth" decision).
 *
 * SAFETY
 * ------
 * Entries are only trusted when the mapped DB row actually exists in the merged
 * set. If the DB row is absent (e.g. it is a draft, so it is never fetched, or
 * it was deleted), the map value simply matches nothing and the static card is
 * kept — degrading to today's behaviour, never to a missing article.
 *
 * PROVENANCE
 * ----------
 * Each pair below was confirmed by matching the registry article's English
 * title against the live DB inventory (2026-07-12 export: 47 published rows).
 * Only high-confidence, same-article matches whose DB twin is PUBLISHED and
 * lives under a DIFFERENT slug/alias are included. Registry articles whose DB
 * twin is a draft or genuinely absent (maritime-memories-south-india,
 * riders-on-monsoon, monsoon-trade-clock, gondwana-to-himalaya,
 * indian-ocean-power-networks, ashoka-kandahar-edicts, kutai-yupa-borneo,
 * chola-naval-raid, pepper-and-bullion, earth-sea-sangam,
 * cosmic-island-sacred-land, stone-purana, scripts-that-sailed) are
 * deliberately NOT listed. Articles already deduped because their id equals the
 * DB slug/alias (jambudvipa-connected, sacred-tree-harvest-rhythms,
 * somnatha-prabhasa-itihasa, ringing-rocks-rhythmic-cosmology) are also omitted.
 *
 * NOTE: three of the target DB rows carry messy imported titles that should be
 * cleaned via Admin → Edit Metadata (they are the card that will now show):
 *   - reassessing-antiquity-rigvedadocx → "…Rigveda.docx (1)"
 *   - geomythology-cultural-continuity  → "xFrom Legends of Land Reclamation…"
 *   - sarira-atman-preservation-vedas   → "…Sāyaṇāchārya (1)"
 */
export const CANONICAL_SLUG_MAP: Record<string, string> = {
  'reassessing-ashoka-legacy': 'ashoka-legacy-buddhism',
  'scripts-that-sailed-ii': 'scripts-sailed-epigraphic-atlas',
  'janajati-oral-traditions': 'janajatiya-oral-traditions',
  'stone-song-and-sea': 'stone-song-sea-janajati',
  'asura-exiles-indo-iranian': 'asura-exiles-mitanni',
  'sarira-and-atman-vedic-preservation': 'sarira-atman-preservation-vedas',
  'rishi-genealogies-vedic-tradition': 'rishi-genealogies-vedic',
  'reassessing-rigveda-antiquity': 'reassessing-antiquity-rigvedadocx',
  'dashanami-ascetics-sacred-geography': 'dashanami-jyotirlinga-geography',
  'continuous-habitation-uttarapatha': 'continuous-habitation-india',
  'geomythology-land-reclamation': 'geomythology-cultural-continuity',
};

/**
 * Returns the canonical DB slug/alias for a registry id, or undefined if the
 * id is not mapped. Case-insensitive.
 */
export const getCanonicalSlug = (registryId?: string): string | undefined =>
  registryId ? CANONICAL_SLUG_MAP[registryId.toLowerCase()] : undefined;
