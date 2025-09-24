import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconScript } from '@/components/icons';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { AncientIndiaTimeline } from '@/components/articles/AncientIndiaTimeline';
import { IndoIranianMap } from '@/components/articles/IndoIranianMap';
import { ashokaKandaharEdicts } from '@/data/articles/ashoka-kandahar-edicts';

const content = `Long before Emperor Ashoka's 3rd-century BCE rock edicts, the civilization of **Bharat** (India) had already left its mark across a vast geography and timeline. Early urban centers of the **Indus Valley** (2600–1900 BCE) produced the oldest inscriptions in South Asia, with the Indus script appearing on seals, tablets, and pottery. Though still undeciphered, these ancient symbols – found not only in India but even on clay tags in far-off Mesopotamia – attest to extensive trade and cultural contacts **millennia before the Mauryan Empire**.

## The Indus Valley Foundation

The **stamp seals** of the Indus Valley Civilization represent the earliest known written records from the Indian subcontinent. These sophisticated urban centers developed:

- **Complex urban planning** with grid-pattern streets and advanced drainage
- **Standardized weights and measures** across vast distances
- **International trade networks** reaching Mesopotamia and Central Asia
- **Undeciphered script system** appearing on over 4,000 artifacts

Modern research challenges the colonial narrative that India's history began with foreign influences. The continuity from Indus Valley through Vedic to historical periods reveals an unbroken civilizational journey.

## Vedic Connections from India to West Asia

The Vedic age (second to first millennium BCE) forged cultural links spanning from North India to Central Asia and the Near East. The **Baudhāyana Śrautasūtra** preserves accounts of early migrations: *"Ayu went east – his people are the Kuru-Pañchāla and Kāśi-Videha; Amāvasu went west – his people are the Gandhārī, Pārśu and Aratta."*

This suggests that while one branch spread eastward within India, another – the **Parśu** – migrated westward toward Persia. Scholars equate Vedic "Parśu" with the Persians, remembered as distant cousins of the Vedic tribes.

### The Mitanni Connection

By around **1400 BCE**, an Indo-Aryan elite had established itself in Mitanni (northern Mesopotamia). A Hittite-Mitanni treaty invokes the Vedic gods **Mitra, Varuṇa, Indra, and Nāsatya** as divine witnesses. The Mitanni also left treatises on horse training with Sanskrit technical terms like *aika* (one) and *panza* (five).

These findings illustrate that **Indo-Aryan language and ritual ideas had spread well beyond the Subcontinent over 3,300 years ago**. Rather than being isolated, Vedic civilization was part of a greater Indo-Iranian world.

## Kuru, Panchala and the First Indian States

The Indian subcontinent saw the rise of organized states during the late Vedic period. The **Kuru and Panchāla kingdoms**, located in modern Haryana and western Uttar Pradesh, are identified with the **Painted Grey Ware (PGW) culture** (c.1200–600 BCE).

Archaeologist **B. B. Lal's excavations** at Hastinapura (ancient Kuru capital) unearthed PGW pottery and iron implements, correlating material culture with Mahābhārata descriptions. The PGW horizon aligns with the epic's traditional era (~1200–1000 BCE), suggesting the Mahābhārata's core narrative may echo real conflicts.

Notably, a flooding layer at Hastinapura (~800 BCE) corresponds to textual legends of the city's submersion – a striking convergence of archaeology and oral tradition.

## Oral Traditions and Cosmic Time Cycles

India's oral traditions preserve sophisticated **astronomical knowledge**. Ancient Indian sages tracked celestial movements with precision, showing awareness of the **precession of the equinoxes** – a ~25,770-year cycle. The concept of "Yuga" cycles, when interpreted astronomically, amounts to 24,000 years for a full cycle of four ages, remarkably close to the precession period.

The **Rāmāyaṇa** contains descriptions of "sunless and boundless realms" at the extreme north, possibly referencing **Aurora Borealis** phenomena. Such passages suggest expansive geographical knowledge and possible folk-memories of different climatic conditions.

## Ashoka in Context: Multilingual Governance Tradition

Against this deep historical backdrop, Ashoka's **Greek and Aramaic edicts at Kandahar** represent not innovation, but continuation of India's ancient tradition of sophisticated governance and cultural synthesis.

### What the Kandahar Stones Reveal

- **Moral program** (dhamma) rendered legible across linguistic boundaries
- **Literary sophistication** in translation, not mere transliteration  
- **Cultural synthesis** building on millennia of Indo-Iranian connections
- **Administrative continuity** from earlier Vedic and Achaemenid models

When Ashoka's scribes crafted these multilingual proclamations, they drew upon:
- **Vedic traditions** of dharmic governance
- **Achaemenid precedents** of multilingual royal inscriptions
- **Local knowledge** of Greek and Aramaic administrative languages
- **Ancient Indian diplomatic practices** spanning linguistic boundaries

## Reclaiming India's Ancient Narrative

For centuries, India's vast antiquity was downplayed under colonial scholarship. Thomas Macaulay's infamous assertion that "a single shelf of a good European library was worth the whole native literature of India and Arabia" exemplified attitudes that belittled indigenous records.

However, research over the last century has revealed a different picture. **Indian civilization is one of the most continuous on the planet**, with:

- **Urban roots contemporary** to Mesopotamia and Egypt
- **Literary traditions preserving** historical consciousness across 3,000+ years
- **Meticulous chronicles** (itihāsa) and genealogies (purāṇa) 
- **Scientific heritage** in mathematics and astronomy predating many "Western discoveries"

**The legacy of Ashoka is profound, but the legacy of those who came before extends across continents and reaches back to the dawn of urban life** – a heritage that modern scholarship is rediscovering with appropriate awe.`;

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
      title={ashokaKandaharEdicts.title}
      dek={ashokaKandaharEdicts.dek}
      content={ashokaKandaharEdicts.content}
      tags={ashokaKandaharEdicts.tags}
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
        <BilingualEdictComponent key="bilingual-edict" />
      ]}
    />
  );
}