import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconSarnathLion } from '@/components/icons/IconSarnathLion';
import { InteractiveQuote } from '@/components/articles/enhanced';
import { reassessingAshokaLegacy } from '@/data/articles/reassessing-ashoka-legacy';
import { MagadhaReligiousTimeline } from '@/components/articles/MagadhaReligiousTimeline';
import { MagadhaRegionMap } from '@/components/articles/MagadhaRegionMap';
import { ScholarlyDebatePanel } from '@/components/articles/ScholarlyDebatePanel';

export default function ReasessingAshokaLegacy() {
  return (
    <ArticlePage
      title={reassessingAshokaLegacy.title}
      dek={reassessingAshokaLegacy.dek}
      content={reassessingAshokaLegacy.content}
      tags={reassessingAshokaLegacy.tags}
      icon={IconSarnathLion}
      readTime={12}
      author="Nartiang Foundation Research Team"
      date="2025-10-06"
      dataComponents={[
        <MagadhaReligiousTimeline key="timeline" />,
        <MagadhaRegionMap key="map" />,
        <InteractiveQuote
          key="hathigumpha"
          author="King Kharavela of Kalinga"
          source="Hathigumpha Inscription"
          date="c. 1st century BCE"
          type="primary"
        >
          [A Nanda king] removed a revered Jaina idol from Kalinga to Pataliputra
        </InteractiveQuote>,
        <InteractiveQuote
          key="bronkhorst"
          author="Johannes Bronkhorst"
          source="Greater Magadha: Studies in the Culture of Early India"
          date="2007"
          type="historical"
        >
          A "rival culture" of Buddhism/Jainism "dominated the eastern Gangetic plain during the early Buddhist period," with orthodox Brahmins a distinct minority in Magadha.
        </InteractiveQuote>,
        <ScholarlyDebatePanel key="debate" />,
        <InteractiveQuote
          key="rock-edict"
          author="Emperor Ashoka"
          source="Rock Edict XII"
          date="c. 250 BCE"
          type="primary"
        >
          One should honor another man's sect... Whoever praises his own sect or blames other sects... does so out of devotion to his own sect, thinking 'I will glorify my own sect.' But doing so, he injures his own sect more gravely.
        </InteractiveQuote>
      ]}
    />
  );
}
