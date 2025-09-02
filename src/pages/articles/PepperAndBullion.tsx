import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort } from '@/components/icons';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';
import { TradeTimeline } from '@/components/articles/TradeTimeline';
import { Bibliography } from '@/components/articles/Bibliography';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// Import generated images
import romanAmphora from '@/assets/roman-amphora_archaeology_4x3_v1.jpg';
import romanCoins from '@/assets/roman-coins_numismatics_3x2_v1.jpg';
import monsoonRoutes from '@/assets/monsoon-routes_historical-map_16x9_v1.jpg';
import berenikeArtifacts from '@/assets/berenike-artifacts_archaeology_4x3_v1.jpg';

const content = `India's maritime trade in antiquity was legendary, forging links across oceans long before the age of European exploration. Central to this vast exchange was the humble peppercorn – the "black gold" that drew traders to India's shores for centuries. From the fabled port of Muziris on India's southwest coast, fleets laden with spices set sail across the Arabian Sea, binding South India with the Roman world in a thriving commerce.

> **Easter Egg:** Around 1300 BCE, Egyptians mummified the pharaoh Ramesses II with peppercorns in his nostrils – a hint that Indian pepper had made its way to the Nile far earlier than one might imagine. Such tantalizing facts remind us just how old and far-reaching India's spice connections were.

## Muziris: India's Gateway to the West

On the Malabar Coast of South India lay **Muziris**, the most celebrated port of its age. Described in Tamil Sangam literature and identified by Greek and Roman accounts, Muziris was the doorway through which pepper and other spices flowed out to the West. According to the *Periplus of the Erythraean Sea*, Muziris "abounded in ships sent there with cargoes from Arabia and by the Greeks."

Large Roman vessels would arrive bearing gold and wine, and depart "laden with pepper and the rare products of the sea and mountain" of India. The author remarks that while not all items were shipped in huge quantities, pepper was produced in quantity in only one region – the "Cottonara" district of Kerala – making Muziris indispensable for anyone seeking this spice.

**Archaeological Evidence:** Excavations at Pattanam (likely ancient Muziris) have unearthed Roman amphorae, coins, beads, and even a massive hoard of Roman copper coins, underscoring a robust foreign presence.

## Pepper: "Black Gold" and Economic Powerhouse

Why was pepper so special that it spurred a transoceanic trade boom? In antiquity, pepper was much more than a kitchen spice – it was a luxury, a medicine, a status symbol, even a unit of wealth. Native to India's Western Ghats, black pepper (*Piper nigrum*) became one of the most sought-after commodities in the Roman Empire.

The Elder Pliny, writing in the 1st century CE, famously complained that India was "the sink of the world's most precious metals," absorbing Roman gold in exchange for "wares we cannot do without." He calculated that the empire was sending at least 50 million sesterces annually to India – a huge sum.

**Economic Impact:**
- Pepper's value earned it the nickname "Black Gold"
- In 408 CE, Visigothic king Alaric demanded 3,000 pounds of pepper as part of Rome's ransom
- Custom duties on Indo-Roman spice trade contributed up to one-third of the Roman Empire's revenue in the 1st century CE
- Hundreds of ships plied the route annually at the trade's zenith

The very discovery of the monsoon wind system by Greek navigator Hippalus was likely driven by the incentive to streamline the spice trade. Before Hippalus, ships hugged the coastline, but he showed that by sailing with the monsoon winds, one could cut straight across the Arabian Sea from Arabia to India.

## Cultural and Economic Exchange

The pepper routes were not just conduits of commerce; they were channels of cultural exchange. Roman writers like Pliny and Ptolemy described Indian ports and products with remarkable accuracy, indicating substantial knowledge of the subcontinent. Tamil Sangam poetry refers to the Yavanas (Greeks/Romans) and their strange ways, marveling at their ships arriving with gold and departing with pepper.

**Cross-Cultural Impact:**
- Roman artisans may have influenced local craft (Indo-Roman mosaics found at Arikamedu)
- Early Christianity likely reached South India via these maritime channels
- Indian merchants carried Buddhism and Hinduism to Southeast Asia by sea
- Indian astronomy absorbed Greek knowledge (Greco-Roman constellation names in Sanskrit texts)

The exchange was truly bidirectional – Indian kings dined off Roman wine while Roman nobles spiced their meats with Indian pepper, creating a proto-globalized world.

## The Legacy of Ancient Trade Networks

India's ancient spice network across the Arabian Sea set the stage for millennia of global trade. When Portuguese explorer Vasco da Gama successfully sailed around Africa to Calicut in the late 15th century, he was retracing, in reverse, the ancient pepper route. The Arab traders' stranglehold on pepper pricing was a major impetus for da Gama's voyage.

For India, the pepper trade enriched port cities and contributed to a thriving oceanic economy long before colonial times. It connected the subcontinent to a wider world, fostering cosmopolitan societies on its coasts. The story of the pepper routes across the Arabian Sea is a potent antidote to the misconception that international trade and globalization began only with European colonialism.

**Modern Context:** In Kerala today, pepper vines still twine around tall trees, and pepper remains a staple crop – a humble reminder of past glory. Villagers may not realize that the pepper in their backyard once perfumed Roman palaces and was fought over by kings and pirates.`;

