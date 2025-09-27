import { Map, Database, BarChart3, Globe, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LazyMapboxPortMap } from "@/components/interactive/LazyMapboxPortMap";
import { LazyMonsoonAnimation } from "@/components/interactive/LazyMonsoonAnimation";
import { PlateTimeline } from "@/components/interactive/PlateTimeline";
import { useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { IconConch, IconDharmaChakra } from "@/components/icons";
import { 
  CosmicOceanHero, 
  FilterChips, 
  EvidenceToggle, 
  TimeSlider, 
  LayerControls, 
  PortCard 
} from '@/components/cosmic-ocean';
import portsData from '@/data/cosmic_ocean/ports.json';
import monsoonData from '@/data/cosmic_ocean/monsoon.json';
import cosmicOceanI18n from '@/data/cosmic_ocean/i18n.json';

export default function MapsData() {
  const [activeModal, setActiveModal] = useState<'ports' | 'monsoon' | 'timeline' | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showEvidence, setShowEvidence] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [enabledLayers, setEnabledLayers] = useState(['ports', 'monsoon']);
  const { i18n } = useTranslation();
  
  const handleFilterToggle = useCallback((filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  const handleLayerToggle = useCallback((layerId: string) => {
    setEnabledLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  }, []);

  const handleOpenReadingRoom = useCallback((ref: string) => {
    window.open(ref, '_blank');
  }, []);

  const handleDownloadData = useCallback((portId: string) => {
    const port = portsData.ports.find(p => p.id === portId);
    if (port) {
      const dataStr = JSON.stringify(port, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${portId}_data.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, []);

  // Filter ports based on selected filters and period
  const filteredPorts = portsData.ports.filter(port => {
    const matchesFilter = selectedFilters.length === 0 || 
      selectedFilters.some(filter => port.tags.includes(filter));
    const matchesPeriod = selectedPeriod === 'all' || port.period_band === selectedPeriod;
    return matchesFilter && matchesPeriod;
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Ocean Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-peacock-blue/20 via-ocean/10 to-indigo-dharma/20" />
      <div className="absolute inset-0 opacity-[0.05]" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%230066CC' stroke-width='1' opacity='0.4'%3E%3Ccircle cx='60' cy='60' r='50' fill='none'/%3E%3Ccircle cx='60' cy='60' r='30' fill='none'/%3E%3Ccircle cx='60' cy='60' r='10' fill='none'/%3E%3Cpath d='M60 10 L65 25 L60 40 L55 25 Z' fill='%23FF6600' opacity='0.3'/%3E%3Cpath d='M110 60 L95 65 L80 60 L95 55 Z' fill='%23FF6600' opacity='0.3'/%3E%3Cpath d='M60 110 L65 95 L60 80 L55 95 Z' fill='%23FF6600' opacity='0.3'/%3E%3Cpath d='M10 60 L25 65 L40 60 L25 55 Z' fill='%23FF6600' opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
           }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-background/5" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Hero Section */}
        <CosmicOceanHero />

        {/* Interactive Controls */}
        <div className="mb-8">
          <FilterChips 
            selectedFilters={selectedFilters}
            onFilterToggle={handleFilterToggle}
          />
          
          <EvidenceToggle 
            showEvidence={showEvidence}
            onToggle={setShowEvidence}
          />
          
          <TimeSlider 
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />
          
          <LayerControls 
            enabledLayers={enabledLayers}
            onLayerToggle={handleLayerToggle}
          />
        </div>

        {/* Enhanced Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Historical Ports - Enhanced */}
          <Card className="bg-card border-border col-span-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                  <Globe size={20} className="text-ocean" />
                  {cosmicOceanI18n.labels.historical_ports}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActiveModal('ports')}
                >
                  {i18n.language === 'hi' ? cosmicOceanI18n.labels.view_map_hi : cosmicOceanI18n.labels.view_map_en}
                </Button>
              </div>
              <p className="text-muted-foreground">
                Major port nodes with approximate coordinates and indicative active periods.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPorts.map((port) => (
                  <PortCard
                    key={port.id}
                    port={port}
                    showEvidence={showEvidence}
                    onOpenReadingRoom={handleOpenReadingRoom}
                    onDownloadData={handleDownloadData}
                  />
                ))}
              </div>
              {filteredPorts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No ports match the current filters. Try adjusting your selection.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Monsoon Patterns */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                <BarChart3 size={20} className="text-ocean" />
                {cosmicOceanI18n.labels.monsoon_patterns}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Conceptual seasonal winds for navigation timing. Not sailing instructions.
              </p>
              <div className="space-y-4 mb-4">
                {monsoonData.seasons.map((season) => (
                  <div key={season.id} className="p-3 bg-ocean/10 rounded">
                    <h4 className="font-medium text-foreground mb-2">
                      {i18n.language === 'hi' ? season.title_hi : season.title_en}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {season.months.join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i18n.language === 'hi' ? season.narrative_hi : season.narrative_en}
                    </p>
                    {showEvidence && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Vectors: {season.vectors.length} conceptual wind patterns
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setActiveModal('monsoon')}
                >
                  {i18n.language === 'hi' ? cosmicOceanI18n.labels.view_animation_hi : cosmicOceanI18n.labels.view_animation_en}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const dataStr = JSON.stringify(monsoonData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'monsoon_data.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for Tectonic Movement - keeping existing functionality */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                <Database size={20} className="text-laterite" />
                Tectonic Movement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Indian plate movement over deep time and its impact on geography.
              </p>
              <div className="p-4 bg-muted/30 rounded text-center">
                <p className="text-sm text-muted-foreground">
                  Enhanced geological timeline coming soon
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => setActiveModal('timeline')}
              >
                View Timeline Visualization
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Data Access Section */}
        <div className="text-center">
          <Card className="bg-card border-border max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-2xl text-foreground">
                Access Full Datasets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                All research data is available for download and reuse under open access licenses. 
                Contribute to the growing knowledge base of Indian Ocean studies.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-2">Maritime Networks</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Explore comprehensive trade networks from Bujang Valley to Nagapattinam guilds.
                  </p>
                  <Link to="/batch/bujang-nagapattinam-ocean">
                    <Button size="sm" variant="outline" className="w-full">
                      View Maritime Collection
                    </Button>
                  </Link>
                </Card>
                <Card className="p-4">
                  <h4 className="font-semibold text-foreground mb-2">Scripts & Empire</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Interactive exploration of Muziris trade, Kutai inscriptions, and Ashoka's edicts.
                  </p>
                  <Link to="/batch/muziris-kutai-ashoka">
                    <Button size="sm" variant="outline" className="w-full">
                      View Scripts Collection
                    </Button>
                  </Link>
                </Card>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-ocean hover:bg-ocean/90"
                  onClick={() => {
                    const allData = { ports: portsData.ports, monsoon: monsoonData };
                    const dataStr = JSON.stringify(allData, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'cosmic_ocean_complete_dataset.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  {cosmicOceanI18n.labels.download_json}
                </Button>
                <Button variant="outline">
                  API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <div className="max-w-2xl mx-auto">
            {cosmicOceanI18n.footnotes.map((footnote, index) => (
              <p key={index} className="text-xs text-muted-foreground mb-1">
                {footnote}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Modals */}
      {activeModal === 'ports' && (
        <LazyMapboxPortMap onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'monsoon' && (
        <LazyMonsoonAnimation onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'timeline' && (
        <PlateTimeline onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}