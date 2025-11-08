import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconScript } from '@/components/icons';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { AncientIndiaTimeline } from '@/components/articles/AncientIndiaTimeline';
import { IndoIranianMap } from '@/components/articles/IndoIranianMap';
import { ashokaKandaharEdictsComplete } from '@/data/articles/ashoka-kandahar-edicts-complete';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';


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
  const contentForNarration = typeof ashokaKandaharEdictsComplete.content === 'object' 
    ? (ashokaKandaharEdictsComplete.content.en as string || '')
    : ashokaKandaharEdictsComplete.content;

  return (
    <>
      <ArticlePage
      title={ashokaKandaharEdictsComplete.title}
      dek={ashokaKandaharEdictsComplete.dek}
      content={ashokaKandaharEdictsComplete.content}
      tags={ashokaKandaharEdictsComplete.tags}
      icon={IconScript}
      readTime={18}
      author="Nartiang Foundation"
      date="2024-03-20"
      dataComponents={[
        <ResponsiveImage 
          key="indus-seals"
          src="/images/docu_kutai-yupa_dawn_3x2_v1.png"
          alt="Ancient Indus Valley stamp seals with undeciphered script, representing the earliest written records from the Indian subcontinent"
          aspectRatio="landscape"
          caption="Indus Valley stamp seals (c. 2600-1900 BCE) bearing the earliest written records from South Asia, millennia before Ashoka's edicts"
          credit="Archaeological Survey of India"
          className="mb-8"
        />,
        <AncientIndiaTimeline key="timeline" />,
        <IndoIranianMap key="indo-iranian-map" />,
        <ResponsiveImage 
          key="painted-grey-ware"
          src="/images/flatlay_scripts-that-sailed_4x3_v3.png"
          alt="Painted Grey Ware pottery and iron implements from Kuru-Panchala archaeological sites"
          aspectRatio="square"
          caption="Painted Grey Ware artifacts from Hastinapura and other Kuru-Panchala sites, linking archaeology with epic traditions"
          credit="B.B. Lal Archaeological Collection"
          className="mb-8"
        />,
        <ResponsiveImage 
          key="kandahar-hero"
          src="/images/macro_ashoka-kandahar_raking_3x2_v1.png"
          alt="Close-up view of the bilingual Ashoka edict at Kandahar showing Greek and Aramaic scripts"
          aspectRatio="landscape"
          caption="Ashoka's bilingual edict at Kandahar: culmination of India's ancient tradition of sophisticated multilingual governance"
          credit="Epigraphic Survey Archive"
          className="mb-8"
        />,
        <BilingualEdictComponent key="bilingual-edict" />,
        <div key="cross-reference" className="my-8 p-6 border-t-2 border-burgundy/30 bg-sand/10 rounded-lg">
          <h3 className="text-lg font-serif font-semibold text-burgundy mb-3">
            📚 Related Reading: Religious-Political Context
          </h3>
          <p className="text-muted-foreground mb-4">
            For deeper context on Ashoka's religious-political environment and the Śramaṇa traditions 
            that shaped Mauryan policy, see our companion article:
          </p>
          <a 
            href="/reassessing-ashoka-legacy" 
            className="inline-flex items-center gap-2 text-ocean hover:text-ocean-dark font-medium underline transition-colors"
          >
            <span>→</span>
            <span>Reassessing Ashoka's Legacy: Buddhism, Politics, and Ancient Indian Sects</span>
          </a>
          <p className="text-sm text-muted-foreground mt-3 italic">
            Challenges colonial narratives by examining how Magadha's 300+ years of Śramaṇa 
            dominance shaped Ashoka's pragmatic dhamma statecraft.
          </p>
        </div>
      ]}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="ashoka-kandahar-edicts"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}