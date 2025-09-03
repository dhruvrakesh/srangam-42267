import { Map, Database, BarChart3, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PORTS, MONSOON, PLATE_SPEED, PEPPER_CARGO } from "@/data/siteData";
import { MapboxPortMap } from "@/components/interactive/MapboxPortMap";
import { MonsoonAnimation } from "@/components/interactive/MonsoonAnimation";
import { PlateTimeline } from "@/components/interactive/PlateTimeline";
import { useState } from "react";
import { IconConch, IconDharmaChakra } from "@/components/icons";

export default function MapsData() {
  const [activeModal, setActiveModal] = useState<'ports' | 'monsoon' | 'timeline' | null>(null);

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
        {/* Dharmic Cosmic Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-6 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-ocean/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-ocean/20 to-peacock-blue/20 p-6 rounded-full backdrop-blur-sm border border-ocean/30">
                <IconConch size={48} className="text-ocean" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-saffron/20 rounded-full blur-2xl transform scale-110"></div>
              <div className="relative bg-gradient-to-br from-saffron/80 to-turmeric p-8 rounded-full shadow-2xl border-2 border-indigo-dharma/20">
                <Map size={64} className="text-cream" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-dharma/30 rounded-full blur-xl transform scale-150 animate-pulse-gentle"></div>
              <div className="relative bg-gradient-to-br from-indigo-dharma/20 to-peacock-blue/20 p-6 rounded-full backdrop-blur-sm border border-indigo-dharma/30">
                <IconDharmaChakra size={48} className="text-indigo-dharma" />
              </div>
            </div>
          </div>
          <div className="relative">
            <h1 className="font-serif text-4xl lg:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-ocean via-peacock-blue to-indigo-dharma bg-clip-text text-transparent">
                भौगोलिक डेटा
              </span>
            </h1>
            <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-ocean mb-8">
              Cosmic Ocean Visualizations
            </h2>
            <p className="text-lg text-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              समुद्र मंथन — Interactive cosmographic visualizations mapping the spatial and temporal 
              dimensions of dharmic civilizations across the Indian Ocean world, from sacred port geometries 
              to monsoon mandalas, revealing the cosmic patterns that guided ancient navigation.
            </p>
            <div className="mt-6 h-1 w-32 bg-gradient-to-r from-ocean via-peacock-blue to-indigo-dharma mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Data Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Ports Dataset */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                <Globe size={20} className="text-ocean" />
                Historical Ports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Major port cities across the Indian Ocean world with their active periods and specializations.
              </p>
              <div className="space-y-3 mb-4">
                {PORTS.map((port) => (
                  <div key={port.id} className="flex items-center justify-between p-3 bg-sand/20 rounded">
                    <div>
                      <h4 className="font-medium text-foreground">{port.id}</h4>
                      <p className="text-sm text-muted-foreground">{port.region} • {port.era}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {port.lat.toFixed(2)}°N, {port.lon.toFixed(2)}°E
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => setActiveModal('ports')}
              >
                View Interactive Map
              </Button>
            </CardContent>
          </Card>

          {/* Monsoon Patterns */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                <BarChart3 size={20} className="text-ocean" />
                Monsoon Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Seasonal wind patterns that governed ancient navigation and trade cycles.
              </p>
              <div className="space-y-4 mb-4">
                <div className="p-3 bg-ocean/10 rounded">
                  <h4 className="font-medium text-foreground mb-2">Summer Monsoon</h4>
                  <p className="text-sm text-muted-foreground">
                    {MONSOON.summer.months.join(', ')} — Southwest winds enabling eastward travel
                  </p>
                </div>
                <div className="p-3 bg-gold/10 rounded">
                  <h4 className="font-medium text-foreground mb-2">Winter Monsoon</h4>
                  <p className="text-sm text-muted-foreground">
                    {MONSOON.winter.months.join(', ')} — Northeast winds enabling westward return
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setActiveModal('monsoon')}
              >
                View Seasonal Animation
              </Button>
            </CardContent>
          </Card>

          {/* Plate Movement */}
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
              <div className="space-y-2 mb-4">
                {PLATE_SPEED.map((data, index) => (
                  <div key={index} className="flex justify-between p-2 bg-sand/20 rounded text-sm">
                    <span className="text-foreground">{data.Ma} Ma</span>
                    <span className="text-muted-foreground">{data.cm_per_yr} cm/year</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setActiveModal('timeline')}
              >
                View Timeline Visualization
              </Button>
            </CardContent>
          </Card>

          {/* Trade Cargo */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-foreground flex items-center gap-2">
                <BarChart3 size={20} className="text-gold" />
                Pepper Trade Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Estimated cargo volumes on major pepper trade routes.
              </p>
              <div className="space-y-3 mb-4">
                {PEPPER_CARGO.map((cargo, index) => (
                  <div key={index} className="p-3 bg-gold/10 rounded">
                    <h4 className="font-medium text-foreground">{cargo.leg}</h4>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{cargo.sacks} sacks</span>
                      <span>~{(cargo.est_kg / 1000).toFixed(1)} tons</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                View Trade Flow Map
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Data Access */}
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
                <Button className="bg-ocean hover:bg-ocean/90">
                  Download CSV Data
                </Button>
                <Button variant="outline">
                  API Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Modals */}
      {activeModal === 'ports' && (
        <MapboxPortMap onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'monsoon' && (
        <MonsoonAnimation onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'timeline' && (
        <PlateTimeline onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}