import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort } from '@/components/icons';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';
import { TradeTimeline } from '@/components/articles/TradeTimeline';
import { Bibliography } from '@/components/articles/Bibliography';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  InteractiveQuote, 
  ExpandableSection, 
  ContextualSidebar, 
  ParagraphWithHighlight,
  DynamicTimeline,
  createHistoricalContext,
  createGeographicalContext,
  annotations,
  createTimelineEvent
} from '@/components/articles/enhanced';

// Import generated images
import romanAmphora from '@/assets/roman-amphora_archaeology_4x3_v1.jpg';
import romanCoins from '@/assets/roman-coins_numismatics_3x2_v1.jpg';
import monsoonRoutes from '@/assets/monsoon-routes_historical-map_16x9_v1.jpg';
import berenikeArtifacts from '@/assets/berenike-artifacts_archaeology_4x3_v1.jpg';

// Enhanced timeline data
const tradeTimelineEvents = [
  createTimelineEvent(
    'indus-1', 
    '3300-1300 BCE', 
    'Indus Valley Maritime Networks',
    'Archaeological evidence of Harappan seals and goods found across the Persian Gulf, indicating sophisticated early Indian Ocean trade networks.',
    'discovery',
    {
      location: 'Indus Valley to Mesopotamia',
      significance: 'Establishes India as a maritime trading civilization over 5000 years ago',
      expandable: true,
      details: (
        <div className="space-y-4">
          <p>Harappan seals discovered in Mesopotamian cities like Ur and Babylon provide clear evidence of direct trade connections.</p>
          <div className="bg-cream/40 p-4 rounded-lg">
            <h5 className="font-semibold text-burgundy mb-2">Key Archaeological Evidence:</h5>
            <ul className="text-sm space-y-1">
              <li>• Harappan weights and measures found in Persian Gulf ports</li>
              <li>• Indus script on objects found in Oman and Bahrain</li>
              <li>• Carnelian beads manufactured in Gujarat found across the region</li>
            </ul>
          </div>
        </div>
      )
    }
  ),
  createTimelineEvent(
    'hippalus-1',
    '~100 BCE',
    'Monsoon Navigation Systematized',
    'Greek navigator Hippalus documents existing Indian monsoon navigation techniques, enabling regular Roman-Indian trade.',
    'discovery',
    {
      location: 'Arabian Sea',
      significance: 'Marks the beginning of regular direct Rome-India maritime trade',
      expandable: true,
      details: (
        <div className="space-y-4">
          <InteractiveQuote type="historical" author="Periplus of the Erythraean Sea">
            "The whole country of India abounds in ships sent there with cargoes from Arabia and by the Greeks."
          </InteractiveQuote>
          <p>Hippalus learned from Indian mariners who had been using these techniques for centuries.</p>
        </div>
      )
    }
  ),
  createTimelineEvent(
    'trade-peak',
    '50-150 CE',
    'Peak of Indo-Roman Trade',
    'Roman gold flows to India in unprecedented quantities in exchange for pepper, spices, and luxury goods.',
    'trade',
    {
      location: 'Indian Ocean',
      significance: 'Represents the height of ancient globalization',
      expandable: true,
      details: (
        <div className="space-y-4">
          <p>Pliny the Elder complained that India was draining Roman gold reserves, with at least 50 million sesterces flowing east annually.</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gold-warm/20 p-3 rounded">
              <h6 className="font-medium">Roman Exports to India</h6>
              <p className="text-sm">Gold, silver, wine, olive oil, glassware</p>
            </div>
            <div className="bg-saffron/20 p-3 rounded">
              <h6 className="font-medium">Indian Exports to Rome</h6>
              <p className="text-sm">Pepper, cinnamon, cardamom, pearls, silk, cotton</p>
            </div>
          </div>
        </div>
      )
    }
  )
];

const content = `India's maritime trade networks represent one of history's greatest examples of **indigenous knowledge systems** driving global commerce. Long before European colonization, Indian merchants, navigators, and port cities created sophisticated trade networks that connected continents.`;

