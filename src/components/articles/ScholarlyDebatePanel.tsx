import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Interpretation {
  title: string;
  period: string;
  keyPoints: string[];
  evidence: string[];
  scholars: string[];
}

const colonialInterpretation: Interpretation = {
  title: "Colonial Interpretation",
  period: "19th–Early 20th Century",
  keyPoints: [
    "Ashoka portrayed as 'Buddhist Constantine'",
    "Conversion narrative: personal crisis → Buddhist evangelism",
    "Buddhism as Mauryan state religion",
    "Emphasis on religious zeal over political pragmatism"
  ],
  evidence: [
    "Focus on Ashoka's rock edicts mentioning dhamma",
    "Archaeological emphasis on Buddhist stupas",
    "Parallel drawn with Constantine's Christian conversion",
    "Selective reading of edicts emphasizing Buddhist themes"
  ],
  scholars: [
    "James Prinsep (edict decipherment, 1830s)",
    "Vincent Smith (early colonial historians)",
    "European Indologists seeking Christian parallels"
  ]
};

const postcolonialInterpretation: Interpretation = {
  title: "Post-Colonial Reassessment",
  period: "Late 20th Century–Present",
  keyPoints: [
    "Ashoka as pragmatic statesman, not religious convert",
    "Dhamma as inclusive ethical framework, not Buddhist doctrine",
    "Continuity with Mauryan pluralism (Chandragupta, Bindusāra)",
    "Product of Magadha's Śramaṇa-dominated environment"
  ],
  evidence: [
    "Rock Edict XII explicitly promotes religious tolerance",
    "Funding of Brahmins and Ājīvikas alongside Buddhists",
    "Use of 'dhamma' (broad ethics) not 'bauddha' (Buddhist)",
    "No suppression of non-Buddhist sects",
    "Historical context of 300+ years of Śramaṇa dominance in Magadha"
  ],
  scholars: [
    "Romila Thapar (Aśoka and the Decline of the Mauryas, 1961)",
    "Johannes Bronkhorst (Greater Magadha, 2007)",
    "Modern post-colonial historians"
  ]
};

export const ScholarlyDebatePanel: React.FC = () => {
  const [expandedLeft, setExpandedLeft] = useState(false);
  const [expandedRight, setExpandedRight] = useState(false);

  const InterpretationCard = ({ 
    data, 
    expanded, 
    setExpanded, 
    gradient 
  }: { 
    data: Interpretation; 
    expanded: boolean; 
    setExpanded: (val: boolean) => void;
    gradient: string;
  }) => (
    <div className="flex-1">
      <div className={`h-full rounded-lg border-2 border-burgundy/30 bg-gradient-to-br ${gradient} p-6 shadow-lg`}>
        <div className="mb-4">
          <h3 className="text-xl font-serif font-bold text-burgundy mb-1">
            {data.title}
          </h3>
          <p className="text-sm text-muted-foreground italic">{data.period}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
              <span className="text-saffron">§</span> Key Interpretations:
            </h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {data.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-burgundy font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-between"
          >
            <span>Show {expanded ? 'Less' : 'Evidence & Scholars'}</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {expanded && (
            <div className="space-y-3 pt-3 border-t border-burgundy/20 animate-in slide-in-from-top-2">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Evidence Base:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {data.evidence.map((point, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-burgundy">→</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Key Scholars:</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {data.scholars.map((scholar, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ocean">◆</span>
                      <span>{scholar}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="my-8 border-burgundy/20 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-burgundy">
          <span className="text-2xl">⚖️</span>
          Scholarly Debate: Colonial vs. Post-Colonial Interpretations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6">
          <InterpretationCard
            data={colonialInterpretation}
            expanded={expandedLeft}
            setExpanded={setExpandedLeft}
            gradient="from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
          />

          {/* Divider with arrow */}
          <div className="flex items-center justify-center lg:flex-col">
            <div className="hidden lg:block h-full w-px bg-gradient-to-b from-transparent via-burgundy/50 to-transparent" />
            <div className="lg:hidden w-full h-px bg-gradient-to-r from-transparent via-burgundy/50 to-transparent" />
            <div className="absolute bg-background px-3 py-1 rounded-full border-2 border-burgundy/30 text-burgundy font-bold text-sm shadow-md">
              VS
            </div>
          </div>

          <InterpretationCard
            data={postcolonialInterpretation}
            expanded={expandedRight}
            setExpanded={setExpandedRight}
            gradient="from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-burgundy/20">
          <p className="text-sm text-muted-foreground italic">
            <strong className="text-foreground">Critical Assessment:</strong> The shift from colonial to post-colonial interpretation represents a move away from European-centric frameworks (Constantine parallel) toward understanding Ashoka within his actual historical context: a Magadhan ruler emerging from three centuries of Śramaṇa dominance, whose dhamma represented sophisticated statecraft rather than religious conversion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
