import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function GayatriMantraExplainer() {
  const syllables = [
    'tat', 'sa', 'vi', 'tur', 'va', 're', 'ṇi', 'yaṃ', // Pāda 1 (8 syllables)
    'bhar', 'go', 'de', 'va', 'sya', 'dhī', 'ma', 'hi', // Pāda 2 (8 syllables)
    'dhi', 'yo', 'yo', 'naḥ', 'pra', 'co', 'da', 'yāt' // Pāda 3 (8 syllables)
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Deconstructing Ṛgveda 3.62.10: The Gāyatrī Mantra</CardTitle>
        <CardDescription>
          How the Anukramaṇī system preserves the world's most revered mantra
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metadata Tripartite */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-chart-1/10 border-chart-1/20">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-1" />
              Ṛṣi (Seer)
            </div>
            <p className="text-sm font-medium mb-1">Viśvāmitra Gāthinaḥ</p>
            <p className="text-xs text-muted-foreground">The seer is Viśvāmitra of the Gāthina clan, associated with the entire third Maṇḍala.</p>
          </div>
          <div className="p-4 rounded-lg border bg-chart-2/10 border-chart-2/20">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-2" />
              Devatā (Deity)
            </div>
            <p className="text-sm font-medium mb-1">Savitṛ</p>
            <p className="text-xs text-muted-foreground">The solar deity personifying divine stimulation and vivification, distinct from Sūrya.</p>
          </div>
          <div className="p-4 rounded-lg border bg-chart-3/10 border-chart-3/20">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-3" />
              Chandas (Meter)
            </div>
            <p className="text-sm font-medium mb-1">Gāyatrī</p>
            <p className="text-xs text-muted-foreground">Strict meter: 3 pādas (lines) × 8 syllables each = 24 syllables total.</p>
          </div>
        </div>

        {/* Sanskrit Text */}
        <div className="p-4 rounded-lg border bg-muted/30">
          <div className="text-center space-y-1">
            <p className="font-serif text-lg">ॐ भूर्भुवः स्वः</p>
            <p className="font-serif text-xl font-semibold">तत्सवितुर्वरेणियं भर्गो देवस्य धीमहि ।</p>
            <p className="font-serif text-xl font-semibold">धियो यो नः प्रचोदयात् ॥</p>
          </div>
        </div>

        {/* IAST Transliteration */}
        <div className="p-4 rounded-lg border">
          <div className="text-xs font-semibold text-muted-foreground mb-2">IAST Transliteration:</div>
          <p className="font-medium text-sm mb-2">
            tat savituḥ vareṇiyaṃ bhargo devasya dhīmahi |<br />
            dhiyo yo naḥ pracodayāt ||
          </p>
          <div className="text-xs text-muted-foreground mt-3">
            <strong>Translation:</strong> "We meditate on the excellent glory of the divine Savitṛ, who may stimulate our thoughts."
          </div>
        </div>

        {/* Syllabic Meter Visualization */}
        <div>
          <div className="text-sm font-semibold mb-3">Gāyatrī Meter Structure (24 syllables):</div>
          
          {/* Pāda 1 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Pāda 1</Badge>
              <span className="text-xs text-muted-foreground">8 syllables</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {syllables.slice(0, 8).map((syl, idx) => (
                <div key={idx} className="px-2 py-1 rounded bg-chart-1/20 text-xs font-mono border border-chart-1/30">
                  {syl}
                </div>
              ))}
            </div>
          </div>

          {/* Pāda 2 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Pāda 2</Badge>
              <span className="text-xs text-muted-foreground">8 syllables</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {syllables.slice(8, 16).map((syl, idx) => (
                <div key={idx} className="px-2 py-1 rounded bg-chart-2/20 text-xs font-mono border border-chart-2/30">
                  {syl}
                </div>
              ))}
            </div>
          </div>

          {/* Pāda 3 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">Pāda 3</Badge>
              <span className="text-xs text-muted-foreground">8 syllables</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {syllables.slice(16, 24).map((syl, idx) => (
                <div key={idx} className="px-2 py-1 rounded bg-chart-3/20 text-xs font-mono border border-chart-3/30">
                  {syl}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Error Detection Explanation */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="text-sm font-semibold mb-2">🔒 The Metrical Lock</div>
          <p className="text-xs text-muted-foreground">
            This rigid 24-syllable structure acts as a powerful checksum. Any addition, deletion, or alteration of syllables would violate the Gāyatrī meter, immediately flagging textual corruption. Combined with the Ṛṣi (Viśvāmitra) and Devatā (Savitṛ) metadata, the Anukramaṇī creates a multi-factor authentication system ensuring this mantra's perfect transmission across 3,000+ years.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
