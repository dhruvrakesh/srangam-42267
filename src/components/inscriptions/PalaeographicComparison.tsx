import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

type PlateView = 'consonants' | 'numerals' | 'split';

interface PalaeographicComparisonProps {
  className?: string;
}

const glyphData = {
  consonants: [
    { 
      glyph: 'ka',
      tamilBrahmi: { char: '𑀓', unicode: 'U+11013', ductus: 'Round counter, vertical stem' },
      granthaPallava: { char: 'க', unicode: 'U+0B95', ductus: 'Angular, right-facing tail' },
      kawi: { char: '꧀ک', unicode: 'U+A9C0', ductus: 'Curved baseline, extended vowel marks' },
      cham: { char: 'ک', unicode: 'U+AA00', ductus: 'Compact, minimal ascenders' }
    },
    { 
      glyph: 'ma',
      tamilBrahmi: { char: '𑀫', unicode: 'U+1102B', ductus: 'Curved top, circular counter' },
      granthaPallava: { char: 'ம', unicode: 'U+0BAE', ductus: 'Sharp angles, diamond counter' },
      kawi: { char: '꧀م', unicode: 'U+A9C0+0645', ductus: 'Elongated horizontals' },
      cham: { char: 'م', unicode: 'U+AA2E', ductus: 'Rounded, minimal decoration' }
    },
    { 
      glyph: 'ya',
      tamilBrahmi: { char: '𑀬', unicode: 'U+1102C', ductus: 'Descender, leftward curve' },
      granthaPallava: { char: 'ய', unicode: 'U+0BAF', ductus: 'Angular descender, right hook' },
      kawi: { char: '꧀ی', unicode: 'U+A9C0+06CC', ductus: 'Extended descender' },
      cham: { char: 'ی', unicode: 'U+AA2F', ductus: 'Minimal descender' }
    },
    { 
      glyph: 'ra',
      tamilBrahmi: { char: '𑀭', unicode: 'U+1102D', ductus: 'Curved stroke, no tail' },
      granthaPallava: { char: 'ர', unicode: 'U+0BB0', ductus: 'Horizontal stroke, right tail' },
      kawi: { char: '꧀ر', unicode: 'U+A9C0+0631', ductus: 'Upward curve' },
      cham: { char: 'ر', unicode: 'U+AA30', ductus: 'Simple curve' }
    },
    { 
      glyph: 'śa',
      tamilBrahmi: { char: '𑀰', unicode: 'U+11030', ductus: 'Triple curves, ornate' },
      granthaPallava: { char: 'ஶ', unicode: 'U+0BB6', ductus: 'Angular, complex ligature' },
      kawi: { char: '꧀ش', unicode: 'U+A9C0+0634', ductus: 'Three terminals' },
      cham: { char: 'ش', unicode: 'U+AA36', ductus: 'Simplified curves' }
    }
  ],
  numerals: [
    { numeral: '1', tamilBrahmi: '𑁧', granthaPallava: '௧', kawi: '꧑', cham: '꩑' },
    { numeral: '2', tamilBrahmi: '𑁨', granthaPallava: '௨', kawi: '꧒', cham: '꩒' },
    { numeral: '3', tamilBrahmi: '𑁩', granthaPallava: '௩', kawi: '꧓', cham: '꩓' },
    { numeral: '4', tamilBrahmi: '𑁪', granthaPallava: '௪', kawi: '꧔', cham: '꩔' },
    { numeral: '5', tamilBrahmi: '𑁫', granthaPallava: '௫', kawi: '꧕', cham: '꩕' },
    { numeral: '6', tamilBrahmi: '𑁬', granthaPallava: '௬', kawi: '꧖', cham: '꩖' },
    { numeral: '7', tamilBrahmi: '𑁭', granthaPallava: '௭', kawi: '꧗', cham: '꩗' },
    { numeral: '8', tamilBrahmi: '𑁮', granthaPallava: '௮', kawi: '꧘', cham: '꩘' },
    { numeral: '9', tamilBrahmi: '𑁯', granthaPallava: '௯', kawi: '꧙', cham: '꩙' }
  ]
};

