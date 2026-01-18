import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/language/LanguageProvider';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface EvidenceTableProps {
  headers: string[];
  rows: string[][];
  className?: string;
}

/**
 * Specialized component for 6-column scholarly evidence tables.
 * Features:
 * - Source quality badges (Primary/Secondary/Tradition)
 * - Mobile card-based layout
 * - Desktop table with proper column distribution
 */
export const EvidenceTable: React.FC<EvidenceTableProps> = ({
  headers,
  rows,
  className
}) => {
  const { currentLanguage } = useLanguage();
  
  // Detect script font based on language
  const scriptFont = currentLanguage === 'hi' 
    ? 'font-hindi' 
    : currentLanguage === 'pa' 
      ? 'font-punjabi' 
      : '';

  // Find evidence column index
  const evidenceColIndex = headers.findIndex(h => 
    h.toLowerCase().includes('evidence') || 
    h.toLowerCase().includes('source')
  );

  /**
   * Render source quality badge based on evidence text
   */
  const renderEvidenceBadge = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('primary') || lowerText.includes('epigraphic') || lowerText.includes('inscription')) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-medium">
          Primary
        </Badge>
      );
    }
    if (lowerText.includes('secondary') || lowerText.includes('chronicle') || lowerText.includes('historical')) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-medium">
          Secondary
        </Badge>
      );
    }
    if (lowerText.includes('tradition') || lowerText.includes('oral') || lowerText.includes('legend')) {
      return (
        <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-medium">
          Tradition
        </Badge>
      );
    }
    return null;
  };

  /**
   * Mobile card layout - renders each row as a collapsible card
   */
  const MobileCardView = () => (
    <div className="space-y-3 md:hidden">
      {rows.map((row, rowIndex) => (
        <Collapsible key={rowIndex} defaultOpen={rowIndex === 0}>
          <div className="border border-burgundy/20 rounded-lg overflow-hidden bg-background shadow-sm">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between px-4 py-3 bg-sandalwood/30 hover:bg-sandalwood/40 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={cn("font-semibold text-burgundy", scriptFont)}>
                    {row[0]}
                  </span>
                  {row[1] && (
                    <span className={cn("text-muted-foreground text-sm", scriptFont)}>
                      • {row[1]}
                    </span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-burgundy transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 py-3 space-y-3 border-t border-burgundy/10">
                {headers.slice(2).map((header, colIndex) => {
                  const cellValue = row[colIndex + 2] || '';
                  const isEvidenceCol = colIndex + 2 === evidenceColIndex;
                  
                  return (
                    <div key={colIndex} className="space-y-1">
                      <div className="text-xs uppercase tracking-wide text-burgundy/70 font-medium">
                        {header}
                      </div>
                      <div className={cn("text-sm leading-relaxed", scriptFont)}>
                        {isEvidenceCol && renderEvidenceBadge(cellValue) && (
                          <div className="mb-1">
                            {renderEvidenceBadge(cellValue)}
                          </div>
                        )}
                        {cellValue}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );

  /**
   * Desktop table view with optimized column widths
   */
  const DesktopTableView = () => {
    // Calculate column widths based on column count
    const colCount = headers.length;
    const getColumnWidth = (index: number) => {
      if (colCount === 6) {
        // Optimized for evidence tables: Date, Place, Actors, Event, Meaning, Evidence
        const widths = ['10%', '12%', '15%', '20%', '23%', '20%'];
        return widths[index] || 'auto';
      }
      // Default: equal distribution
      return `${100 / colCount}%`;
    };

    return (
      <div className="hidden md:block relative overflow-x-auto rounded-lg border border-burgundy/20 shadow-sm">
        <table className="w-full border-collapse min-w-[800px]">
          <colgroup>
            {headers.map((_, index) => (
              <col key={index} style={{ width: getColumnWidth(index) }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-sandalwood/95 backdrop-blur-sm border-b-2 border-burgundy/30">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={cn(
                    "border border-burgundy/20 bg-burgundy/10 px-3 py-2.5",
                    "text-left font-semibold text-burgundy text-xs uppercase tracking-wide",
                    scriptFont
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex}
                className={cn(
                  "transition-colors hover:bg-saffron/10",
                  rowIndex % 2 === 1 && "bg-sandalwood/20"
                )}
              >
                {row.map((cell, cellIndex) => {
                  const isEvidenceCol = cellIndex === evidenceColIndex;
                  const isFirstCol = cellIndex === 0;
                  
                  return (
                    <td
                      key={cellIndex}
                      className={cn(
                        "border border-burgundy/15 px-3 py-2.5 text-sm leading-relaxed align-top",
                        isFirstCol && "font-medium bg-sandalwood/20",
                        scriptFont
                      )}
                    >
                      {isEvidenceCol && renderEvidenceBadge(cell) && (
                        <div className="mb-1">
                          {renderEvidenceBadge(cell)}
                        </div>
                      )}
                      <span className="break-words">{cell}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={cn("my-8", className)}>
      <MobileCardView />
      <DesktopTableView />
    </div>
  );
};

/**
 * Utility to detect if a table is an evidence table based on headers
 * Supports English AND Hindi patterns
 */
export const isEvidenceTable = (headers: string[]): boolean => {
  if (headers.length < 5) return false; // Evidence tables have at least 5-6 columns
  
  const headerText = headers.join(' ').toLowerCase();
  
  // English patterns
  const hasEnglishDate = headerText.includes('date') || headerText.includes('year') || headerText.includes('period');
  const hasEnglishPlace = headerText.includes('place') || headerText.includes('location');
  const hasEnglishEvidence = headerText.includes('evidence') || headerText.includes('source') || headerText.includes('type');
  const hasEnglishPattern = hasEnglishDate && hasEnglishPlace && hasEnglishEvidence;
  
  // Hindi patterns (तिथि = date, स्थान = place, साक्ष्य = evidence)
  const hasHindiDate = headerText.includes('तिथि') || headerText.includes('वर्ष') || headerText.includes('काल');
  const hasHindiPlace = headerText.includes('स्थान') || headerText.includes('जगह');
  const hasHindiEvidence = headerText.includes('साक्ष्य') || headerText.includes('प्रमाण') || headerText.includes('स्रोत');
  const hasHindiPattern = hasHindiDate && hasHindiPlace && hasHindiEvidence;
  
  // Fallback: If we have 6+ columns with typical scholarly headers
  const hasSlNumber = headerText.includes('sl') || headerText.includes('#') || headerText.includes('क्र');
  const hasEvent = headerText.includes('event') || headerText.includes('घटना');
  const hasScholarlyFallback = headers.length >= 6 && (hasSlNumber || hasEvent);
  
  return hasEnglishPattern || hasHindiPattern || hasScholarlyFallback;
};

export default EvidenceTable;
