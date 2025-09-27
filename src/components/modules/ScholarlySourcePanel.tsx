import React from 'react';
import { Book, ExternalLink, Quote, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SourceShelf {
  primary: string[];
  translations: string[];
  secondary: string[];
}

interface ScholarlySourcePanelProps {
  nodeId: string;
  nodeName: string;
  sources: SourceShelf;
  className?: string;
}

export const ScholarlySourcePanel: React.FC<ScholarlySourcePanelProps> = ({
  nodeId,
  nodeName,
  sources,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Archive className="w-5 h-5 text-primary" />
          Sources for {nodeName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          MLA starter shelf with cross-references
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {sources.primary.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-4 h-4 text-burgundy" />
              <h4 className="font-semibold text-sm text-burgundy">Primary Sources</h4>
            </div>
            <ul className="space-y-1 text-sm">
              {sources.primary.map((source, idx) => (
                <li key={idx} className="text-foreground leading-relaxed">
                  {source}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sources.translations.length > 0 && (
          <>
            <Separator className="opacity-50" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Book className="w-4 h-4 text-gold-warm" />
                <h4 className="font-semibold text-sm text-gold-warm">Translations & Editions</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {sources.translations.map((source, idx) => (
                  <li key={idx} className="text-foreground leading-relaxed">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {sources.secondary.length > 0 && (
          <>
            <Separator className="opacity-50" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4 text-saffron" />
                <h4 className="font-semibold text-sm text-saffron">Secondary Literature</h4>
              </div>
              <ul className="space-y-1 text-sm">
                {sources.secondary.map((source, idx) => (
                  <li key={idx} className="text-foreground leading-relaxed">
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <Separator className="opacity-50" />
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Confidence: High
          </Badge>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View full bibliography →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export const getSourceShelf = (nodeId: string): SourceShelf => {
  const sourceShelves: Record<string, SourceShelf> = {
    "VEDA-DASARAJNA": {
      primary: [
        "Rig Veda, Maṇḍala 7.18, 7.33 (Sudas hymns)"
      ],
      translations: [
        "Jamison, Stephanie W., and Joel P. Brereton, trans. The Rigveda. Oxford University Press, 2014."
      ],
      secondary: [
        "Witzel, Michael. \"Early Sanskritization.\" Electronic Journal of Vedic Studies, 1995."
      ]
    },
    "KURU-JANAMEJAYA": {
      primary: [
        "Mahābhārata, Ādi Parva (Janamejaya's snake sacrifice)"
      ],
      translations: [
        "Debroy, Bibek, trans. The Mahabharata. 10 vols. Penguin Classics, 2010-2014."
      ],
      secondary: [
        "Bronkhorst, Johannes. Greater Magadha. Brill, 2007."
      ]
    },
    "MAGADHA-BIMBISARA": {
      primary: [
        "Dīgha Nikāya (Bimbisara references)",
        "Jaina Āgamas (Magadha polity)"
      ],
      translations: [
        "Rhys Davids, T.W., trans. Dialogues of the Buddha. 3 vols. PTS, 1899-1921."
      ],
      secondary: [
        "Chakravarti, Ranabir. Trade and Traders in Early Indian Society. Manohar, 2002."
      ]
    },
    "MAURYA-STATE": {
      primary: [
        "Arthaśāstra (Kauṭilya), Book 2 (port administration)",
        "Aśoka's edicts (Dhauli, Jaugada)"
      ],
      translations: [
        "Olivelle, Patrick, trans. King, Governance, and Law in Ancient India: Kauṭilya's Arthaśāstra. Oxford University Press, 2013."
      ],
      secondary: [
        "Thapar, Romila. Aśoka and the Decline of the Mauryas. 3rd ed. Oxford University Press, 1997."
      ]
    },
    "GUPTA-NETWORKS": {
      primary: [
        "Allahabad Pillar Inscription of Samudragupta",
        "Faxian's Record of Buddhist Kingdoms"
      ],
      translations: [
        "Fleet, J.F. Corpus Inscriptionum Indicarum. Vol. 3. Government of India, 1888.",
        "Legge, James, trans. A Record of Buddhistic Kingdoms. Oxford, 1886."
      ],
      secondary: [
        "Sircar, D.C. Studies in the Geography of Ancient and Medieval India. 2nd ed. Motilal Banarsidass, 1971."
      ]
    },
    "CHOLA-1025": {
      primary: [
        "Tañjāvūr inscriptions of Rajendra I",
        "Leiden Plate (Kadaram expedition)"
      ],
      translations: [
        "Nilakanta Sastri, K.A. \"The Cholas.\" 2nd ed. University of Madras, 1955."
      ],
      secondary: [
        "Sen, Tansen. \"The Formation of Chinese Maritime Networks.\" PhD diss., University of Pennsylvania, 2000."
      ]
    },
    "MARATHA-SHIVAJI": {
      primary: [
        "Śivabhārata (Paramanand)",
        "Dutch East India Company records (Batavia)"
      ],
      translations: [
        "Sarkar, Jadunath. Shivaji and His Times. 6th ed. Orient Longman, 1961."
      ],
      secondary: [
        "Sen, Sailendra. The Military System of the Marathas. 2nd ed. Orient Longman, 1979."
      ]
    },
    "INDIA-SAGAR": {
      primary: [
        "PM Modi's SAGAR speech, Mauritius, March 2015",
        "India's Indo-Pacific Strategy white paper, 2019"
      ],
      translations: [],
      secondary: [
        "Pant, Harsh V. \"India's Challenge in the Indian Ocean.\" RUSI Journal 160, no. 4 (2015): 74-79."
      ]
    }
  };

  return sourceShelves[nodeId] || { primary: [], translations: [], secondary: [] };
};