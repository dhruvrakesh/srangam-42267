import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Jyotirlinga {
  name: string;
  location: string;
  state: string;
  coordinates: [number, number];
  puranicOrigin: string;
  geography: string;
  significance: string;
  color: string;
}

const jyotirlingas: Jyotirlinga[] = [
  {
    name: 'Kedāranāth',
    location: 'Uttarakhand Himalayas',
    state: 'Uttarakhand',
    coordinates: [30.7346, 79.0669],
    puranicOrigin: 'Pāṇḍavas sought Śiva here after Kurukṣetra; Śiva manifested as bull',
    geography: 'High Himalayas (3,583m), Mandakini river source',
    significance: 'Northern Jyotirliṅga, Char Dham pilgrimage',
    color: 'hsl(200, 80%, 60%)'
  },
  {
    name: 'Kāśī Viśvanāth',
    location: 'Varanasi',
    state: 'Uttar Pradesh',
    coordinates: [25.3109, 83.0111],
    puranicOrigin: 'Śiva never left Kāśī; Jyotirliṅga of infinite light',
    geography: 'Gaṅgā riverbank, ancient city center',
    significance: 'Mokṣa city, death here grants liberation',
    color: 'hsl(45, 100%, 50%)'
  },
  {
    name: 'Mahākāleśvara',
    location: 'Ujjain',
    state: 'Madhya Pradesh',
    coordinates: [23.1828, 75.7683],
    puranicOrigin: 'Śiva defeated demon Dūṣaṇa; self-manifested liṅga',
    geography: 'Śiprā river, ancient Avantī capital',
    significance: 'Only south-facing Jyotirliṅga, Kumbh Melā site',
    color: 'hsl(280, 80%, 60%)'
  },
  {
    name: 'Omkāreśvara',
    location: 'Mandhata Island',
    state: 'Madhya Pradesh',
    coordinates: [22.2397, 75.9515],
    puranicOrigin: 'Island shaped like Oṁ symbol; gods worshipped here',
    geography: 'Narmadā river island, natural Oṁ formation',
    significance: 'Island pilgrimage, circumambulation tradition',
    color: 'hsl(30, 90%, 55%)'
  },
  {
    name: 'Tryambakeśvara',
    location: 'Nashik',
    state: 'Maharashtra',
    coordinates: [19.9307, 73.5317],
    puranicOrigin: 'Gaṅgā liberated from Śiva\'s locks; Godāvarī source',
    geography: 'Brahmagiri mountain, Godāvarī origin',
    significance: 'Kumbh Melā site, river source sanctity',
    color: 'hsl(160, 70%, 50%)'
  },
  {
    name: 'Bhīmāśaṅkara',
    location: 'Sahyadri Range',
    state: 'Maharashtra',
    coordinates: [19.0719, 73.5347],
    puranicOrigin: 'Śiva defeated demon Bhīma; appeared as Bhīmāśaṅkara',
    geography: 'Western Ghats, dense forest, Bhīmā river source',
    significance: 'Forest sanctuary, wildlife biodiversity',
    color: 'hsl(120, 60%, 45%)'
  },
  {
    name: 'Nāgeśa (Nāgeśvara)',
    location: 'Dwarka vicinity',
    state: 'Gujarat',
    coordinates: [22.3024, 68.9685],
    puranicOrigin: 'Śiva protected devotee from serpent demon',
    geography: 'Saurashtra coast, near Dvārakā',
    significance: 'Coastal Jyotirliṅga, protection deity',
    color: 'hsl(340, 80%, 60%)'
  },
  {
    name: 'Vaidyanātha',
    location: 'Deoghar',
    state: 'Jharkhand',
    coordinates: [24.4848, 86.6969],
    puranicOrigin: 'Rāvaṇa worshipped Śiva; liṅga stuck mid-journey',
    geography: 'Chota Nagpur plateau, Śrāvaṇa pilgrimage route',
    significance: 'Healing deity, monsoon pilgrimage tradition',
    color: 'hsl(15, 90%, 60%)'
  },
  {
    name: 'Rāmeśvara',
    location: 'Rameswaram',
    state: 'Tamil Nadu',
    coordinates: [9.2881, 79.3129],
    puranicOrigin: 'Rāma installed liṅga before Laṅkā battle',
    geography: 'Southern tip island, Gulf of Mannar',
    significance: 'Southernmost Jyotirliṅga, Char Dham pilgrimage',
    color: 'hsl(220, 70%, 60%)'
  },
  {
    name: 'Ghrṇeśvara',
    location: 'Ellora',
    state: 'Maharashtra',
    coordinates: [20.0264, 75.1813],
    puranicOrigin: 'Devotee Ghushma\'s worship restored son; compassion liṅga',
    geography: 'Ellora caves vicinity, Deccan Plateau',
    significance: 'Cave temple complex, architectural marvel',
    color: 'hsl(270, 75%, 55%)'
  },
  {
    name: 'Somnātha',
    location: 'Prabhas Patan',
    state: 'Gujarat',
    coordinates: [20.8880, 70.4011],
    puranicOrigin: 'Moon god restored radiance; first Jyotirliṅga',
    geography: 'Arabian Sea coast, Sarasvatī confluence',
    significance: 'First among twelve, civilizational resilience',
    color: 'hsl(50, 100%, 60%)'
  },
  {
    name: 'Mallikārjuna',
    location: 'Srisailam',
    state: 'Andhra Pradesh',
    coordinates: [16.0734, 78.8688],
    puranicOrigin: 'Śiva-Pārvatī reconciliation; jasmine flower liṅga',
    geography: 'Nallamala Hills, Kṛṣṇā river gorge',
    significance: 'Śakti Pīṭha conjunction, tantric traditions',
    color: 'hsl(300, 80%, 65%)'
  }
];

