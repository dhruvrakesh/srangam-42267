import React from 'react';
import { PEPPER_CARGO } from '@/data/siteData';

export function PepperCargoTable() {
  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-foreground">Pepper Trade Volume</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 font-semibold text-foreground">Route</th>
              <th className="text-right py-3 font-semibold text-foreground">Sacks</th>
              <th className="text-right py-3 font-semibold text-foreground">Est. Weight (kg)</th>
              <th className="text-center py-3 font-semibold text-foreground">Return Cargo</th>
            </tr>
          </thead>
          <tbody>
            {PEPPER_CARGO.map((cargo, index) => (
              <tr key={index} className="border-b border-border/50">
                <td className="py-3 font-medium text-foreground">{cargo.leg}</td>
                <td className="py-3 text-right text-foreground">{cargo.sacks.toLocaleString()}</td>
                <td className="py-3 text-right text-foreground">{cargo.est_kg.toLocaleString()}</td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${
                    cargo.bullion_back 
                      ? 'bg-gold/20 text-gold' 
                      : 'bg-muted/50 text-muted-foreground'
                  }`}>
                    {cargo.bullion_back ? 'Bullion' : 'Mixed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p className="text-sm text-muted-foreground">
        * Standard sack weight estimated at 55kg based on archaeological evidence
      </p>
    </div>
  );
}