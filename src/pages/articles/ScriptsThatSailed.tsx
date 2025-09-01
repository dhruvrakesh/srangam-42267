import React from 'react';
import { ArticlePage } from '@/components/articles/ArticlePage';
import { IconScript } from '@/components/icons';
import { ResponsiveImage } from '@/components/ui/ResponsiveImage';

const content = `When merchants, monks, and artisans moved, **scripts moved with them**. From late Southern Brāhmī and **Pallava/Grantha** hands emerged local daughters—**Khmer**, **Cham**, **Old Javanese Kawi**—each tuned to native phonologies.

## What traveled?

- **Ductus** (stroke habits), not just shapes.  
- **Scribal kit**: palm leaves, stylus/ink, layout conventions.  
- **Liturgical and legal genres**: donatives, land grants, prashastis.

## What changed?

- New consonant clusters and vowel signs to fit Austroasiatic and Malayo-Polynesian sounds.  
- Orthographic habits like virāma usage shift with context.  
- Multilingual stones—Sanskrit prestige alongside local languages.

## A case in stone

The **Kutai yūpa** pillars (Borneo) preserve Sanskrit in early Pallava/Grantha letterforms, anchoring Vedic ritual vocabulary far from the Ganga plains. Script is **soft power turned hard**, chiselled into rainforest rock.

## Why it matters

Scripts are **infrastructure**. Where they land, schools, courts, and ritual calendars follow. Inscriptions give us pins on the cultural map—names, dates, lineages—when texts are silent.`;

const ScriptLineageComponent = () => (
  <div className="space-y-4">
    <h3 className="font-serif text-lg font-semibold text-foreground">Script Lineage</h3>
    <div className="bg-white p-6 rounded-lg border">
      <svg viewBox="0 0 600 300" className="w-full h-64">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="3" markerWidth="10" markerHeight="10" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--ocean))" />
          </marker>
        </defs>
        
        {/* Southern Brahmi */}
        <rect x="50" y="50" width="120" height="40" rx="8" fill="hsl(var(--sand))" stroke="hsl(var(--border))" />
        <text x="110" y="75" textAnchor="middle" className="text-sm font-medium fill-current">Southern Brāhmī</text>
        
        {/* Pallava */}
        <rect x="250" y="50" width="100" height="40" rx="8" fill="hsl(var(--gold)/0.2)" stroke="hsl(var(--gold))" />
        <text x="300" y="75" textAnchor="middle" className="text-sm font-medium fill-current">Pallava</text>
        
        {/* Arrows */}
        <line x1="170" y1="70" x2="240" y2="70" stroke="hsl(var(--ocean))" strokeWidth="2" markerEnd="url(#arrow)" />
        
        {/* Daughter scripts */}
        <rect x="180" y="150" width="80" height="30" rx="6" fill="hsl(var(--laterite)/0.2)" stroke="hsl(var(--laterite))" />
        <text x="220" y="170" textAnchor="middle" className="text-xs font-medium fill-current">Khmer</text>
        
        <rect x="280" y="150" width="80" height="30" rx="6" fill="hsl(var(--laterite)/0.2)" stroke="hsl(var(--laterite))" />
        <text x="320" y="170" textAnchor="middle" className="text-xs font-medium fill-current">Cham</text>
        
        <rect x="380" y="150" width="80" height="30" rx="6" fill="hsl(var(--laterite)/0.2)" stroke="hsl(var(--laterite))" />
        <text x="420" y="170" textAnchor="middle" className="text-xs font-medium fill-current">Kawi</text>
        
        {/* Connection lines */}
        <line x1="280" y1="90" x2="220" y2="140" stroke="hsl(var(--ocean))" strokeWidth="1" markerEnd="url(#arrow)" />
        <line x1="300" y1="90" x2="320" y2="140" stroke="hsl(var(--ocean))" strokeWidth="1" markerEnd="url(#arrow)" />
        <line x1="320" y1="90" x2="420" y2="140" stroke="hsl(var(--ocean))" strokeWidth="1" markerEnd="url(#arrow)" />
        
        {/* Timeline */}
        <text x="50" y="230" className="text-xs text-muted-foreground fill-current">3rd-6th c. CE</text>
        <text x="250" y="230" className="text-xs text-muted-foreground fill-current">6th-8th c. CE</text>
        <text x="380" y="200" className="text-xs text-muted-foreground fill-current">8th+ c. CE</text>
      </svg>
    </div>
  </div>
);

export default function ScriptsThatSailed() {
  return (
    <ArticlePage
      title="Scripts that Sailed: From Southern Brāhmī to Kawi, Khmer, and Thai"
      dek="Letterforms as shipping records: how Indic scripts adapted to new languages around the Bay of Bengal."
      content={content}
      tags={["Scripts & Inscriptions", "Epigraphy", "SE Asia"]}
      icon={IconScript}
      readTime={12}
      author="Dr. Priya Venkat"
      date="2024-03-08"
      dataComponents={[
        <ResponsiveImage 
          key="scripts-hero"
          src="/images/flatlay_scripts-that-sailed_4x3_v3.png"
          alt="Collection of ancient scripts and manuscripts showing the evolution from Southern Brahmi to Southeast Asian scripts"
          aspectRatio="landscape"
          caption="Evolution of Indic scripts across maritime Southeast Asia, from palm-leaf manuscripts to stone inscriptions"
          credit="Script Documentation Archive"
          className="mb-8"
        />,
        <ScriptLineageComponent key="script-lineage" />
      ]}
    />
  );
}