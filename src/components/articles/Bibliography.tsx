import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BibliographyEntry {
  author: string;
  title: string;
  publication: string;
  year: string;
  type: 'book' | 'article' | 'primary' | 'digital';
  url?: string;
  description: string;
}

const bibliographyEntries: BibliographyEntry[] = [
  {
    author: "Dalrymple, William",
    title: "The Golden Road: How Ancient India Transformed the World",
    publication: "Bloomsbury",
    year: "2024",
    type: "book",
    description: "Insights on India's global trade and cultural influence"
  },
  {
    author: "Nilakanta Sastri, K. A.",
    title: "A History of South India from Prehistoric Times to the Fall of Vijayanagar",
    publication: "Oxford University Press",
    year: "1975",
    type: "book",
    description: "Detailed account of Sangam era trade, ports like Muziris, and Indo-Roman commerce"
  },
  {
    author: "Sanyal, Sanjeev",
    title: "The Ocean of Churn: How the Indian Ocean Shaped Human History",
    publication: "Penguin Random House India",
    year: "2016",
    type: "book",
    description: "Discussion of Indian Ocean trade dynamics; analysis of Muziris Papyrus and Roman revenue"
  },
  {
    author: "Anonymous",
    title: "Periplus Maris Erythraei",
    publication: "Translated by Lionel Casson, Wayne State University Press",
    year: "1st Century CE",
    type: "primary",
    description: "1st-century CE Greek travelogue detailing South Indian ports and exports, e.g. pepper and malabathrum"
  },
  {
    author: "Pliny the Elder",
    title: "Natural History (Books 12–14)",
    publication: "Translated by H. Rackham, Loeb Classical Library",
    year: "1st Century CE",
    type: "primary",
    description: "Roman perspective on pepper and luxury trade; complains of Rome's gold drain to India"
  },
  {
    author: "Sidebotham, Steven E.",
    title: "Berenike: Archaeological Findings in an Ancient Red Sea Port",
    publication: "Journal of Roman Archaeology",
    year: "2004",
    type: "article",
    description: "Discoveries of Indian pepper, teak, and other goods in Berenike, illustrating Indo-Roman maritime trade"
  },
  {
    author: "Mahavankudy, J. J.",
    title: "Red Sea Trade and the Importance of Muziris",
    publication: "Journal of South Asian Studies",
    year: "2015",
    type: "article",
    description: "Academic article analyzing Muziris' pivotal role and the Muziris Papyrus data on cargo values"
  },
  {
    author: "Varnam Blog",
    title: "Maritime Spice Route",
    publication: "varnam.org",
    year: "2004",
    type: "digital",
    url: "https://varnam.org",
    description: "Archaeological evidence of Indo-Egyptian trade: pepper at Berenike, Indian artifacts in Roman Egypt"
  }
];

const typeLabels = {
  book: "Book",
  article: "Academic Article", 
  primary: "Primary Source",
  digital: "Digital Resource"
};

const typeColors = {
  book: "bg-burgundy/10 text-burgundy border-burgundy/20",
  article: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  primary: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  digital: "bg-purple-500/10 text-purple-600 border-purple-500/20"
};

export function Bibliography() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4 border-t border-border pt-8 mt-12">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-foreground">
          Bibliography & Sources
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          {isExpanded ? (
            <>
              Hide Sources <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show Sources <ChevronDown size={16} />
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This article draws from a diverse range of sources including classical primary texts, 
            modern academic scholarship, and archaeological evidence to present a comprehensive 
            view of ancient Indo-Roman pepper trade.
          </p>

          <div className="grid gap-4">
            {bibliographyEntries.map((entry, index) => (
              <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {entry.author} ({entry.year})
                    </p>
                    <p className="text-sm text-foreground italic">
                      {entry.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.publication}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded border ${typeColors[entry.type]}`}>
                      {typeLabels[entry.type]}
                    </span>
                    {entry.url && (
                      <a 
                        href={entry.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {entry.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <strong>Citation Style:</strong> This bibliography follows academic conventions with 
            additional contextual descriptions to help readers understand each source's contribution 
            to our understanding of ancient Indian Ocean trade.
          </div>
        </div>
      )}
    </div>
  );
}