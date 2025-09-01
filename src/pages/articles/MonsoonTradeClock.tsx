import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconMonsoon } from '@/components/icons';
import { MonsoonMap } from '@/components/articles/MonsoonMap';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';

const content = `> IMAGE SLOT (monsoon map / ship lane)

The Indian Ocean is unusual: a **reversing wind machine**. Summer westerlies carry ships east; winter easterlies bring them home. By the first centuries CE, pilots and merchants timed departures to this rhythm, turning climate into a schedule.

## Ports on a Wind Calendar

From **Myos Hormos** and **Berenike** on the Red Sea to **Muziris** on the Malabar, routes condensed into a handful of well-known jumps. Pepper, aromatics, gemstones, and cotton cloth sailed west; bullion, glassware, and wine sailed east.

- **Outbound (Jun–Sep):** Red Sea → Malabar in ~40 days on steady westerlies.  
- **Return (Dec–Feb):** Malabar → Red Sea on the easterlies.

## Knowledge Networks

Monsoon timing was not "discovered" once; it was **accumulated practice**—sounding depths, logging currents, reading clouds. Guilds, pilots, and temple-port institutions preserved and transmitted this know-how. The miracle is not that ships crossed; it's that **schedules held** across centuries.

## Paperwork of the Ocean

Cargo lists, port dues, and merchant contracts reveal an economy calibrated to the winds:

- Pepper as a unit cargo, counted in sacks;  
- Bullion inflows to India as the price of luxury;  
- Contract clauses that *name* the monsoon as a force majeure.

## Why it matters

Maritime India didn't ride the world by conquering distance with force—it **cooperated** with a planetary engine. The result was a corridor where ideas, scripts, and ritual vocabularies traveled with bales and barrels.`;

export default function MonsoonTradeClock() {
  return (
    <ArticlePage
      title="Riding the Monsoon: How Winds Became an Engine of Commerce"
      dek="A logistics revolution long before steam—sailing the Arabian Sea on a seasonal clock."
      content={content}
      tags={["Indian Ocean World", "Trade", "Monsoon"]}
      icon={IconMonsoon}
      readTime={8}
      author="Prof. Ahmed Hassan"
      date="2024-03-12"
      dataComponents={[
        <MonsoonMap key="monsoon-map" />,
        <PepperCargoTable key="pepper-cargo" />
      ]}
    />
  );
}