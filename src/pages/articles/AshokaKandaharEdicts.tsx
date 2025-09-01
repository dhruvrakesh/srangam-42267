import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconEdict } from '@/components/icons';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

const content = `At **Kandahar**, Ashoka's edicts appear in **Greek and Aramaic**. The choice is policy: to speak beyond borders using the words that neighboring communities read in court and market.

## What the stones do

- Project a **moral program** (dhamma) legible across languages.  
- Confirm the Mauryan state's habit of translating governance.  
- Tie India's northwest to the Hellenistic epigraphic sphere.

## The craft of communication

These are not clumsy transliterations. They are **literary** moves—register, cadence, and familiar formulae—aimed at genuine comprehension.

**Why it matters:** When imperial India reached outward, it reached in **others' languages**, too—an early lesson in multilingual statecraft.`;

const BilingualEdictComponent = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">Kandahar Bilingual Edict</h3>
    <div className="bg-white p-6 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Greek text section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Greek Text</h4>
          <div className="bg-sand/20 p-4 rounded font-mono text-sm">
            <div className="text-laterite">ΒΑΣΙΛΕΥΣ ΠΙΟΔΑΣΣΗΣ</div>
            <div className="text-laterite">ΕΥΣΕΒΕΙΑΣ ΧΑΡΙΝ</div>
            <div className="text-muted-foreground mt-2">
              [King Piodasses for the sake of piety...]
            </div>
          </div>
        </div>
        
        {/* Aramaic text section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Aramaic Text</h4>
          <div className="bg-sand/20 p-4 rounded font-mono text-sm" dir="rtl">
            <div className="text-laterite">מלכא פריודרש</div>
            <div className="text-laterite">חסיד צדיק</div>
            <div className="text-muted-foreground mt-2" dir="ltr">
              [King Priyadarshi, the pious righteous one...]
            </div>
          </div>
        </div>
      </div>
      
      {/* Translation strategy */}
      <div className="border-t pt-4">
        <h4 className="font-semibold text-foreground mb-2">Translation Strategy</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-foreground">Names</div>
            <div className="text-muted-foreground">Ashoka → Piodasses (Greek)<br/>→ Priyadarshi (Aramaic)</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-foreground">Concepts</div>
            <div className="text-muted-foreground">Dhamma → Eusebeia (piety)<br/>→ Qshyt' (truth/righteousness)</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-foreground">Register</div>
            <div className="text-muted-foreground">Royal proclamation<br/>formulae in both traditions</div>
          </div>
        </div>
      </div>
    </div>
    <p className="text-sm text-muted-foreground">
      The Kandahar edicts demonstrate sophisticated multilingual governance, adapting Mauryan 
      imperial concepts to Hellenistic and Persian administrative traditions.
    </p>
  </div>
);

export default function AshokaKandaharEdicts() {
  return (
    <ArticlePage
      title="Stones that Speak: Ashoka's Greek and Aramaic at Kandahar"
      dek="Imperial ethics in multiple languages at a cultural crossroads."
      content={content}
      tags={["Ancient India", "Edicts", "Hellenistic Links"]}
      icon={IconEdict}
      readTime={5}
      author="Dr. Epigraphy Specialist"
      date="2024-03-18"
      dataComponents={[
        <ResponsiveImage 
          key="kandahar-hero"
          src="/images/macro_ashoka-kandahar_raking_3x2_v1.png"
          alt="Close-up view of the bilingual Ashoka edict at Kandahar showing Greek and Aramaic scripts"
          aspectRatio="landscape"
          caption="Detail of Ashoka's bilingual edict at Kandahar, showing the sophisticated multilingual governance of the Mauryan empire"
          credit="Epigraphic Survey Archive"
          className="mb-8"
        />,
        <BilingualEdictComponent key="bilingual-edict" />
      ]}
    />
  );
}