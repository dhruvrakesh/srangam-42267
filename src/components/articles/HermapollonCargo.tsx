import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Scale, Ship } from 'lucide-react';

const cargoData = [
  { 
    item: 'Ivory (elephant tusks)', 
    quantity: '7,478 lbs', 
    approximateMetric: '≈3.4 tonnes', 
    icon: Package,
    color: 'sand'
  },
  { 
    item: 'Spikenard (perfume oil)', 
    quantity: '60 containers', 
    approximateMetric: 'full botanical jars', 
    icon: Package,
    color: 'turmeric'
  },
  { 
    item: 'Cloth (cotton/linen)', 
    quantity: '1,214 lbs', 
    approximateMetric: '≈0.55 tonnes', 
    icon: Package,
    color: 'oceanTeal'
  }
];

export function HermapollonCargo() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-sand/20 to-turmeric/20">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Ship className="text-oceanTeal" size={24} />
          The Hermapollon Cargo Manifest
        </CardTitle>
        <CardDescription>
          2nd century CE vessel from Muziris • Total cargo: &gt;220 tons
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {cargoData.map((cargo, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-l-4 bg-${cargo.color}/5 border-${cargo.color}`}
            >
              <div className="flex items-start gap-3">
                <cargo.icon className={`text-${cargo.color} mt-1`} size={20} />
                <div className="flex-1">
                  <div className="font-semibold text-foreground text-sm">
                    {cargo.item}
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {cargo.quantity}
                  </div>
                  <div className="text-xs mt-1 text-accent">
                    {cargo.approximateMetric}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="text-primary" size={18} />
            <span className="font-medium text-foreground">Logistics Impact</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Unloading this single monsoon cargo required over 1,000 camels to transport goods inland from Muziris. 
            The scale demonstrates the enormous commercial stakes of the seasonal wind trade.
          </p>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <em>Source: Muziris Papyrus, 2nd century CE • Archaeological evidence of Roman-Indian trade</em>
        </div>
      </CardContent>
    </Card>
  );
}