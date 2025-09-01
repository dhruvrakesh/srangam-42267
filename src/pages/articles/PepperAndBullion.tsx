import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort } from '@/components/icons';
import { PepperCargoTable } from '@/components/articles/PepperCargoTable';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
        <PepperCargoTable key="pepper-cargo" />,
        <div key="related-link" className="mt-8 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold text-ink mb-2">Explore the Full Trade Network</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Discover the complete Muziris corridor with interactive trade ledgers and route maps.
          </p>
          <Link to="/batch/muziris-kutai-ashoka">
            <Button variant="default">
              View Scripts, Trade & Empire Collection
            </Button>
          </Link>
        </div>
      ]}
    />
  );
}