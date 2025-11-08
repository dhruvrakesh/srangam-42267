import { ArticlePage } from "@/components/articles/ArticlePage";
import { IconMonsoon } from "@/components/icons";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { MonsoonMap } from "@/components/articles/MonsoonMap";
import { LazyMonsoonAnimation } from "@/components/interactive/LazyMonsoonAnimation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationBibliography } from "@/components/articles/NavigationBibliography";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ridersOnMonsoon } from '@/data/articles/riders-on-monsoon';
import { UniversalNarrator } from '@/components/narration/UniversalNarrator';
import { NarrationErrorBoundary } from '@/components/narration/NarrationErrorBoundary';

// Using multilingual content from data file instead of hardcoded English

const navigationSources = [
  {
    author: "Business Standard (Dec 2017)",
    title: "Navigation began in India: Indus Valley sailors used monsoon winds",
    url: "business-standard.com"
  },
  {
    author: "Raines, Amelia",
    title: "Winds of (Ex)Change in the Indian Ocean",
    publication: "Library of Congress Blog, 2022",
    url: "blogs.loc.gov"
  },
  {
    author: "Indic Inspirations Blog",
    title: "Monsoons Explained Through the Ages",
    year: "2021",
    url: "blog.indicinspirations.com"
  },
  {
    author: "Khorana, A. A.",
    title: "A Deeply Globalized Ancient World",
    publication: "Literary Hub, 2024",
    url: "lithub.com"
  },
  {
    author: "Kerala Archives Project",
    title: "Palm-leaf manuscript discovery - preliminary notes",
    publication: "New Indian Express, 2025",
    note: "unpublished"
  },
  {
    author: "McGrail, Seán",
    title: "Ancient Boats in the Indian Ocean",
    year: "1987",
    note: "mentions use of kamal and star navigation"
  },
  {
    author: "Latha, K. (Ed.)",
    title: "Maritime Heritage of Ancient India",
    note: "compilation of traditional navigation practices"
  }
];

export default function RidersOnMonsoon() {
  const contentForNarration = typeof ridersOnMonsoon.content === 'object'
    ? ((ridersOnMonsoon.content as any).en as string || '')
    : ridersOnMonsoon.content as string;

  const dataComponents = [
    <ResponsiveImage
      key="palm-leaf"
      src="/images/flatlay_scripts-that-sailed_4x3_v3.png"
      alt="Ancient palm-leaf manuscript with navigation instructions in Malayalam script, similar to those discovered in Kerala archives containing monsoon timing and stellar navigation data"
      className="rounded-lg shadow-lg"
      caption="Palm-leaf manuscripts like this preserved indigenous maritime knowledge across South India. The Kerala discovery contains detailed monsoon navigation instructions in Sanskrit and Malayalam."
    />,
    
    <Card key="monsoon-animation" className="bg-sand/10">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Interactive: Seasonal Wind Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Explore how ancient navigators harnessed the predictable reversal of monsoon winds 
          to establish reliable trading routes across the Indian Ocean.
        </p>
        <LazyMonsoonAnimation onClose={() => {}} />
      </CardContent>
    </Card>,

    <MonsoonMap key="monsoon-map" />,

    <Card key="stellar-nav" className="bg-sand/10">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Stellar Navigation: The Nakshatra System</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Ancient Indian navigators used the 27 lunar constellations (**nakṣatras**) to determine 
          sailing seasons and predict weather patterns. Each **nakṣatra** corresponded to roughly 
          13-14 days, creating a precise astronomical calendar for maritime activities.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-ocean/10 rounded">
            <div className="font-semibold text-ocean">Rohini</div>
            <div className="text-sm text-muted-foreground">May - Southwest winds begin</div>
          </div>
          <div className="text-center p-3 bg-ocean/10 rounded">
            <div className="font-semibold text-ocean">Makha</div>
            <div className="text-sm text-muted-foreground">August - Peak monsoon</div>
          </div>
          <div className="text-center p-3 bg-ocean/10 rounded">
            <div className="font-semibold text-ocean">Kartika</div>
            <div className="text-sm text-muted-foreground">November - Northeast winds</div>
          </div>
        </div>
      </CardContent>
    </Card>,

    <Card key="navigation-timeline" className="bg-sand/10">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Timeline: Indigenous Navigation Development</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border-l-2 border-ocean pl-4">
            <div className="font-semibold">2500 BCE - Harappan Period</div>
            <div className="text-muted-foreground">Evidence of monsoon-based trade with Mesopotamia via Lothal port</div>
          </div>
          <div className="border-l-2 border-ocean pl-4">
            <div className="font-semibold">1200 BCE - Vedic Period</div>
            <div className="text-muted-foreground">**Ṛig Veda** describes **monsoon** winds (**Maruts**) and ocean phenomena</div>
          </div>
          <div className="border-l-2 border-ocean pl-4">
            <div className="font-semibold">300 BCE-300 CE - Sangam Era</div>
            <div className="text-muted-foreground">Tamil literature contains detailed references to stellar navigation</div>
          </div>
          <div className="border-l-2 border-ocean pl-4">
            <div className="font-semibold">6th Century CE</div>
            <div className="text-muted-foreground">**Varāhamihira's** **Bṛhat Saṃhitā** codifies **monsoon** prediction methods</div>
          </div>
          <div className="border-l-2 border-ocean pl-4">
            <div className="font-semibold">11th Century CE</div>
            <div className="text-muted-foreground">Chola naval expeditions demonstrate mastery of ocean navigation</div>
          </div>
        </div>
      </CardContent>
    </Card>,

    <Card key="part-navigation" className="bg-ocean/5 border-ocean/20">
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          <ArrowLeft className="text-ocean" size={20} />
          Maritime Memories Trilogy
          <ArrowRight className="text-ocean" size={20} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <Link to="/maritime-memories-south-india" className="group">
            <div className="p-4 bg-background rounded border hover:border-ocean/50 transition-colors">
              <div className="text-sm text-ocean font-medium">← Part 1</div>
              <div className="font-semibold">Emporia of the Ocean</div>
              <div className="text-sm text-muted-foreground">Indo-Roman trade networks and archaeological evidence</div>
            </div>
          </Link>
          <div className="p-4 bg-background rounded border border-dashed border-ocean/30">
            <div className="text-sm text-ocean font-medium">Part 3 →</div>
            <div className="font-semibold">Geological Foundations</div>
            <div className="text-sm text-muted-foreground">How deep time shaped South India's maritime geography</div>
            <div className="text-xs text-muted-foreground mt-1">Coming soon</div>
          </div>
        </div>
      </CardContent>
    </Card>,

    <NavigationBibliography key="bibliography" sources={navigationSources} />
  ];

  return (
    <>
      <ArticlePage
        title={ridersOnMonsoon.title}
        dek={ridersOnMonsoon.dek}
        content={ridersOnMonsoon.content}
        tags={ridersOnMonsoon.tags}
        icon={IconMonsoon}
        readTime={16}
        author="Nartiang Foundation"
        date="March 25, 2024"
        dataComponents={dataComponents}
      />
      <NarrationErrorBoundary>
        <UniversalNarrator
          content={contentForNarration}
          contentType="article"
          articleSlug="riders-on-monsoon"
          variant="sticky-bottom"
          autoAnalyze={true}
        />
      </NarrationErrorBoundary>
    </>
  );
}