import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, BookOpen } from 'lucide-react';

interface Source {
  citation: string;
  confidence: 'H' | 'M' | 'L';
  note?: string;
  link?: string;
}

interface BibliographySection {
  title: string;
  description: string;
  sources: Source[];
}

const bibliographyData: BibliographySection[] = [
  {
    title: "Archaeological Sources",
    description: "Primary archaeological evidence from excavations and surveys",
    sources: [
      {
        citation: "Possehl, Gregory L. The Indus Civilization: A Contemporary Perspective. AltaMira Press, 2002.",
        confidence: "H",
        note: "Comprehensive archaeological overview of Indus-Saraswati Civilization"
      },
      {
        citation: "Stein, Aurel. Archaeological Reconnaissances in North-Western India and South-Eastern Īrān. Macmillan, 1937.",
        confidence: "H",
        note: "Early archaeological mapping of Indo-Iranian cultural zones"
      },
      {
        citation: "Wilhelm, Gernot. The Hurrians. Aris & Phillips, 1989.",
        confidence: "H",
        note: "Standard reference on Hurrian-Mitanni archaeological contexts"
      },
      {
        citation: "Pfälzner, Peter, et al. \"Reviving Wasukanni: The Identification of a Royal City.\" Antiquity, vol. 93, no. 371, 2019, pp. 1237-1254.",
        confidence: "H",
        note: "Recent discovery of Mitanni palace at Kemune, Iraqi Kurdistan"
      }
    ]
  },
  {
    title: "Linguistic Sources",
    description: "Primary texts and linguistic analyses of Vedic, Avestan, and Mitanni corpora",
    sources: [
      {
        citation: "Jamison, Stephanie W., and Joel P. Brereton, translators. The Rigveda: The Earliest Religious Poetry of India. 3 vols., Oxford University Press, 2014.",
        confidence: "H",
        note: "Standard modern translation of the Rigveda with extensive philological notes"
      },
      {
        citation: "Insler, Stanley, translator. The Gāthās of Zarathustra. E. J. Brill, 1975.",
        confidence: "H",
        note: "Critical edition and translation of Zarathustra's hymns"
      },
      {
        citation: "Thieme, Paul. \"The 'Aryan' Gods of the Mitanni Treaties.\" Journal of the American Oriental Society, vol. 80, no. 4, 1960, pp. 301-317.",
        confidence: "H",
        note: "Seminal analysis of Indo-Aryan divine names in Hittite-Mitanni treaty",
        link: "https://www.jstor.org/stable/595878"
      },
      {
        citation: "Kammenhuber, Annelies. Hippologia Hethitica. Otto Harrassowitz, 1961.",
        confidence: "H",
        note: "Detailed philological study of Kikkuli horse training manual"
      },
      {
        citation: "Mayrhofer, Manfred. Etymologisches Wörterbuch des Altindoarischen. 3 vols., Universitätsverlag C. Winter, 1992-2001.",
        confidence: "H",
        note: "Comprehensive etymological dictionary of Old Indo-Aryan"
      },
      {
        citation: "Caland, Willem, translator. Das Śrautasūtra des Baudhāyana. 3 vols., Königlichen Gesellschaft der Wissenschaften zu Göttingen, 1903-1928.",
        confidence: "M",
        note: "Early German translation of Baudhayana Shrautasutra; contested interpretation"
      }
    ]
  },
  {
    title: "Historical & Comparative Sources",
    description: "Classical sources and comparative studies",
    sources: [
      {
        citation: "Herodotus. The Histories. Translated by Robin Waterfield, Oxford University Press, 1998.",
        confidence: "M",
        note: "Greek account of Persian origins (5th century BCE); secondhand information"
      },
      {
        citation: "Moran, William L., editor and translator. The Amarna Letters. Johns Hopkins University Press, 1992.",
        confidence: "H",
        note: "Diplomatic correspondence including Mitanni-Egyptian relations"
      },
      {
        citation: "Boyce, Mary. A History of Zoroastrianism. 3 vols., Brill, 1975-1991.",
        confidence: "H",
        note: "Standard comprehensive history of Zoroastrianism"
      },
      {
        citation: "Puhvel, Jaan. Comparative Mythology. Johns Hopkins University Press, 1987.",
        confidence: "H",
        note: "Systematic comparison of Indo-European mythological traditions"
      }
    ]
  },
  {
    title: "Modern Scholarship",
    description: "Contemporary academic debates on Indo-Iranian origins",
    sources: [
      {
        citation: "Bryant, Edwin. The Quest for the Origins of Vedic Culture: The Indo-Aryan Migration Debate. Oxford University Press, 2001.",
        confidence: "H",
        note: "Balanced overview of competing theories on Indo-Aryan origins"
      },
      {
        citation: "Witzel, Michael. \"Autochthonous Aryans? The Evidence from Old Indian and Iranian Texts.\" Electronic Journal of Vedic Studies, vol. 7, no. 3, 2001, pp. 1-115.",
        confidence: "M",
        note: "Strong critique of Out of India theory from linguistic evidence",
        link: "https://ejvs.laurasianacademy.com/ejvs0703/ejvs0703article.pdf"
      },
      {
        citation: "Talageri, Shrikant G. The Rigveda: A Historical Analysis. Aditya Prakashan, 2000.",
        confidence: "L",
        note: "Proponent of Out of India theory; methodology contested by mainstream scholars"
      },
      {
        citation: "Kazanas, Nicholas. \"Indo-European Deities and the Rigveda.\" Journal of Indo-European Studies, vol. 29, no. 3-4, 2001, pp. 257-293.",
        confidence: "M",
        note: "Argues for Indian homeland based on comparative mythology"
      },
      {
        citation: "Elst, Koenraad. Update on the Aryan Invasion Debate. Aditya Prakashan, 1999.",
        confidence: "L",
        note: "Critique of Aryan invasion theory; non-academic publisher"
      },
      {
        citation: "Lal, B. B. The Rigvedic People: 'Invaders'?/'Immigrants'? or Indigenous? Evidence of Archaeology and Literature. Aryan Books International, 2015.",
        confidence: "M",
        note: "Archaeological arguments for indigenous development"
      },
      {
        citation: "Kuz'mina, Elena E. The Origin of the Indo-Iranians. Edited by J. P. Mallory, Brill, 2007.",
        confidence: "H",
        note: "Standard archaeological argument for Central Asian homeland"
      },
      {
        citation: "Mallory, J. P. In Search of the Indo-Europeans: Language, Archaeology and Myth. Thames & Hudson, 1989.",
        confidence: "H",
        note: "Classic synthesis of Indo-European origins research"
      },
      {
        citation: "Hock, Hans Henrich. \"Out of India? The Linguistic Evidence.\" Aryan and Non-Aryan in South Asia: Evidence, Interpretation and Ideology, edited by Johannes Bronkhorst and Madhav M. Deshpande, Harvard University Press, 1999, pp. 1-18.",
        confidence: "H",
        note: "Linguistic critique of Out of India hypothesis"
      },
      {
        citation: "Frawley, David. \"The Myth of the Aryan Invasion of India.\" Voice of India, 1994.",
        confidence: "L",
        note: "Popular critique of Aryan invasion theory; lacks peer review"
      },
      {
        citation: "Beckwith, Christopher I. Empires of the Silk Road: A History of Central Eurasia from the Bronze Age to the Present. Princeton University Press, 2009.",
        confidence: "H",
        note: "Context for Central Asian cultural dynamics"
      },
      {
        citation: "Bronkhorst, Johannes. Greater Magadha: Studies in the Culture of Early India. Brill, 2007.",
        confidence: "H",
        note: "Important for understanding regional Indian cultural variations"
      }
    ]
  }
];