export default function PepperAndBullion() {
  return (
    <ArticlePage
      title="Pepper and Bullion: The Malabar–Red Sea Circuit"
      dek="Tracing the spice networks across the Arabian Sea that connected ancient India with the Roman world—a story of monsoon winds, merchant empires, and the 'black gold' that changed history."
      content={content}
      tags={["Empires & Exchange", "Malabar", "Roman World", "Maritime Trade", "Ancient Economics"]}
      icon={IconPort}
      readTime={18}
      author="Dr. Maritime Historian"
      date="2024-03-08"
      dataComponents={[
        // Hero image from existing collection
        <ResponsiveImage
          key="hero-image"
          src="/images/flatlay_scripts-that-sailed_4x3_v3.png"
          alt="Ancient trade documents, scripts, and maritime artifacts representing the pepper trade"
          aspectRatio="landscape"
          className="mb-8"
          caption="Ancient documents and artifacts from the Indian Ocean spice trade"
          credit="Srangam Digital Archives"
        />,

        // Muziris section with amphora image
        <div key="muziris-section" className="my-12 space-y-6">
          <ResponsiveImage
            src={romanAmphora}
            alt="Roman amphora and pottery vessels used in ancient trade"
            aspectRatio="landscape"
            caption="Roman amphora similar to those found at Muziris and other Indian Ocean ports"
            credit="Archaeological reconstruction"
          />
          <div className="bg-cream/10 rounded-lg p-6 border border-burgundy/20">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-3">
              The Cosmopolitan Port
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Muziris was truly international. Classical sources speak of "different countries gathered in the ports," 
              indicating a diverse, multi-ethnic population of traders and sailors. Life would have featured a melting 
              pot of languages and customs: Tamil-speaking locals dealing with Greek or Latin-speaking merchants, 
              Arabian and Egyptian sailors bartering in pidgin dialects.
            </p>
          </div>
        </div>,

        // Economic powerhouse section with coins
        <div key="economic-section" className="my-12 space-y-6">
          <ResponsiveImage
            src={romanCoins}
            alt="Ancient Roman gold aureus and denarii coins found in India"
            aspectRatio="portrait"
            caption="Roman aureus and denarii—the 'gold drain' that Pliny complained about"
            credit="Numismatic collection"
          />
          <div className="bg-amber-50/50 rounded-lg p-6 border border-amber-200">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-3">
              Rome's Trade Deficit
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              The archaeological record shows a mass influx of Roman coins into South India during the early centuries CE. 
              Coins of almost every Roman emperor up to Nero have been found in Tamil lands—evidence of the peak 
              period of the pepper trade. Indian museums today hold more Roman coins than any country outside Europe.
            </p>
          </div>
        </div>,

        // Trade timeline component
        <TradeTimeline key="trade-timeline" />,

        // Enhanced cargo data
        <div key="enhanced-cargo" className="my-12">
          <PepperCargoTable />
        </div>,

        // Monsoon routes section
        <div key="monsoon-section" className="my-12 space-y-6">
          <ResponsiveImage
            src={monsoonRoutes}
            alt="Historical map showing monsoon trade routes across the Indian Ocean"
            aspectRatio="video"
            caption="Monsoon wind patterns and trade routes that connected India with the Roman world"
            credit="Historical cartography reconstruction"
          />
          <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-3">
              The Monsoon Discovery
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hippalus's discovery of sailing with monsoon winds was revolutionary. Before this breakthrough, 
              ships hugged coastlines, but direct sailing across the Arabian Sea slashed journey times and 
              increased cargo capacity—turning a seasonal trickle of trade into a flood.
            </p>
          </div>
        </div>,

        // Archaeological evidence section
        <div key="archaeology-section" className="my-12 space-y-6">
          <ResponsiveImage
            src={berenikeArtifacts}
            alt="Archaeological artifacts from Berenike including ancient peppercorns and trade goods"
            aspectRatio="landscape"
            caption="Artifacts from Berenike, Egypt: 7.5kg of preserved Indian peppercorns from the 1st century CE"
            credit="Archaeological excavation"
          />
          <div className="bg-emerald-50/50 rounded-lg p-6 border border-emerald-200">
            <h4 className="font-serif text-lg font-semibold text-foreground mb-3">
              Archaeological Time Capsule
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              In 1999, archaeologists found 7.5 kg of black pepper at Berenike—the largest cache ever from antiquity. 
              These 1st-century CE peppercorns, grown only in South India, were so well-preserved that archaeologists 
              could still catch their aroma—a direct sensory link to voyages two millennia past.
            </p>
          </div>
        </div>,

        // Bibliography component
        <Bibliography key="bibliography" />,

        // Related collection link
        <div key="related-link" className="mt-12 p-6 bg-gradient-to-r from-burgundy/5 to-cream/10 rounded-lg border border-burgundy/20">
          <h3 className="text-lg font-semibold text-foreground mb-2">Explore the Full Trade Network</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Discover the complete Muziris corridor with interactive trade ledgers, route maps, and the broader 
            context of scripts, empires, and cultural exchange across the Indian Ocean world.
          </p>
          <Link to="/batch/muziris-kutai-ashoka">
            <Button variant="default" className="bg-burgundy hover:bg-burgundy-light">
              View Scripts, Trade & Empire Collection
            </Button>
          </Link>
        </div>
      ]}
    />
  );
}