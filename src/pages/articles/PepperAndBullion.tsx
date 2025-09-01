import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort } from '@/components/icons';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';

const content = `> IMAGE SLOT (pepper sacks / amphorae)

At **Muziris** and its sister ports, pepper wasn't a garnish; it was a **measurement**. Cargo lists count in sacks, and every sack meant weight on the hull and coin in the ledger.

## The corridor

- **Outbound:** Pepper, cardamom, pearls, fine cottons.  
- **Inbound:** Silver, gold, glassware, wine, coral.  
- **Fixed costs:** Harbor dues, pilotage, guild fees.  
- **Variable:** The wind—miss a window, and you're a year late.

## Why bullion flowed east

Luxury demand in Rome ran hot; Indian textiles and spices ran scarce. The price equilibrium pushed **precious metal** into India, where it reconverted into land, temples, and craft.

## Muziris in the network

Ports are not towns with boats; they are **institutions**—custom houses, warehouses, temples, courts. Muziris thrived because it piped monsoon knowledge into contracts, dues, and credit.`;

export default function PepperAndBullion() {
  return (
    <ArticlePage
      title="Pepper and Bullion: The Malabar–Red Sea Circuit"
      dek="Sacks of spice eastbound; silver and gold westbound—the corridor that fed two worlds."
      content={content}
      tags={["Empires & Exchange", "Malabar", "Roman World"]}
      icon={IconPort}
      readTime={6}
      author="Dr. Maritime Historian"
      date="2024-03-08"
      dataComponents={[
        <PepperCargoTable key="pepper-cargo" />
      ]}
    />
  );
}