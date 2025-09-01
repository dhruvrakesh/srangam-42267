import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagChip } from "@/components/ui/TagChip";

/**
 * Srangam — Ready React pages (Batch 2)
 * Topics: Muziris (pepper & bullion corridor), Kutai Yūpa (Borneo), Ashoka @ Kandahar (Greek/Aramaic)
 * - Tailwind for styling with Srangam design system
 * - All vectors/SVGs inline; JSON data bundled
 */

/* ===================== DATA LAYERS ===================== */

// 1) Muziris corridor — schematic ledger and routes
const MUZIRIS_LEDGER = [
  { item: "Pepper", qty: 300, unit: "sacks", direction: "East→West", value: "High" },
  { item: "Fine cotton", qty: 500, unit: "bales", direction: "East→West", value: "Premium" },
  { item: "Pearls", qty: 40, unit: "pouches", direction: "East→West", value: "Luxury" },
  { item: "Silver bullion", qty: 1200, unit: "kg", direction: "West→East", value: "Standard" },
  { item: "Gold coins", qty: 80, unit: "kg", direction: "West→East", value: "Premium" },
  { item: "Glassware", qty: 150, unit: "pieces", direction: "West→East", value: "Craft" },
];

const MUZIRIS_ROUTES = [
  { from: { name: "Muziris", lat: 10.21, lon: 76.26 }, to: { name: "Berenike", lat: 23.91, lon: 35.5 }, season: "summer", distance: "40 days" },
  { from: { name: "Muziris", lat: 10.21, lon: 76.26 }, to: { name: "Myos Hormos", lat: 26.16, lon: 34.26 }, season: "summer", distance: "45 days" },
  { from: { name: "Berenike", lat: 23.91, lon: 35.5 }, to: { name: "Muziris", lat: 10.21, lon: 76.26 }, season: "winter", distance: "35 days" },
];

// 2) Kutai Yūpa (pillar shapes + captions)
const YUPA_PILLARS = [
  { id: "Yūpa I", lines: 8, content: "Svasti śrī śaka-varṣātīta 400...", translation: "Hail! In the elapsed Śaka year 400..." },
  { id: "Yūpa II", lines: 6, content: "...rājā śrī aśvavarmmā...", translation: "...King Śrī Aśvavarman..." },
  { id: "Yūpa III", lines: 7, content: "...yajñena iṣṭvā...", translation: "...having sacrificed with yajña..." },
  { id: "Yūpa IV", lines: 5, content: "...brāhmaṇān bhojavīt...", translation: "...fed the brahmins..." },
  { id: "Yūpa V", lines: 7, content: "...svavarggāya karma...", translation: "...deeds for heaven..." },
  { id: "Yūpa VI", lines: 6, content: "...kuṇḍuṅgaṃ nāma nagaraṃ...", translation: "...the city named Kuṇḍuṅga..." },
  { id: "Yūpa VII", lines: 5, content: "...mahārāja...", translation: "...great king..." },
];

// 3) Ashoka @ Kandahar bilingual block — schematic strings (simplified representations)
const KANDAHAR_BLOCKS = {
  greek: [
    "ΒΑΣΙΛΕΥΣ ΠΙΟΔΑΣΣΗΣ ΦΙΛΟΣ",
    "ΔΗΜΟΣΙΟΝ ΑΓΑΘΟΝ ΠΡΑΞΕΙ",
    "ΕΥΣΕΒΕΙΑ ΚΑΙ ΔΙΚΑΙΟΣΥΝΗ",
  ],
  aramaic: [
    "𐡌𐡋𐡊𐡀 𐡐𐡓𐡉𐡅𐡃𐡓𐡔 𐡓𐡇𐡌",
    "𐡈𐡁 𐡋𐡊𐡋 𐡍𐡔𐡀 𐡏𐡁𐡃",
    "𐡆𐡊𐡄 𐡅𐡊𐡉𐡍𐡀 𐡔𐡂𐡉𐡀",
  ],
};

/* ===================== HELPERS ===================== */
function project([lat, lon]: [number, number], w = 900, h = 480) {
  const x = ((lon - 20) / (120 - 20)) * (w - 60) + 30;
  const y = ((30 - lat) / (30 - -10)) * (h - 60) + 30;
  return [x, y];
}

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      {icon && <div className="text-ocean">{icon}</div>}
      <h2 className="text-2xl font-serif font-semibold text-ink">{title}</h2>
    </div>
    {children}
  </section>
);

/* ===================== COMPONENTS ===================== */

