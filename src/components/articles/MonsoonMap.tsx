import React from 'react';
import { PORTS, MONSOON } from '@/data/siteData';

export function MonsoonMap() {
  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-foreground">Key Maritime Network</h3>
      
      {/* Ports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-foreground mb-3">Major Ports</h4>
          <div className="space-y-2">
            {PORTS.map((port) => (
              <div key={port.id} className="bg-white/50 p-3 rounded border-l-4 border-ocean">
                <div className="font-medium text-foreground">{port.id}</div>
                <div className="text-sm text-muted-foreground">
                  {port.region} • {port.era}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {port.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-ocean/10 text-ocean px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monsoon Seasons */}
        <div>
          <h4 className="font-semibold text-foreground mb-3">Monsoon Calendar</h4>
          <div className="space-y-3">
            <div className="bg-laterite/10 p-3 rounded border-l-4 border-laterite">
              <div className="font-medium text-foreground">Summer Westerlies</div>
              <div className="text-sm text-muted-foreground mb-2">
                {MONSOON.summer.months.join(' • ')}
              </div>
              <div className="text-xs text-laterite">Outbound to India</div>
            </div>
            <div className="bg-ocean/10 p-3 rounded border-l-4 border-ocean">
              <div className="font-medium text-foreground">Winter Easterlies</div>
              <div className="text-sm text-muted-foreground mb-2">
                {MONSOON.winter.months.join(' • ')}
              </div>
              <div className="text-xs text-ocean">Return to Red Sea</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}