import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TextualSource {
  title: string;
  text: string;
  citation?: string;
  significance?: string;
}

interface SourceCategory {
  [key: string]: TextualSource[];
}

interface InteractiveTextualSourcesProps {
  title?: string;
  className?: string;
}

const textualSourcesData: SourceCategory = {
  "Mahabharata": [
    {
      title: "Sahadeva's Southern Conquests",
      text: "In the Sabha Parva, Sahadeva's southern campaign (dakṣiṇā dig-vijaya) systematically lists the kingdoms he conquered, including the Pāṇḍyas, Cōḻas, and Kēraḷas, demonstrating intimate geographical knowledge of the Dakṣiṇāpatha.",
      citation: "Mahābhārata 2.30.7-18 (Critical Edition)",
      significance: "Reveals detailed political geography of South India contemporary to the epic's composition."
    },
    {
      title: "Tīrthayātrā Parva Geography",
      text: "The pilgrimage routes described in the Vana Parva map sacred sites across Jambudvīpa, including southern tīrthas like Kanyākumārī, Śrīraṅgam, and Rāmēśvaram, binding the subcontinent through sacred geography.",
      citation: "Mahābhārata 3.80-153 (Tīrthayātrā Parvan)",
      significance: "Establishes a unified sacred landscape connecting north and south through pilgrimage networks."
    },
    {
      title: "River Hymns and Southern Waters",
      text: "The epic's river eulogies mention southern rivers like Kāvērī, Tāmraparṇī, and Kṛtamālā (Vaigai) alongside northern rivers like Gaṅgā and Yamunā, indicating comprehensive geographical consciousness.",
      citation: "Mahābhārata 6.10.13-35 (Bhīṣma Parva)",
      significance: "Demonstrates unified hydrographic knowledge spanning the entire subcontinent."
    }
  ],
  "Puranas": [
    {
      title: "Matsya Purāṇa's Janapada Lists",
      text: "Contains systematic catalogues of janapadas (territories) across Bhārata, including detailed lists of southern kingdoms like Pāṇḍya, Cōḻa, Kēraḷa, and Karṇāṭaka, reflecting comprehensive political geography.",
      citation: "Matsya Purāṇa 114.10-44",
      significance: "Provides administrative and political framework encompassing the entire subcontinent."
    },
    {
      title: "Agastya's Symbolic Journey",
      text: "The recurring narrative of sage Agastya's migration across the Vindhyas to establish āśramas in the south symbolizes cultural and Vedic integration, representing the unity of Brahmanic tradition across regional boundaries.",
      citation: "Multiple Purāṇas (Vāyu, Brahmāṇḍa, Skanda)",
      significance: "Mythologically encodes the cultural synthesis between northern and southern Bhārata."
    },
    {
      title: "Skanda Purāṇa's Southern Māhātmyas",
      text: "Extensive sections dedicated to southern sacred sites, particularly in Tamil country, weave them into the broader Purāṇic cosmology, including detailed māhātmyas of Madurai, Chidambaram, and Kāñcī.",
      citation: "Skanda Purāṇa, Kāśī Khaṇḍa and Tamil Māhātmyas",
      significance: "Integrates Tamil sacred geography into pan-Indian Purāṇic tradition."
    }
  ],
  "Sangam Literature": [
    {
      title: "Puṟanāṉūṟu's Political Networks",
      text: "These poems describe the 'three crowned kings' (mūventar) and their diplomatic and military interactions with northern powers, including references to Mauryan incursions and Nanda sovereignty.",
      citation: "Puṟanāṉūṟu 15, 175, 224",
      significance: "Documents active political engagement between Tamil kingdoms and northern empires."
    },
    {
      title: "Maduraikāñci's Cosmopolitan Vision",
      text: "Provides vivid descriptions of Madurai as a bustling international city with markets filled with goods from the Gaṅgā plains, horses from Sindhu country, and merchants from diverse regions.",
      citation: "Maduraikāñci, lines 590-635",
      significance: "Illustrates the cosmopolitan nature of Tamil urban centers and their integration with pan-Indian trade."
    },
    {
      title: "Paṭṭiṉappālai's Maritime Connections", 
      text: "Describes the port city of Puhār (Kāvērippaṭṭiṇam) and its extensive maritime trade, mentioning northern horses, western pepper, and gems from southern seas, alongside Roman wine and Chinese silk.",
      citation: "Paṭṭiṉappālai, lines 190-220",
      significance: "Documents the international trade networks centered in Tamil ports, connecting to both Indian and foreign markets."
    }
  ]
};

export const InteractiveTextualSources: React.FC<InteractiveTextualSourcesProps> = ({
  title = "The Textual Tapestry",
  className = ""
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("Mahabharata");
  const sources = Object.keys(textualSourcesData);

  return (
    <div className={`py-16 ${className}`}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ancient literature preserves detailed geographical knowledge that reveals a unified, 
            well-explored subcontinent. Filter the excerpts by source to explore this rich textual heritage.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="text-center mb-8">
          <div className="inline-flex rounded-lg border border-border shadow-sm" role="group">
            {sources.map((source) => (
              <Button
                key={source}
                variant={activeFilter === source ? "default" : "ghost"}
                className={`
                  px-6 py-2 text-sm font-medium transition-all
                  ${activeFilter === source 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                  first:rounded-l-lg last:rounded-r-lg border-0
                `}
                onClick={() => setActiveFilter(source)}
              >
                {source}
              </Button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {textualSourcesData[activeFilter]?.map((item, index) => (
            <Card 
              key={`${activeFilter}-${index}`}
              className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 
                         border-l-4 border-l-accent group animate-fade-in"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {activeFilter}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <p className="text-muted-foreground leading-relaxed mb-4 flex-grow">
                  {item.text}
                </p>
                
                {item.citation && (
                  <div className="mt-auto pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground/80 italic">
                      <strong>Source:</strong> {item.citation}
                    </p>
                  </div>
                )}
                
                {item.significance && (
                  <div className="mt-2 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-foreground/80">
                      <strong>Significance:</strong> {item.significance}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto">
            <strong>Methodology:</strong> These textual excerpts are drawn from critical editions and 
            scholarly translations. The geographical and political details they contain demonstrate 
            the composers' intimate familiarity with the entire subcontinent, challenging narratives 
            of cultural fragmentation.
          </p>
        </div>
      </div>
    </div>
  );
};