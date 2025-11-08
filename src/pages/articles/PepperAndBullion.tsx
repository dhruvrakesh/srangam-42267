import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort } from '@/components/icons';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';
import { TradeTimeline } from '@/components/articles/TradeTimeline';
import { Bibliography } from '@/components/articles/Bibliography';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

// Import generated images
import romanAmphora from '@/assets/roman-amphora_archaeology_4x3_v1.jpg';
import romanCoins from '@/assets/roman-coins_numismatics_3x2_v1.jpg';
import monsoonRoutes from '@/assets/monsoon-routes_historical-map_16x9_v1.jpg';
import berenikeArtifacts from '@/assets/berenike-artifacts_archaeology_4x3_v1.jpg';
import { pepperAndBullion } from '@/data/articles/pepper-and-bullion';

// Multilingual content is properly loaded from data file - no hardcoded content needed

export default function PepperAndBullion() {
  const contentForNarration = typeof pepperAndBullion.content === 'object' 
    ? (pepperAndBullion.content.en as string || '')
    : pepperAndBullion.content;

  return (
    <>
      <ArticlePage
      title={pepperAndBullion.title}
      dek={pepperAndBullion.dek}
      content={pepperAndBullion.content}
      tags={pepperAndBullion.tags}
      icon={IconPort}
      readTime={18}
      author="Nartiang Foundation"
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
              Ancient Indigenous Navigation
            </h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Indian mariners had utilized monsoon wind patterns for direct ocean crossings centuries before Greek contact. 
              Tamil literature and archaeological evidence from ancient port cities show sophisticated seasonal navigation systems. 
              When Hippalus documented these routes, he was recording existing Indian maritime knowledge—part of a broader 
              pattern where Indigenous expertise was later reframed as European "discovery."
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
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="pepper-and-bullion"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}