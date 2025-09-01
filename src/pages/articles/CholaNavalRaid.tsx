import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconPort } from '@/components/icons';

const content = `> IMAGE SLOT (fleet reconstruction)

In 1025 CE, **Rajendra I** hit the Srivijayan nexus across the Straits of Malacca. The action was surgical—harbor targets, shipping, tribute nodes—and strategic: a signal that the Cholas could project **sea power** along their trading arteries.

## The logistics behind the blow

- Deep coastal **temple-port** infrastructure on the Coromandel.  
- Guilds (Ayyavole 500 etc.) with credit and convoy practices.  
- Shipyards and copper-plate bureaucracies that knit it together.

## Outcome, not myth

The raid didn't plant colonies; it **tilted leverage**. Convoys moved with less toll risk, and rivals recalculated. In an ocean held together by monsoon timing and shared ritual calendars, a decisive strike had oversized effects.

**Why it matters:** It's a rare glimpse of **hard power** in a domain usually ruled by **knowledge power**.`;

const ConvoyLanesComponent = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">Chola Naval Network, 1025 CE</h3>
    <div className="bg-white p-6 rounded-lg border">
      <svg viewBox="0 0 500 300" className="w-full h-64">
        {/* Coromandel Coast */}
        <rect x="50" y="50" width="20" height="200" fill="hsl(var(--sand))" />
        <text x="40" y="40" className="text-xs text-muted-foreground fill-current">Coromandel</text>
        
        {/* Key Chola ports */}
        <circle cx="60" cy="80" r="4" fill="hsl(var(--gold))" />
        <text x="75" y="85" className="text-xs text-foreground fill-current">Puhar</text>
        
        <circle cx="60" cy="120" r="4" fill="hsl(var(--gold))" />
        <text x="75" y="125" className="text-xs text-foreground fill-current">Nagapattinam</text>
        
        <circle cx="60" cy="160" r="4" fill="hsl(var(--gold))" />
        <text x="75" y="165" className="text-xs text-foreground fill-current">Thanjavur</text>
        
        {/* Maritime routes to Srivijaya */}
        <path d="M80 120 Q200 80 350 140" fill="none" stroke="hsl(var(--laterite))" strokeWidth="2" markerEnd="url(#convoy-arrow)"/>
        <path d="M80 140 Q250 100 380 160" fill="none" stroke="hsl(var(--laterite))" strokeWidth="2" markerEnd="url(#convoy-arrow)"/>
        
        {/* Srivijaya territory */}
        <rect x="350" y="130" width="80" height="60" rx="8" fill="hsl(var(--ocean)/0.3)" stroke="hsl(var(--ocean))" strokeWidth="1" />
        <text x="390" y="120" className="text-xs text-muted-foreground fill-current" textAnchor="middle">Srivijaya</text>
        
        {/* Target ports */}
        <circle cx="370" cy="150" r="3" fill="hsl(var(--laterite))" />
        <text x="375" y="145" className="text-xs text-foreground fill-current">Palembang</text>
        
        <circle cx="410" cy="170" r="3" fill="hsl(var(--laterite))" />
        <text x="415" y="165" className="text-xs text-foreground fill-current">Kedah</text>
        
        {/* Legend */}
        <line x1="50" y1="280" x2="70" y2="280" stroke="hsl(var(--laterite))" strokeWidth="2" />
        <text x="75" y="285" className="text-xs text-muted-foreground fill-current">Chola Naval Routes</text>
        
        <circle cx="200" cy="280" r="3" fill="hsl(var(--gold))" />
        <text x="210" y="285" className="text-xs text-muted-foreground fill-current">Chola Ports</text>
        
        <circle cx="320" cy="280" r="3" fill="hsl(var(--laterite))" />
        <text x="330" y="285" className="text-xs text-muted-foreground fill-current">Target Ports</text>
        
        <defs>
          <marker id="convoy-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0l10 5-10 5z" fill="hsl(var(--laterite))"/>
          </marker>
        </defs>
      </svg>
    </div>
    <p className="text-sm text-muted-foreground">
      The 1025 CE Chola naval expedition targeted key Srivijayan ports across the Straits of Malacca, 
      demonstrating unprecedented maritime power projection from South India.
    </p>
  </div>
);

export default function CholaNavalRaid() {
  return (
    <ArticlePage
      title="Rajendra's Ocean: The Chola Strike on Srivijaya, 1025 CE"
      dek="A hard-power raid in a sea network bound by soft-power ties."
      content={content}
      tags={["Empires & Exchange", "Chola", "Straits of Malacca"]}
      icon={IconPort}
      readTime={7}
      author="Prof. Naval History"
      date="2024-03-15"
      dataComponents={[
        <ConvoyLanesComponent key="convoy-lanes" />
      ]}
    />
  );
}