const confidenceLabels = {
  H: { label: 'High Confidence', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  M: { label: 'Medium Confidence', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  L: { label: 'Low Confidence', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
};

export const AsuraExilesBibliography: React.FC = () => {
  return (
    <Card className="w-full my-8">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Bibliography & Sources</CardTitle>
            <CardDescription>
              Comprehensive reference list with confidence assessments
            </CardDescription>
          </div>
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Confidence Key */}
        <div className="mb-6 p-4 bg-muted/50 rounded-lg">
          <p className="font-semibold mb-3 text-sm">Confidence Levels:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(confidenceLabels).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <Badge className={config.color}>{key}</Badge>
                <span className="text-sm">{config.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Confidence levels indicate source reliability and consensus within academic community, 
            not necessarily agreement with Out of India hypothesis.
          </p>
        </div>

        {/* Bibliography Sections */}
        <Accordion type="multiple" defaultValue={['section-0']} className="space-y-2">
          {bibliographyData.map((section, sectionIndex) => (
            <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:bg-muted/50 rounded-lg">
                <div className="text-left">
                  <div className="font-semibold">{section.title}</div>
                  <div className="text-sm text-muted-foreground">{section.description}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 mt-2">
                  {section.sources.map((source, sourceIndex) => (
                    <div
                      key={sourceIndex}
                      className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Badge className={confidenceLabels[source.confidence].color}>
                          {source.confidence}
                        </Badge>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm leading-relaxed">{source.citation}</p>
                          {source.note && (
                            <p className="text-xs text-muted-foreground italic">
                              <strong>Note:</strong> {source.note}
                            </p>
                          )}
                          {source.link && (
                            <a
                              href={source.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Access source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Methodological Note */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Methodological Transparency:</p>
          <p className="mb-2">
            This article engages with the contested "Out of India" (OIT) hypothesis while acknowledging 
            that it remains a minority position in mainstream Indo-European linguistics. The confidence 
            ratings above reflect the reliability of sources <em>as sources</em>, not endorsement of OIT.
          </p>
          <p className="mb-2">
            <strong>High Confidence (H):</strong> Peer-reviewed academic publications from established scholars 
            or standard reference works, regardless of theoretical position.
          </p>
          <p className="mb-2">
            <strong>Medium Confidence (M):</strong> Academic sources with contested interpretations or 
            secondary sources requiring corroboration.
          </p>
          <p>
            <strong>Low Confidence (L):</strong> Non-peer-reviewed works or those from outside academic 
            consensus; useful for presenting alternative viewpoints but requiring critical evaluation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
