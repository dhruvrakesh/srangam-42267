import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { IconScript } from '@/components/icons';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

const PillarSilhouetteComponent = () => {
  const pillars = Array.from({ length: 7 }, (_, i) => i + 1);
  
  return (
    <div className="space-y-6 p-6 bg-muted/30 rounded-lg">
      <h3 className="font-serif text-lg font-semibold text-foreground">The Seven Yūpa Pillars</h3>
      
      <div className="flex justify-center items-end space-x-4 py-8">
        {pillars.map((pillar) => (
          <div key={pillar} className="flex flex-col items-center space-y-2">
            <div 
              className="w-8 bg-gradient-to-t from-stone to-stone/70 rounded-t-sm"
              style={{ height: `${60 + Math.random() * 40}px` }}
            >
              <div className="w-full h-full flex flex-col justify-center items-center text-xs text-stone-content opacity-80">
                <div className="writing-mode-vertical text-center">
                  <div className="rotate-90 transform origin-center">sanskrit</div>
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">#{pillar}</span>
          </div>
        ))}
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-semibold text-foreground mb-2">Ritual Context</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Vedic sacrifice posts (yūpa)</li>
            <li>• Royal patronage markers</li>
            <li>• Sanskrit prashasti verse</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-2">Script Features</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Early southern Brahmic</li>
            <li>• Pallava/Grantha influence</li>
            <li>• 5th century CE dating</li>
          </ul>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground italic">
        Found at Muara Kaman, East Kalimantan. These Sanskrit inscriptions represent 
        some of the earliest evidence of Indic ritual culture in Borneo.
      </p>
    </div>
  );
};

const content = `Seven **yūpa** pillars at Kutai (East Kalimantan) bear **Sanskrit** inscriptions cut in early southern Brahmic forms often grouped with **Pallava/Grantha**. They praise donors, ritual acts, and lineages—the same genres known from the subcontinent, adapted to local courts.

## Why a yūpa matters

A yūpa is not generic stone: it's a **sacrificial post**. To raise one abroad is to transplant a ritual grammar—priests, meters, offerings, and royal patronage. Scripts are the tracks; **rituals are the trains**.

## Continuity and change

Language of praise remains Sanskritic; political ecology is Bornean. This combination—old verse, new forest—captures how Indic worlds braided with island Southeast Asia.

> **Why it matters:** The Kutai yūpa inscriptions show us how Sanskrit ritual culture took root far from its homeland, adapting Vedic ceremonial forms to equatorial rainforest kingdoms. They're evidence of cultural translation in action—not mere copying, but creative adaptation.

## The inscribed record

The pillars mention King Mūlavarman and his father Aśvavarman, rulers of the Kutai kingdom. The Sanskrit verses follow classical *prashasti* conventions: genealogy, royal virtues, and ceremonial donations. But the context is unmistakably Bornean—river networks, forest resources, and local political structures.

**Further Reading:** *Early Indonesian Commerce* by Kenneth Hall; *The Indianized States of Southeast Asia* by George Coedès.`;

export default function KutaiYupaBorneo() {
  return (
    <ArticlePage
      title="Rainforest Prashastis: The Kutai Yūpa Inscriptions of Borneo"
      dek="Sanskrit verse and Vedic ritual vocabulary on sacrificial posts at the edge of the equator."
      content={content}
      tags={["Scripts & Inscriptions", "Sanskrit", "SE Asia"]}
      icon={IconScript}
      readTime={8}
      author="Dr. Epigraphic Studies"
      date="2024-03-22"
      dataComponents={[
        <ResponsiveImage 
          key="kutai-hero"
          src="/images/docu_kutai-yupa_dawn_3x2_v1.png"
          alt="Ancient Kutai Yūpa pillar inscription in the rainforest at dawn"
          aspectRatio="landscape"
          caption="One of the seven Kutai Yūpa pillars bearing Sanskrit inscriptions, found at Muara Kaman, East Kalimantan"
          credit="Archaeological Documentation Project"
          className="mb-8"
        />,
        <PillarSilhouetteComponent key="pillar-silhouette" />,
        <div key="related-link" className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-2">Explore Further</h3>
          <p className="text-muted-foreground text-sm mb-4">
            See the Kutai Yūpa inscriptions alongside other examples of ancient scripts and trade networks.
          </p>
          <Link to="/batch/muziris-kutai-ashoka">
            <Button variant="default">
              View Scripts, Trade & Empire Collection
            </Button>
          </Link>
        </div>
      ]}
    />
  );
}