const enhancedSections = [
  {
    title: "The Ancient Maritime Revolution",
    content: (
      <div className="space-y-6">
        <ParagraphWithHighlight 
          type="lead"
          annotation={annotations.keyPoint("This challenges the narrative that global trade began with European expansion")}
        >
          From the **Indus Valley Civilization** (3300-1300 BCE) to the medieval **Chola maritime empire**, 
          India developed sophisticated ocean-going technologies, navigation techniques, and commercial networks 
          that predated European maritime expansion by millennia.
        </ParagraphWithHighlight>
        
        <ExpandableSection 
          title="Archaeological Evidence of Early Indian Ocean Trade" 
          type="detail"
          defaultExpanded={false}
        >
          <div className="space-y-4">
            <ResponsiveImage
              src={berenikeArtifacts}
              alt="Archaeological artifacts from Berenike including ancient peppercorns"
              aspectRatio="landscape"
              caption="7.5kg of preserved Indian peppercorns from 1st century CE Berenike"
            />
            <p>
              The 1999 discovery of 7.5 kilograms of perfectly preserved Indian peppercorns at the Red Sea port 
              of Berenike provides tangible evidence of the scale and sophistication of ancient Indian Ocean trade.
            </p>
            <InteractiveQuote 
              type="cultural" 
              author="Archaeologist Steven Sidebotham"
              expandable={true}
              context="These peppercorns were found in a 1st century CE context, sealed in containers that preserved them for nearly 2000 years. The quantity suggests commercial rather than personal use."
            >
              "The aroma was still detectable when we opened the containers—a direct sensory link to ancient commerce."
            </InteractiveQuote>
          </div>
        </ExpandableSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ParagraphWithHighlight>
              **Muziris**, the legendary port on Kerala's Malabar coast, served as the primary gateway for this trade. 
              Tamil Sangam literature describes it as a cosmopolitan hub where "the sounds of many languages" 
              mixed with "the scent of pepper and cardamom."
            </ParagraphWithHighlight>
          </div>
          <div className="lg:col-span-1">
            <ContextualSidebar 
              items={createGeographicalContext(
                "Muziris (ancient)",
                "Located near modern Kodungallur, Kerala. Archaeological site at Pattanam has yielded Roman coins, amphora, and other Mediterranean artifacts.",
                "Kodungallur, Kerala"
              )}
            />
          </div>
        </div>
      </div>
    )
  },
  
  {
    title: "The Economics of 'Black Gold'",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ParagraphWithHighlight 
              annotation={annotations.insight("Pepper was so valuable it was used as currency in medieval Europe")}
            >
              **Black pepper** (*Piper nigrum*) grew only in the Western Ghats of India, creating a natural monopoly 
              that drove centuries of international trade. Roman sources reveal the extraordinary value placed on this 
              humble spice—it was literally worth its weight in gold.
            </ParagraphWithHighlight>
          </div>
          <div className="lg:col-span-1">
            <ContextualSidebar 
              items={createHistoricalContext(
                "1st-3rd centuries CE",
                "Peak of Indo-Roman pepper trade",
                "Roman gold finds in South India from this period exceed those found anywhere outside the Mediterranean"
              )}
            />
          </div>
        </div>

        <ExpandableSection 
          title="The Roman Gold Drain: Quantifying Ancient Globalization" 
          type="info"
        >
          <div className="space-y-4">
            <ResponsiveImage
              src={romanCoins}
              alt="Roman gold aureus and silver denarii found in India"
              aspectRatio="portrait"
              caption="Roman gold aureus and silver denarii—evidence of massive capital flows to India"
            />
            
            <InteractiveQuote 
              type="historical" 
              author="Pliny the Elder, Natural History" 
              date="77-79 CE"
              expandable={true}
              context="Pliny was expressing concern about Rome's trade deficit with India, which he saw as economically damaging to the empire."
            >
              "By the lowest reckoning, India, the Seres [China], and the Arabian peninsula withdraw from our empire 100 million sesterces every year—so dearly do we pay for our luxury and our women."
            </InteractiveQuote>

            <PepperCargoTable />

            <div className="bg-burgundy/30 p-6 rounded-lg">
              <h4 className="font-serif text-lg font-semibold text-burgundy mb-3">Economic Impact Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-foreground mb-2">Roman Perspective</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Trade deficit concern among elites</li>
                    <li>• Gold reserves flowing eastward</li>
                    <li>• Pepper seen as luxury necessity</li>
                    <li>• Attempts to find alternative sources</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-foreground mb-2">Indian Perspective</h5>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Capital accumulation in port cities</li>
                    <li>• Development of banking systems</li>
                    <li>• Patronage of arts and temples</li>
                    <li>• Technological innovation in shipping</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>
      </div>
    )
  }
];