export const JyotirlingaComprehensiveMap: React.FC = () => {
  const [selectedJyotirlinga, setSelectedJyotirlinga] = React.useState<Jyotirlinga | null>(jyotirlingas[10]); // Default to Somnātha

  // Simplified India map projection (normalized to 0-100 range)
  const projectCoordinates = (coords: [number, number]): [number, number] => {
    // Lat range: 8-36, Lon range: 68-98
    const x = ((coords[1] - 68) / 30) * 100;
    const y = ((36 - coords[0]) / 28) * 100;
    return [x, y];
  };

  return (
    <Card className="p-6 my-8 border-border bg-card">
      <h3 className="text-xl font-semibold mb-4 text-foreground">Twelve Jyotirliṅgas: Sacred Pilgrimage Mandala</h3>
      <p className="text-sm text-muted-foreground mb-6">
        The twelve Jyotirliṅgas form a sacred mandala across the Indian subcontinent, from Kedāranāth in the Himalayas to Rāmeśvara in the southern sea. Click each shrine for Puranic origins and geographical context.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map visualization */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg p-4 border border-border" style={{ aspectRatio: '3/4' }}>
            <svg viewBox="0 0 100 140" className="w-full h-full">
              {/* Simplified India outline */}
              <path
                d="M 40,10 L 60,10 L 70,30 L 75,50 L 70,70 L 60,90 L 50,110 L 45,125 L 50,135 L 45,140 L 35,135 L 40,125 L 35,110 L 25,90 L 20,70 L 15,50 L 20,30 Z"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.3"
              />

              {/* Pilgrimage network lines */}
              {jyotirlingas.map((jyotirlinga, i) => {
                const [x, y] = projectCoordinates(jyotirlinga.coordinates);
                const nextIndex = (i + 1) % jyotirlingas.length;
                const [nextX, nextY] = projectCoordinates(jyotirlingas[nextIndex].coordinates);
                
                return (
                  <line
                    key={`line-${i}`}
                    x1={x}
                    y1={y}
                    x2={nextX}
                    y2={nextY}
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.2"
                    opacity="0.1"
                    strokeDasharray="1,1"
                  />
                );
              })}

              {/* Jyotirliṅga markers */}
              {jyotirlingas.map((jyotirlinga) => {
                const [x, y] = projectCoordinates(jyotirlinga.coordinates);
                const isSelected = selectedJyotirlinga?.name === jyotirlinga.name;

                return (
                  <g key={jyotirlinga.name}>
                    {/* Glow effect */}
                    {isSelected && (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="none"
                          stroke={jyotirlinga.color}
                          strokeWidth="0.5"
                          opacity="0.4"
                          className="animate-pulse"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill="none"
                          stroke={jyotirlinga.color}
                          strokeWidth="0.3"
                          opacity="0.3"
                          className="animate-pulse"
                          style={{ animationDelay: '0.3s' }}
                        />
                      </>
                    )}
                    
                    {/* Main marker */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 2.5 : 1.8}
                      fill={jyotirlinga.color}
                      opacity={isSelected ? 1 : 0.7}
                      className="cursor-pointer transition-all duration-300 hover:opacity-100"
                      onClick={() => setSelectedJyotirlinga(jyotirlinga)}
                    />
                    
                    {/* Label */}
                    <text
                      x={x}
                      y={y - 4}
                      fontSize="2.5"
                      fill="hsl(var(--foreground))"
                      textAnchor="middle"
                      className="font-medium pointer-events-none"
                      opacity={isSelected ? 1 : 0.6}
                    >
                      {jyotirlinga.name.split('(')[0].trim()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Jyotirliṅga details and list */}
        <div className="space-y-4">
          {/* Selected shrine details */}
          {selectedJyotirlinga && (
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <div
                className="w-full h-1 rounded-full mb-4"
                style={{ backgroundColor: selectedJyotirlinga.color }}
              />
              
              <h4 className="text-lg font-semibold mb-3 text-foreground">{selectedJyotirlinga.name}</h4>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-foreground">{selectedJyotirlinga.location}, {selectedJyotirlinga.state}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Puranic Origin</p>
                  <p className="text-foreground/80">{selectedJyotirlinga.puranicOrigin}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Geography</p>
                  <p className="text-foreground/80">{selectedJyotirlinga.geography}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Significance</p>
                  <p className="text-foreground/80">{selectedJyotirlinga.significance}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable list */}
          <div className="bg-muted/30 rounded-lg border border-border">
            <div className="p-4 border-b border-border">
              <h5 className="text-sm font-semibold text-foreground">All Jyotirliṅgas</h5>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="p-2 space-y-1">
                {jyotirlingas.map((jyotirlinga, index) => (
                  <button
                    key={jyotirlinga.name}
                    onClick={() => setSelectedJyotirlinga(jyotirlinga)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      selectedJyotirlinga?.name === jyotirlinga.name
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground mt-0.5">{index + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: jyotirlinga.color }}
                          />
                          <p className="text-sm font-medium text-foreground">{jyotirlinga.name}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{jyotirlinga.state}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Pilgrimage note */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <p className="text-xs text-foreground/70">
          <strong>Pilgrimage Tradition:</strong> The twelve Jyotirliṅgas form a sacred circuit that has unified India spiritually for over a millennium. 
          Completing the pilgrimage to all twelve shrines is considered highly meritorious in Śaiva tradition.
        </p>
      </div>
    </Card>
  );
};