export const PalaeographicComparison: React.FC<PalaeographicComparisonProps> = ({ className }) => {
  const [view, setView] = useState<PlateView>('consonants');
  const [hoveredGlyph, setHoveredGlyph] = useState<string | null>(null);

  const handleDownload = (type: 'consonants' | 'numerals') => {
    const link = document.createElement('a');
    link.href = `/images/epigraphy/scripts_glyph_plate_${type}.svg`;
    link.download = `glyph_plate_${type}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6 border-b border-border">
        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
          Palaeographic Comparison: Glyph Evolution
        </h3>
        <p className="text-muted-foreground mb-4">
          Compare consonants and numerals across Tamil-Brāhmī, Grantha/Pallava, Kawi, and Cham scripts
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as PlateView)} className="flex-1">
            <TabsList>
              <TabsTrigger value="consonants">Consonants</TabsTrigger>
              <TabsTrigger value="numerals">Numerals</TabsTrigger>
              <TabsTrigger value="split">Split View</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('consonants')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Consonants SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('numerals')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Numerals SVG
          </Button>
        </div>
      </div>

      <div className="p-6">
        {view === 'consonants' && (
          <div className="space-y-6">
            <img 
              src="/images/epigraphy/scripts_glyph_plate_consonants.svg"
              alt="Consonant comparison plate across scripts"
              className="w-full rounded-lg border border-border"
            />
            
            {/* Interactive glyph table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-medium">Glyph</th>
                    <th className="p-3 text-left font-medium">Tamil-Brāhmī</th>
                    <th className="p-3 text-left font-medium">Grantha/Pallava</th>
                    <th className="p-3 text-left font-medium">Kawi</th>
                    <th className="p-3 text-left font-medium">Cham</th>
                  </tr>
                </thead>
                <tbody>
                  {glyphData.consonants.map((row) => (
                    <tr 
                      key={row.glyph}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                      onMouseEnter={() => setHoveredGlyph(row.glyph)}
                      onMouseLeave={() => setHoveredGlyph(null)}
                    >
                      <td className="p-3 font-brahmic font-semibold text-lg">{row.glyph}</td>
                      <td className="p-3">
                        <div className="font-brahmic text-2xl">{row.tamilBrahmi.char}</div>
                        <div className="text-xs text-muted-foreground mt-1">{row.tamilBrahmi.unicode}</div>
                        {hoveredGlyph === row.glyph && (
                          <div className="text-xs text-muted-foreground mt-1 italic">{row.tamilBrahmi.ductus}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-brahmic text-2xl">{row.granthaPallava.char}</div>
                        <div className="text-xs text-muted-foreground mt-1">{row.granthaPallava.unicode}</div>
                        {hoveredGlyph === row.glyph && (
                          <div className="text-xs text-muted-foreground mt-1 italic">{row.granthaPallava.ductus}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-brahmic text-2xl">{row.kawi.char}</div>
                        <div className="text-xs text-muted-foreground mt-1">{row.kawi.unicode}</div>
                        {hoveredGlyph === row.glyph && (
                          <div className="text-xs text-muted-foreground mt-1 italic">{row.kawi.ductus}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-brahmic text-2xl">{row.cham.char}</div>
                        <div className="text-xs text-muted-foreground mt-1">{row.cham.unicode}</div>
                        {hoveredGlyph === row.glyph && (
                          <div className="text-xs text-muted-foreground mt-1 italic">{row.cham.ductus}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'numerals' && (
          <div className="space-y-6">
            <img 
              src="/images/epigraphy/scripts_glyph_plate_numerals.svg"
              alt="Numeral comparison plate across scripts"
              className="w-full rounded-lg border border-border"
            />
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-left font-medium">Numeral</th>
                    <th className="p-3 text-left font-medium">Tamil-Brāhmī</th>
                    <th className="p-3 text-left font-medium">Grantha/Pallava</th>
                    <th className="p-3 text-left font-medium">Kawi</th>
                    <th className="p-3 text-left font-medium">Cham</th>
                  </tr>
                </thead>
                <tbody>
                  {glyphData.numerals.map((row) => (
                    <tr key={row.numeral} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold">{row.numeral}</td>
                      <td className="p-3 font-brahmic text-2xl">{row.tamilBrahmi}</td>
                      <td className="p-3 font-brahmic text-2xl">{row.granthaPallava}</td>
                      <td className="p-3 font-brahmic text-2xl">{row.kawi}</td>
                      <td className="p-3 font-brahmic text-2xl">{row.cham}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm mb-3">Consonants</h4>
              <img 
                src="/images/epigraphy/scripts_glyph_plate_consonants.svg"
                alt="Consonants plate"
                className="w-full rounded-lg border border-border"
              />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-3">Numerals</h4>
              <img 
                src="/images/epigraphy/scripts_glyph_plate_numerals.svg"
                alt="Numerals plate"
                className="w-full rounded-lg border border-border"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          <strong>Ductus Analysis:</strong> Hover over glyphs in the table to see stroke order and terminal notes. 
          The evolution from rounded Tamil-Brāhmī counters to angular Grantha/Pallava forms, 
          then to the extended horizontals of Kawi and compact Cham variants, illustrates palaeographic drift 
          across maritime trade routes.
        </p>
      </div>
    </Card>
  );
};