export default function PepperAndBullionEnhanced() {
  return (
    <ArticlePage
      title="Pepper and Bullion: The Malabar–Red Sea Circuit"
      dek="Tracing the spice networks across the Arabian Sea that connected ancient India with the Roman world—a story of monsoon winds, merchant empires, and the 'black gold' that changed history."
      content={content}
      tags={["Empires & Exchange", "Malabar", "Roman World", "Maritime Trade", "Ancient Economics"]}
      icon={IconPort}
      readTime={22}
      author="Nartiang Foundation"
      date="2024-03-08"
      dataComponents={[
        // Enhanced timeline
        <DynamicTimeline 
          key="enhanced-timeline"
          title="Timeline of Indian Ocean Trade Networks"
          events={tradeTimelineEvents}
          filterByType={true}
        />,

        // Enhanced sections
        ...enhancedSections.map((section, index) => (
          <ExpandableSection 
            key={`section-${index}`}
            title={section.title}
            level="h2"
            defaultExpanded={true}
          >
            {section.content}
          </ExpandableSection>
        )),

        // Monsoon navigation section
        <div key="monsoon-section" className="space-y-6">
          <ResponsiveImage
            src={monsoonRoutes}
            alt="Historical map showing monsoon trade routes"
            aspectRatio="video"
            caption="Monsoon wind patterns that enabled predictable ocean crossings"
          />
          
          <ExpandableSection 
            title="Indigenous Navigation: The Real 'Discovery' of the Monsoons"
            type="location"
          >
            <ParagraphWithHighlight 
              annotation={annotations.historicalNote("This reframes the common narrative about Hippalus 'discovering' the monsoons")}
            >
              The systematic use of monsoon winds for ocean navigation was **not** a Greek or Roman innovation. 
              Archaeological and literary evidence shows that Indian mariners had been using seasonal wind patterns 
              for direct ocean crossings centuries before any Mediterranean contact.
            </ParagraphWithHighlight>
            
            <InteractiveQuote 
              type="cultural"
              author="Sangam Literature (Akananuru)"
              date="~300 BCE - 300 CE"
            >
              "The great ships that brave the vast waters, their sails filled with the wind of the season, 
              carry our goods to distant shores where gold comes in return for pepper."
            </InteractiveQuote>
          </ExpandableSection>
        </div>,

        // Bibliography and references
        <Bibliography key="bibliography" />,

        // Related collection link
        <div key="related-link" className="p-8 bg-gradient-to-r from-burgundy/30 to-saffron/30 rounded-2xl border border-burgundy/40">
          <h3 className="text-xl font-serif font-bold text-burgundy mb-3">Explore the Complete Maritime Network</h3>
          <p className="text-charcoal/80 mb-6 leading-relaxed">
            Discover the full scope of ancient Indian Ocean trade networks, from the Indus Valley to medieval 
            maritime empires, and see how scripts, religions, and technologies traveled alongside spices and precious goods.
          </p>
          <Link to="/batch/muziris-kutai-ashoka">
            <Button className="bg-burgundy hover:bg-burgundy-light text-cream font-medium px-6 py-3">
              View Scripts, Trade & Empire Collection →
            </Button>
          </Link>
        </div>
      ]}
    />
  );
}