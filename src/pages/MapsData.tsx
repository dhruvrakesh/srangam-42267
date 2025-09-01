import { Map, Database, BarChart3, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PORTS, MONSOON, PLATE_SPEED, PEPPER_CARGO } from "@/data/siteData";
import { InteractivePortMap } from "@/components/interactive/InteractivePortMap";
import { MonsoonAnimation } from "@/components/interactive/MonsoonAnimation";
import { PlateTimeline } from "@/components/interactive/PlateTimeline";
import { useState } from "react";

export default function MapsData() {
  const [activeModal, setActiveModal] = useState<'ports' | 'monsoon' | 'timeline' | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Map size={64} className="text-gold" />
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Maps & Data
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Interactive visualizations and datasets exploring the spatial and temporal 
            dimensions of Indian Ocean histories — from port locations to monsoon patterns.
          </p>
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
        <InteractivePortMap onClose={() => setActiveModal(null)} />
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