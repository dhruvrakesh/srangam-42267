# Ṛṣi Genealogies Framework: Technical Documentation

## Overview

This document provides technical specifications for the four interactive components developed for the "Ṛṣi Genealogies in Vedic Tradition" article. These components visualize the genealogical, thematic, and bibliographic data related to the three major ṛṣi families (Bhṛgu, Āṅgiras, Kāśyapa) of the Ṛgveda.

---

## Chronological Framework

### Compositional Dating: Chronological Agnosticism

This framework deliberately avoids specifying absolute dates for Vedic composition. The traditional "1500-500 BCE" window (inherited from Max Müller's 19th-century speculations) has been challenged by:

- **Archaeoastronomical evidence** (Pleiades at vernal equinox → 8,000+ BP)
- **Sarasvatī River hydrology** (active flow descriptions → pre-4000 BP)
- **Archaeological continuity** (fire altar traditions at Mehrgarh → 7000 BCE)
- **Indigenous traditional frameworks** (Purāṇic Kalpa systems placing Vedic era in deep antiquity)

### Our Approach: Relative Chronology & Preservation History

All components use **relative chronology**:
- Generation 1 (patriarchs) → Generation 2 (primary composers) → Generation 3 (disciples)
- No absolute BCE/CE dates for composition
- Preservation milestones clearly labeled (e.g., "Anukramaṇīs systematized ~500 BCE" = formalization of existing oral traditions)

**Terminology Guidelines:**
- ✅ "Ancient ṛṣi lineages" / "Vedic Period - Traditional Chronology"
- ✅ "Relative chronology" / "Generational succession"
- ✅ "Preservation milestones" / "Systematization events"
- ❌ "Composed 1500-500 BCE" / "Ṛgveda dating to 1500 BCE"
- ❌ "Bronze Age India" (colonial periodization)

---

## Component 1: RishiLineageChart

### Purpose
Visual genealogical tree for each of the 3 ṛṣi lineages, showing father-son/guru-disciple relationships and Maṇḍala attributions.

### Data Schema

```typescript
interface RishiNode {
  id: string;                     // Unique identifier (e.g., 'bhrigu-cyavana')
  name: string;                   // Display name (e.g., 'Cyavana Bhārgava')
  patronymic?: string;            // Patronymic designation (e.g., 'son of Bhṛgu')
  lineage: 'Bhrigu' | 'Angirasa' | 'Kashyapa';
  generation: number;             // 1 = patriarch, 2 = first descendants, etc.
  hymnAttributions?: string[];    // Ṛgveda references (e.g., ['RV 10.119'])
  role?: string;                  // Specialization (e.g., 'Fire priest', 'Soma seer')
  references?: string[];          // Bibliography entry IDs
}

interface RishiEdge {
  from: string;                   // Parent node ID
  to: string;                     // Child node ID
  relationship: 'father-son' | 'guru-disciple' | 'adopted';
}
```

### Visual Design Specifications

**Layout:** Generational tiers arranged vertically (patriarch at top)

**Color Scheme:**
- **Bhṛgu lineage:** `#8B0000` (burgundy/fire red)
- **Āṅgiras lineage:** `#FF8C00` (saffron/golden orange)
- **Kāśyapa lineage:** `#8B4513` (sandalwood/earth brown)

**Node Styling:**
- Circular nodes (40px diameter)
- Border: 2px solid in lineage color
- Background: white with 10% lineage color tint
- Hover: Scale to 110%, show tooltip

**Edge Styling:**
- Solid lines for father-son relationships
- Dashed lines for guru-disciple relationships
- Dotted lines for adoptions (e.g., Gṛtsamada)

### Implementation Approach

**Option A: D3.js Tree Layout**
```typescript
import * as d3 from 'd3';

const treeLayout = d3.tree<RishiNode>()
  .size([width, height])
  .separation((a, b) => a.parent === b.parent ? 1 : 2);
```

**Option B: CSS Grid Generational Tiers**
```css
.lineage-chart {
  display: grid;
  grid-template-rows: repeat(auto-fit, 120px);
  gap: 40px;
}

.generation-tier {
  display: flex;
  justify-content: center;
  gap: 80px;
}
```

### Tooltip Content

```typescript
interface TooltipData {
  name: string;
  patronymic?: string;
  hymnAttributions?: string[];
  role?: string;
  biography: string;  // Short description (2-3 sentences)
}
```

**Example:**
```
Cyavana Bhārgava
Son of Bhṛgu

RV 10.119 (Soma rejuvenation)
Role: Bhṛgu fire priest

Cyavana is celebrated for his Soma-induced rejuvenation legend. 
His hymn (RV 10.119) describes regaining youth through sacred ritual.
```

### Accessibility

- **Keyboard Navigation:** Tab through nodes, Enter to expand tooltip
- **ARIA Labels:** `aria-label="Cyavana Bhārgava, generation 2, Bhṛgu lineage"`
- **Screen Reader:** Announce node name, generation, lineage, hymn count

### Data Sources

**Bhṛgu Lineage:**
```typescript
const bhriguNodes: RishiNode[] = [
  { id: 'bhrigu-patriarch', name: 'Bhṛgu', lineage: 'Bhrigu', generation: 1, role: 'Patriarch, fire priest' },
  { id: 'bhrigu-cyavana', name: 'Cyavana', patronymic: 'son of Bhṛgu', lineage: 'Bhrigu', generation: 2, hymnAttributions: ['RV 10.119'] },
  { id: 'bhrigu-aurva', name: 'Aurva', patronymic: 'grandson of Bhṛgu', lineage: 'Bhrigu', generation: 3, role: 'Fire emergence legend' },
  { id: 'bhrigu-gritsamada', name: 'Gṛtsamada Śaunaka', patronymic: 'son of Śunahotra (Āṅgiras), adopted by Śunaka (Bhṛgu)', lineage: 'Bhrigu', generation: 2, hymnAttributions: ['RV 2.1-2.43'], role: 'Maṇḍala II composer' }
];
```

**Āṅgiras Lineage:**
```typescript
const angirasaNodes: RishiNode[] = [
  { id: 'angirasa-patriarch', name: 'Aṅgiras', lineage: 'Angirasa', generation: 1, role: 'Patriarch, light-bringer' },
  
  // Gautama branch
  { id: 'angirasa-gautama', name: 'Gautama', patronymic: 'descendant of Aṅgiras', lineage: 'Angirasa', generation: 2 },
  { id: 'angirasa-vamadeva', name: 'Vāmadeva Gautama', lineage: 'Angirasa', generation: 3, hymnAttributions: ['RV 4.1-4.58'], role: 'Maṇḍala IV composer (58 hymns)' },
  
  // Bharadvāja branch
  { id: 'angirasa-bharadvaja', name: 'Bharadvāja Bārhaspatya', patronymic: 'son of Bṛhaspati', lineage: 'Angirasa', generation: 2, hymnAttributions: ['RV 6.1-6.75'], role: 'Maṇḍala VI composer (75 hymns)' },
  
  // Kaṇva branch
  { id: 'angirasa-kanva', name: 'Kaṇva', lineage: 'Angirasa', generation: 2, hymnAttributions: ['RV 8 (partial)'], role: 'Soma hymns' }
];
```

**Kāśyapa Lineage:**
```typescript
const kashyapaNodes: RishiNode[] = [
  { id: 'kashyapa-patriarch', name: 'Kaśyapa', patronymic: 'son of Marīci', lineage: 'Kashyapa', generation: 1, role: 'Prajāpati, cosmic progenitor' },
  { id: 'kashyapa-marica', name: 'Kaśyapa Mārīca', lineage: 'Kashyapa', generation: 2, hymnAttributions: ['RV 9.67', 'RV 9.113-114'], role: 'Soma Pavamāna specialist (6 hymns)' },
  { id: 'kashyapa-asuri', name: 'Āsuri', patronymic: 'grandson of Kaśyapa', lineage: 'Kashyapa', generation: 3, role: 'Atharvaveda tradition' }
];
```

### Performance Optimization

- **Lazy Loading:** Load D3.js only when component is visible (Intersection Observer)
- **Memoization:** Cache rendered tree structure
- **Virtual Scrolling:** If >50 nodes, render only visible portion

---

## Component 2: MandalaAttributionTable

### Purpose
Sortable/filterable table showing which Maṇḍalas (books) of the Ṛgveda are attributed to which ṛṣi lineages.

### Data Schema

```typescript
interface MandalaEntry {
  mandala: number;                              // 1-10
  primaryLineage: 'Bhrigu' | 'Angirasa' | 'Kashyapa' | 'Mixed';
  keySeers: string[];                           // Primary composers
  hymnCount: number;                            // Total hymns in this Maṇḍala
  dominantDeities: string[];                    // Most frequently invoked deities
  notes?: string;                               // Context (e.g., "Family book")
}
```

### Table Data (from article)

```typescript
const mandalaData: MandalaEntry[] = [
  {
    mandala: 2,
    primaryLineage: 'Bhrigu',
    keySeers: ['Gṛtsamada Śaunaka'],
    hymnCount: 43,
    dominantDeities: ['Agni', 'Indra'],
    notes: 'Family book of Bhṛgus (though Gṛtsamada had Āṅgiras birth)'
  },
  {
    mandala: 4,
    primaryLineage: 'Angirasa',
    keySeers: ['Vāmadeva Gautama'],
    hymnCount: 58,
    dominantDeities: ['Indra', 'Agni'],
    notes: 'Pure Gautama branch of Āṅgirasas'
  },
  {
    mandala: 6,
    primaryLineage: 'Angirasa',
    keySeers: ['Bharadvāja Bārhaspatya'],
    hymnCount: 75,
    dominantDeities: ['Indra', 'Agni'],
    notes: 'Pure Bharadvāja branch of Āṅgirasas'
  },
  {
    mandala: 8,
    primaryLineage: 'Angirasa',
    keySeers: ['Kaṇva'],
    hymnCount: 25,  // Partial attribution
    dominantDeities: ['Indra', 'Soma'],
    notes: 'Mixed with other composers'
  },
  {
    mandala: 9,
    primaryLineage: 'Kashyapa',
    keySeers: ['Kaśyapa Mārīca'],
    hymnCount: 6,
    dominantDeities: ['Soma Pavamāna'],
    notes: 'Specialized Soma liturgy (RV 9.67, 9.113-114)'
  },
  {
    mandala: 10,
    primaryLineage: 'Mixed',
    keySeers: ['Various'],
    hymnCount: 191,
    dominantDeities: ['Diverse pantheon'],
    notes: 'Later collection with multiple lineages'
  }
];
```

### Sorting & Filtering

**Sort Options:**
- By Maṇḍala number (ascending/descending)
- By hymn count (most/least)
- By lineage (alphabetical)

**Filter Options:**
- Show only Bhṛgu attributions
- Show only Āṅgiras attributions
- Show only Kāśyapa attributions
- Show all (including Mixed)

### Export Functionality

**CSV Export:**
```csv
Mandala,Primary Lineage,Key Seers,Hymn Count,Dominant Deities,Notes
2,Bhrigu,Gṛtsamada Śaunaka,43,"Agni, Indra","Family book of Bhṛgus"
4,Angirasa,Vāmadeva Gautama,58,"Indra, Agni","Pure Gautama branch"
...
```

### Accessibility

- **Sortable Headers:** `aria-sort="ascending"` or `"descending"`
- **Filter Dropdown:** Keyboard navigable with arrow keys
- **Row Click:** Navigate to article section with focus management

---

## Component 3: RishiOverlapVisualization

### Purpose
Venn diagram showing inter-lineage connections and dual affiliations.

### Data Schema

```typescript
interface LineageOverlap {
  zones: {
    bhriguOnly: string[];            // Pure Bhṛgu figures
    angirasaOnly: string[];          // Pure Āṅgiras figures
    kashyapaOnly: string[];          // Pure Kāśyapa figures
    bhriguAngirasa: string[];        // Dual affiliation
    bhriguKashyapa: string[];        // Dual affiliation
    angirasaKashyapa: string[];      // Dual affiliation (rare)
    allThree: string[];              // Triple affiliation (Atharvaveda)
  };
  explanations: Record<string, string>;  // Key for each overlapping figure
}
```

### Overlap Data (from article)

```typescript
const overlapData: LineageOverlap = {
  zones: {
    bhriguOnly: ['Bhṛgu (patriarch)', 'Aurva', 'Apnavāna', 'Jamadagni'],
    angirasaOnly: ['Aṅgiras (patriarch)', 'Vāmadeva Gautama', 'Bharadvāja', 'Kaṇva'],
    kashyapaOnly: ['Kaśyapa (patriarch)', 'Kaśyapa Mārīca', 'Āsuri'],
    bhriguAngirasa: ['Gṛtsamada Śaunaka', 'Cyavana Bhārgava'],
    bhriguKashyapa: ['Atharvaveda hymns (RV 10.14)'],
    angirasaKashyapa: [],
    allThree: ['Atharvāṅgirasāḥ tradition']
  },
  explanations: {
    'Gṛtsamada Śaunaka': 'Born to Āṅgiras (son of Śunahotra), adopted by Bhṛgu (Śunaka). Composed Maṇḍala II, traditionally a Bhṛgu family book.',
    'Cyavana Bhārgava': 'Primarily Bhṛgu (son of Bhṛgu), but called "Āṅgirasa" in Śatapatha Brāhmaṇa 4.1.5.1, possibly due to ritual adoption or second marriage.',
    'Atharvāṅgirasāḥ': 'Compound name for Atharvaveda tradition, synthesizing Atharvan (Bhṛgu-allied), Aṅgiras, and Kāśyapa contributions (RV 10.14).'
  }
};
```

### Visual Implementation

**SVG Venn Diagram:**
```typescript
<svg viewBox="0 0 800 600">
  {/* Bhṛgu circle (left) */}
  <circle cx="250" cy="300" r="180" fill="#8B0000" opacity="0.3" />
  
  {/* Āṅgiras circle (right) */}
  <circle cx="550" cy="300" r="180" fill="#FF8C00" opacity="0.3" />
  
  {/* Kāśyapa circle (bottom) */}
  <circle cx="400" cy="450" r="180" fill="#8B4513" opacity="0.3" />
  
  {/* Text labels in zones */}
  <text x="400" y="200" className="intersection-label">Atharvāṅgirasāḥ</text>
  <text x="350" y="300" className="intersection-label">Gṛtsamada, Cyavana</text>
</svg>
```

### Tooltip Interactions

**Hover on intersection zone:**
```
Bhṛgu ∩ Āṅgiras

Gṛtsamada Śaunaka
Born Āṅgiras (Śunahotra), adopted by Bhṛgu (Śunaka)
Composed Maṇḍala II (43 hymns)

Cyavana Bhārgava
Called both Bhṛgu and Āṅgirasa in different texts
RV 10.119 (Soma rejuvenation)
```

### Accessibility

- **Focus States:** Tab through intersection zones
- **ARIA Labels:** `aria-label="Intersection of Bhrigu and Angirasa lineages, containing Gritsamada and Cyavana"`
- **Screen Reader Announcement:** "2 figures with dual Bhrigu-Angirasa affiliation"

---

## Component 4: RishiGenealogiesBibliography

### Purpose
Comprehensive searchable bibliography with 50+ sources extracted from article footnotes.

### Data Schema

```typescript
interface BibEntry {
  id: string;                                    // Unique identifier (e.g., 'rsis-primary-1')
  type: 'primary' | 'anukramani' | 'modern' | 'online';
  citation: string;                              // Full citation in MLA format
  year?: string;                                 // Publication year (or date range)
  url?: string;                                  // Optional link
  notes?: string;                                // Annotation (2-3 sentences)
}
```

### Bibliography Categories

**Primary Texts** (Vedic Saṃhitās, Brāhmaṇas, Purāṇas):
- Ṛgveda Saṁhitā (Anukramaṇī attributions)
- Bṛhaddevatā (Śaunaka tradition)
- Śatapatha Brāhmaṇa (Cyavana references)
- Atharvaveda (Atharvāṅgirasāḥ tradition)
- Mahābhārata Ādiparvan (Bhṛgu genealogy)

**Anukramaṇī Editions:**
- Sarvānukramaṇī (Śaunaka)
- Ṛṣyanukramaṇī (ṛṣi-specific index)
- Devatānukramaṇī (deity index)
- Chandasānukramaṇī (meter index)

**Modern Scholarship:**
- Macdonell & Keith, *Vedic Index of Names and Subjects* (1912)
- Jamison & Brereton, *The Rigveda* (2014)
- Griffith translation (1896, public domain)
- Sāyaṇa's Ṛgveda Bhāṣya (14th cent. CE)

**Online Resources:**
- Dharmawiki articles (Bhrigu, Angirasa, Kashyapa)
- Hinduism Stack Exchange discussions
- Sacred-texts.com Ṛgveda archive
- Wisdom Library (Purāṇic sources)

### Search & Sort Features

**Search Implementation:**
```typescript
const filteredBib = bibliography.filter(entry =>
  entry.citation.toLowerCase().includes(searchTerm.toLowerCase()) ||
  entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Sort Options:**
- **Default:** By category (Primary → Anukramaṇī → Modern → Online)
- **Chronological:** Parse year strings, handle relative dates
- **Alphabetical:** By first author's last name

### Export Formats

**BibTeX:**
```bibtex
@book{macdonell1912vedic,
  title={Vedic Index of Names and Subjects},
  author={Macdonell, A.A. and Keith, A.B.},
  year={1912},
  publisher={John Murray},
  address={London}
}
```

**MLA (9th edition):**
```
Macdonell, A.A., and A.B. Keith. Vedic Index of Names and Subjects. John Murray, 1912.
```

**APA (7th edition):**
```
Macdonell, A. A., & Keith, A. B. (1912). Vedic index of names and subjects. John Murray.
```

### Accessibility

- **Accordion Navigation:** Keyboard expand/collapse (Space/Enter)
- **Search Field:** `aria-label="Search bibliography by author, title, or year"`
- **Copy Button:** Announce "Citation copied to clipboard" via screen reader

---

## Integration with Existing Components

### Relationship to AnukramaniTriadVisualization

**Existing Component** (`src/components/articles/AnukramaniTriadVisualization.tsx`):
- Shows **systemic view**: Ṛṣi-Devatā-Chandas tripartite index
- Demonstrates **how** the Anukramaṇī system worked as multi-factor authentication

**New RishiLineageChart:**
- Shows **genealogical view**: Father-son lineages within ṛṣi families
- Demonstrates **who** the seers were and their family relationships

**Complementarity:** Anukramani = "system architecture", RishiLineage = "human actors"

### Relationship to VedicPreservationTimeline

**Existing Component** (`src/components/articles/VedicPreservationTimeline.tsx`):
- Shows **preservation history**: Systematization events (Anukramaṇī codification ~500 BCE → Sāyaṇa's bhāṣya 1350-1387 CE)
- **Explicitly clarified:** Timeline tracks preservation milestones, NOT compositional origins (which extend 8,000-10,000+ years BP)

**New RishiLineageChart:**
- Shows **spatial/familial view**: Generational descent, relative chronology only

**Complementarity:** Timeline = "when preservation happened", RishiLineage = "who preserved it across generations"

---

## Accessibility Guidelines

### Keyboard Navigation
- **Tab:** Move between interactive elements
- **Enter/Space:** Activate buttons, expand accordions
- **Arrow Keys:** Navigate within tables, tree structures

### ARIA Labels
```typescript
<div role="tree" aria-label="Bhrigu lineage genealogical chart">
  <div role="treeitem" aria-expanded="false" aria-label="Bhrigu, patriarch, generation 1">
    ...
  </div>
</div>
```

### Color Contrast
- **WCAG AA Compliance:** Minimum 4.5:1 contrast ratio for text
- **Lineage Colors:**
  - Bhṛgu burgundy (#8B0000) on white: 8.3:1 ✓
  - Āṅgiras saffron (#FF8C00) on white: 3.8:1 ✗ → Use darker shade (#CC7000) for text
  - Kāśyapa sandalwood (#8B4513) on white: 5.2:1 ✓

### Screen Reader Announcements
```typescript
// On node click
announceToScreenReader(`Expanded ${node.name}, ${node.patronymic}. ${node.hymnAttributions?.length || 0} hymn attributions.`);

// On sort change
announceToScreenReader(`Sorted bibliography by ${sortBy}. ${sortedBib.length} results.`);
```

---

## Performance Optimization

### Bundle Size Monitoring
**Estimated Component Sizes:**
- RishiLineageChart: ~15KB (includes D3.js tree utils)
- MandalaAttributionTable: ~8KB
- RishiOverlapVisualization: ~10KB (SVG rendering)
- RishiGenealogiesBibliography: ~12KB (50+ entries)
- **Total:** ~45KB (acceptable for article enhancement)

### Lazy Loading Strategy
```typescript
// In ArticlePage.tsx
const RishiLineageChart = lazy(() => import('@/components/articles/RishiLineageChart'));

<Suspense fallback={<ChartSkeleton />}>
  <RishiLineageChart lineage="bhrigu" />
</Suspense>
```

### Memoization
```typescript
const sortedBibliography = useMemo(() => {
  return [...bibliography].sort((a, b) => {
    if (sortBy === 'year') {
      const yearA = parseInt(a.year?.replace(/[^0-9-]/g, '') || '0', 10);
      const yearB = parseInt(b.year?.replace(/[^0-9-]/g, '') || '0', 10);
      if (isNaN(yearA) || isNaN(yearB)) return 0;
      return yearB - yearA;
    }
    return a.citation.localeCompare(b.citation);
  });
}, [sortBy]);
```

---

## Testing Checklist

### Unit Tests
- [ ] RishiLineageChart: Renders all nodes for each lineage
- [ ] MandalaAttributionTable: Sorting/filtering works correctly
- [ ] RishiOverlapVisualization: Venn diagram zones display
- [ ] RishiGenealogiesBibliography: Search returns correct results

### Integration Tests
- [ ] Components load on article page
- [ ] Cross-references to Śarīra & Ātman work
- [ ] Export functions (CSV, BibTeX) produce valid files

### Accessibility Tests
- [ ] Keyboard-only navigation possible
- [ ] Screen reader announces all interactive elements
- [ ] Color contrast meets WCAG AA standards

### Performance Tests
- [ ] Initial load <3 seconds
- [ ] Lighthouse Performance score >85
- [ ] No layout shift (CLS <0.1)

---

## Maintenance Guidelines

### Updating Bibliography
**Process:**
1. Add new `BibEntry` to `bibliography` array in `RishiGenealogiesBibliography.tsx`
2. Categorize as `primary`, `anukramani`, `modern`, or `online`
3. Include year (avoid absolute compositional dates for primary texts), URL (if available), and notes
4. Run `npm run lint` to check formatting

### Extending Genealogies
**Process:**
1. Add new `RishiNode` to appropriate lineage array (`bhriguNodes`, `angirasaNodes`, `kashyapaNodes`)
2. Update `generation` numbers if adding new tier
3. Add `RishiEdge` to connect to parent node
4. Test rendering with `npm run dev`

### Adding New Lineages
**Requirements:**
- Minimum 3 generations for genealogical depth
- At least 1 Maṇḍala attribution
- Primary source references (Anukramaṇī or Bṛhaddevatā)

**Example: Adding Atri Lineage (Maṇḍala V):**
```typescript
const atriNodes: RishiNode[] = [
  { id: 'atri-patriarch', name: 'Atri', lineage: 'Atri', generation: 1 },
  { id: 'atri-syavaśva', name: 'Syāvāśva', patronymic: 'son of Atri', lineage: 'Atri', generation: 2, hymnAttributions: ['RV 5.1-5.87'] }
];
```

---

## Conclusion

These four components form an integrated visualization suite that transforms the scholarly article "Ṛṣi Genealogies in Vedic Tradition" into an interactive learning experience. By combining genealogical trees, attribution tables, overlap diagrams, and comprehensive bibliographies, users can explore the human dimension of Vedic preservation alongside the technical mechanisms documented in the companion article "Śarīra and Ātman."

**Chronological Principle:** All components maintain **chronological agnosticism** regarding original composition dates, focusing instead on relative chronology (generational succession) and documented preservation milestones (systematization events). This respects ongoing scholarly debate while avoiding colonial-era dating assumptions challenged by archaeoastronomical, geological, and indigenous traditional evidence.

**Next Steps:**
1. Conduct usability testing with academic researchers
2. Gather feedback on visualization clarity
3. Iterate on component designs based on user data
4. Expand to include Maṇḍalas III, V, VII (Viśvāmitra, Atri, Vasiṣṭha lineages)
