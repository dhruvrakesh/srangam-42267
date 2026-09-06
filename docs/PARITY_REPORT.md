# Static ↔ Database Parity Report

**Generated**: 2026-09-06T13:23:27.248Z by `scripts/registry-parity-check.mjs` (roadmap Phase 2.0)
**Database**: https://xjaizfjcpkjcqbyobcsh.supabase.co — 49 articles (49 published, 0 draft)
**Result**: ⚠️ 34 gap(s) found

| Slug | Source | Status | Detail |
|---|---|---|---|
| maritime-memories-south-india | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| scripts-that-sailed | registry | ❌ MISSING IN DB | static languages: en,hi,pa,ta |
| riders-on-monsoon | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| monsoon-trade-clock | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| gondwana-to-himalaya | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| indian-ocean-power-networks | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| ashoka-kandahar-edicts | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| reassessing-ashoka-legacy | registry | ❌ MISSING IN DB | static languages: en |
| kutai-yupa-borneo | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| chola-naval-raid | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| pepper-and-bullion | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| earth-sea-sangam | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| jambudvipa-connected | registry | ⚠️ CONTENT GAP | DB missing languages: as,bn,hi,kn,pa,pn,ta,te |
| cosmic-island-sacred-land | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| stone-purana | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| scripts-that-sailed-ii | registry | ❌ MISSING IN DB | static languages: en,hi,ta |
| janajati-oral-traditions | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| sacred-tree-harvest-rhythms | registry | ⚠️ CONTENT GAP | DB missing languages: as,bn,hi,kn,pa,pn,ta,te |
| stone-song-and-sea | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| asura-exiles-indo-iranian | registry | ❌ MISSING IN DB | static languages: en |
| sarira-and-atman-vedic-preservation | registry | ❌ MISSING IN DB | static languages: en |
| rishi-genealogies-vedic-tradition | registry | ❌ MISSING IN DB | static languages: en |
| reassessing-rigveda-antiquity | registry | ❌ MISSING IN DB | static languages: en |
| geomythology-land-reclamation | registry | ❌ MISSING IN DB | static languages: as,bn,en,hi,kn,pa,pn,ta,te |
| dashanami-ascetics-sacred-geography | registry | ❌ MISSING IN DB | static languages: en |
| continuous-habitation-uttarapatha | registry | ❌ MISSING IN DB | static languages: en |
| somnatha-prabhasa-itihasa | registry | ✅ OK | langs en |
| ringing-rocks-rhythmic-cosmology | registry | ✅ OK | langs en |
| maritime-memories-south-india | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| bharats-ancient-heritage | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| pepper-and-bullion | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| indian-ocean-power-networks | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| chola-naval-raid | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| riders-on-monsoon | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| dharmic-heritage-maritime-trade | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |
| samudra-manthan | json_card | ❌ MISSING IN DB | card has 4 pins, 3 MLA refs — served by fallback only |

## How to act on gaps

- **MISSING IN DB (registry)** → import via Admin → Markdown Import (or `markdown-to-article-import`), then re-run.
- **CONTENT GAP** → DB body is shorter than the static registry version for that language; re-import that language's content.
- **PINS ONLY IN CARD** → run `backfill-article-pins` for that article, or keep relying on the resolver's card-pin enrichment (Phase 2.1) until backfilled.
- Re-run until ✅ FULL PARITY, then proceed to roadmap 2.6 (registry retirement) after 2+ weeks of zero `static_fallback_serve` events.