const MuzirisCorridorComponent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'ledger' | 'map'>('ledger');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Muziris Trade Corridor</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'ledger' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('ledger')}
          >
            Trade Ledger
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            Route Map
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'ledger' ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left font-semibold">Item</th>
                  <th className="border border-border p-3 text-left font-semibold">Quantity</th>
                  <th className="border border-border p-3 text-left font-semibold">Direction</th>
                  <th className="border border-border p-3 text-left font-semibold">Value Grade</th>
                </tr>
              </thead>
              <tbody>
                {MUZIRIS_LEDGER.map((entry, i) => (
                  <tr key={i} className="hover:bg-muted/50">
                    <td className="border border-border p-3 font-medium">{entry.item}</td>
                    <td className="border border-border p-3">{entry.qty} {entry.unit}</td>
                    <td className="border border-border p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        entry.direction.includes('East→West') 
                          ? 'bg-ocean/10 text-ocean' 
                          : 'bg-laterite/10 text-laterite'
                      }`}>
                        {entry.direction}
                      </span>
                    </td>
                    <td className="border border-border p-3">{entry.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <svg width="100%" height="300" viewBox="0 0 800 300" className="border border-border rounded-lg bg-background">
            {/* Ocean background */}
            <rect width="800" height="300" fill="hsl(var(--ocean) / 0.1)" />
            
            {/* Route lines */}
            {MUZIRIS_ROUTES.map((route, i) => {
              const [x1, y1] = project([route.from.lat, route.from.lon], 800, 300);
              const [x2, y2] = project([route.to.lat, route.to.lon], 800, 300);
              
              return (
                <g key={i}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={route.season === 'summer' ? 'hsl(var(--gold))' : 'hsl(var(--ocean))'}
                    strokeWidth="3"
                    strokeDasharray={route.season === 'summer' ? '10,5' : '5,10'}
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 10}
                    textAnchor="middle"
                    className="text-xs fill-ink font-medium"
                  >
                    {route.distance}
                  </text>
                </g>
              );
            })}
            
            {/* Ports */}
            {[...new Set(MUZIRIS_ROUTES.flatMap(r => [r.from, r.to]))].map((port) => {
              const [x, y] = project([port.lat, port.lon], 800, 300);
              return (
                <g key={port.name}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="hsl(var(--laterite))"
                    stroke="hsl(var(--ink))"
                    strokeWidth="2"
                  />
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    className="text-sm font-semibold fill-ink"
                  >
                    {port.name}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            The Muziris corridor represents one of history's most lucrative trade routes, connecting the spice-rich 
            Malabar Coast with Roman markets via Red Sea ports. The monsoon winds dictated sailing seasons, 
            creating a predictable rhythm of commerce.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const KutaiYupaComponent: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kutai Yūpa Inscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-4 mb-6">
          {YUPA_PILLARS.map((pillar) => {
            const isSelected = selectedPillar === pillar.id;
            return (
              <div
                key={pillar.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'transform scale-105' : ''
                }`}
                onClick={() => setSelectedPillar(isSelected ? null : pillar.id)}
              >
                <svg width="60" height="120" viewBox="0 0 60 120" className="mx-auto">
                  {/* Pillar body */}
                  <rect
                    x="20"
                    y="10"
                    width="20"
                    height="100"
                    fill={isSelected ? 'hsl(var(--gold))' : 'hsl(var(--laterite))'}
                    stroke="hsl(var(--ink))"
                    strokeWidth="2"
                    rx="2"
                  />
                  
                  {/* Inscription lines */}
                  {Array.from({ length: pillar.lines }, (_, i) => (
                    <line
                      key={i}
                      x1="22"
                      y1={20 + i * 10}
                      x2="38"
                      y2={20 + i * 10}
                      stroke="hsl(var(--ink))"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Base */}
                  <rect
                    x="15"
                    y="110"
                    width="30"
                    height="8"
                    fill="hsl(var(--sand))"
                    stroke="hsl(var(--ink))"
                    strokeWidth="1"
                  />
                </svg>
                <div className="text-center text-xs font-medium text-ink mt-2">
                  {pillar.id}
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedPillar && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold text-ink mb-2">
              {selectedPillar} - Sanskrit Inscription
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Original Text:</p>
                <p className="font-serif text-sm text-ink italic">
                  {YUPA_PILLARS.find(p => p.id === selectedPillar)?.content}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Translation:</p>
                <p className="text-sm text-ink">
                  {YUPA_PILLARS.find(p => p.id === selectedPillar)?.translation}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            The Kutai Yūpa inscriptions from 4th-5th century Borneo represent some of Southeast Asia's earliest 
            Sanskrit inscriptions, documenting Vedic fire sacrifices performed by King Aśvavarman. 
            Click on pillars to explore their content.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

const AshokaKandaharComponent: React.FC = () => {
  const [activeScript, setActiveScript] = useState<'greek' | 'aramaic'>('greek');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ashoka's Kandahar Edicts</CardTitle>
        <div className="flex gap-2">
          <Button
            variant={activeScript === 'greek' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveScript('greek')}
          >
            Greek Script
          </Button>
          <Button
            variant={activeScript === 'aramaic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveScript('aramaic')}
          >
            Aramaic Script
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-6 rounded-lg mb-4">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-ink">
              {activeScript === 'greek' ? 'Greek Text' : 'Aramaic Text'}
            </h4>
          </div>
          
          <div className="space-y-2">
            {KANDAHAR_BLOCKS[activeScript].map((line, i) => (
              <div
                key={i}
                className={`text-center p-2 border border-border rounded ${
                  activeScript === 'greek' ? 'font-serif text-lg' : 'font-mono text-xl'
                }`}
                style={{ direction: activeScript === 'aramaic' ? 'rtl' : 'ltr' }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-ink mb-2">Greek Translation</h4>
            <p className="text-sm text-muted-foreground">
              "King Piodasses, friend [of the Greeks], having acted for the public good, 
              [proclaims] piety and righteousness..."
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-ink mb-2">Aramaic Translation</h4>
            <p className="text-sm text-muted-foreground">
              "The king, the beloved of the gods, having shown mercy to all beings, 
              [establishes] good conduct and truth..."
            </p>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            This bilingual inscription from Kandahar demonstrates Ashoka's adaptation to local linguistic contexts. 
            The use of both Greek and Aramaic scripts reflects the cosmopolitan nature of the region and the 
            Mauryan Empire's administrative flexibility.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/* ===================== MAIN COMPONENT ===================== */

const BatchMuzirisKutaiAshoka: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'muziris' | 'kutai' | 'kandahar'>('muziris');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-ink mb-4">
            Scripts, Trade, and Empire
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Three windows into the ancient world: Muziris trade networks, Kutai Sanskrit inscriptions, 
            and Ashoka's multilingual edicts from Kandahar.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === 'muziris' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('muziris')}
              className="rounded-md"
            >
              Muziris Corridor
            </Button>
            <Button
              variant={activeTab === 'kutai' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('kutai')}
              className="rounded-md"
            >
              Kutai Yūpa
            </Button>
            <Button
              variant={activeTab === 'kandahar' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('kandahar')}
              className="rounded-md"
            >
              Kandahar Edicts
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'muziris' && (
            <Section title="Muziris: The Pepper Port">
              <div className="grid gap-8">
                <MuzirisCorridorComponent />
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    Muziris, located on the Malabar Coast of ancient Kerala, served as the primary conduit for Roman-Indian trade. 
                    The port's strategic position allowed merchants to exploit monsoon patterns, creating one of antiquity's 
                    most profitable trade routes. Pepper, known as "black gold," drove this lucrative exchange.
                  </p>
                  <blockquote className="border-l-4 border-ocean pl-4 italic text-muted-foreground">
                    "The cargoes from India are brought in large ships, on account of the great quantity and bulk of pepper and malabathrum." 
                    — Pliny the Elder
                  </blockquote>
                  <div className="flex gap-2 mt-4">
                    <TagChip variant="theme">Roman Trade</TagChip>
                    <TagChip variant="default">Pepper Routes</TagChip>
                    <TagChip variant="theme">Monsoon Commerce</TagChip>
                  </div>
                  {/* IMAGE SLOT: Ancient Roman ship loaded with spice containers and pepper sacks */}
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'kutai' && (
            <Section title="Kutai Yūpa: Sanskrit in Borneo">
              <div className="grid gap-8">
                <KutaiYupaComponent />
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    The Kutai Yūpa inscriptions, dating to the late 4th or early 5th century CE, represent the earliest known 
                    Sanskrit inscriptions in Southeast Asia. Discovered in East Kalimantan, these seven stone pillars document 
                    Vedic fire sacrifices performed by King Mulavarman, revealing the sophisticated adoption of Indian cultural 
                    and religious practices in maritime Southeast Asia.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-ink mb-2">Historical Significance:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• First evidence of Hinduized kingdoms in Borneo</li>
                      <li>• Documentation of Vedic ritual practices</li>
                      <li>• Sanskrit literary culture in Southeast Asia</li>
                      <li>• Royal legitimation through Indian models</li>
                    </ul>
                  </div>
                  {/* IMAGE SLOT: Stone pillars (yupa) with Sanskrit inscriptions in a tropical forest setting */}
                </div>
              </div>
            </Section>
          )}

          {activeTab === 'kandahar' && (
            <Section title="Kandahar: Ashoka's Multilingual Message">
              <div className="grid gap-8">
                <AshokaKandaharComponent />
                <div className="prose max-w-none">
                  <p className="text-muted-foreground">
                    At Kandahar in modern Afghanistan, Ashoka's administrators erected bilingual inscriptions in Greek and Aramaic, 
                    adapting the emperor's message to local linguistic and cultural contexts. These edicts demonstrate the 
                    Mauryan Empire's sophisticated approach to governing diverse populations across vast distances.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-ink mb-2">Greek Context</h4>
                      <p className="text-sm text-muted-foreground">
                        Greek was the administrative language of the Seleucid Empire and remained important 
                        in Bactria and Gandhara after Alexander's conquests.
                      </p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold text-ink mb-2">Aramaic Context</h4>
                      <p className="text-sm text-muted-foreground">
                        Aramaic served as the lingua franca of the former Achaemenid Empire and remained 
                        widely used in Central Asian administration.
                      </p>
                    </div>
                  </div>
                  {/* IMAGE SLOT: Stone inscription with bilingual Greek and Aramaic text in an archaeological setting */}
                </div>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchMuzirisKutaiAshoka;