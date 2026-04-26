/**
 * ImagingHubCallout — small banner that promotes the cross-app bridge to
 * registered users on map-heavy pages (e.g. Maps & Data).
 *
 * Anonymous visitors still see the card, but the primary CTA tells them
 * sign-in is required on the imaging side. Authenticated users get
 * single-sign-on through `useImagingDeepLink`.
 */
import React from 'react';
import { Telescope, ArrowRight, Satellite, FlaskConical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImagingDeepLink } from '@/hooks/useImagingDeepLink';
import { IMAGING_BASE_URL } from '@/lib/imaging/handoff';

const HOST = (() => {
  try {
    return new URL(IMAGING_BASE_URL).host;
  } catch {
    return 'maps.sankyo.in';
  }
})();

export const ImagingHubCallout: React.FC = () => {
  const { openImaging, isLaunching, isAuthenticated } = useImagingDeepLink();

  return (
    <Card className="mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Telescope className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm">Imaging &amp; Astronomy Lab</h3>
            {isAuthenticated ? (
              <Badge variant="outline" className="text-[10px]">Single sign-on</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">Sign-in required</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Take any place on this atlas straight into satellite imagery, or run
            an astronomical-dating challenge on the same coordinates — at{' '}
            <span className="font-medium">{HOST}</span>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isLaunching}
            onClick={() => openImaging({ kind: 'dating-lab', params: { ref: 'srangam:maps-data' } })}
          >
            <FlaskConical className="h-4 w-4 mr-1" /> Dating Lab
          </Button>
          <Button
            size="sm"
            disabled={isLaunching}
            onClick={() => openImaging({ kind: 'viewer', params: { ref: 'srangam:maps-data' } })}
          >
            <Satellite className="h-4 w-4 mr-1" /> Open Map Explorer
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagingHubCallout;
