import { Badge } from '@/components/ui/badge';
import { ExpandableSection } from '@/components/articles/enhanced/ExpandableSection';

export const GeologicalTriggers = () => (
  <ExpandableSection 
    title="Geological Causes of the 1341 Flood"
    type="detail"
    defaultExpanded={false}
  >
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Badge variant="destructive" className="mt-1">Tectonic</Badge>
        <div>
          <h4 className="font-medium text-foreground mb-1">Seismic Trigger</h4>
          <p className="text-sm text-muted-foreground">
            Seismic activity in the Western Ghats may have triggered massive landslides upstream, 
            creating natural dams that eventually burst.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <Badge variant="secondary" className="mt-1">Climate</Badge>
        <div>
          <h4 className="font-medium text-foreground mb-1">Extreme Monsoon</h4>
          <p className="text-sm text-muted-foreground">
            The flood coincided with an exceptionally intense southwest monsoon, 
            saturating the Western Ghats and causing widespread erosion.
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="mt-1">Hydraulic</Badge>
        <div>
          <h4 className="font-medium text-foreground mb-1">River Dynamics</h4>
          <p className="text-sm text-muted-foreground">
            The massive sediment load overwhelmed the Periyar's existing channel, 
            forcing it to carve an entirely new course to the sea.
          </p>
        </div>
      </div>
    </div>
  </ExpandableSection>
);