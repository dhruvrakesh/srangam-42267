/**
 * ImagingLabLauncher — auth-aware bridge from a Srangam article to the
 * imaging / astronomy lab at maps.sankyo.in.
 *
 * Renders nothing for articles that have neither geo-pins nor a matching
 * seed challenge — keeps the page clean.
 */
import React from 'react';
import { Telescope, Satellite, FlaskConical, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImagingDeepLink } from '@/hooks/useImagingDeepLink';
import { matchChallenge } from '@/lib/imaging/challengeMap';
import { IMAGING_BASE_URL } from '@/lib/imaging/handoff';

interface PinLite {
  name: string;
  lat: number;
  lon: number;
}

interface Props {
  articleSlug: string;
  articleTitle: string;
  pins: PinLite[];
  tags?: string[];
  theme?: string;
}

const HOST = (() => {
  try {
    return new URL(IMAGING_BASE_URL).host;
  } catch {
    return 'maps.sankyo.in';
  }
})();

export const ImagingLabLauncher: React.FC<Props> = ({
  articleSlug,
  articleTitle,
  pins,
  tags,
  theme,
}) => {
  const { openImaging, isLaunching, isAuthenticated } = useImagingDeepLink();
  const challenge = matchChallenge({ tags, theme, title: articleTitle });
  const firstPin = pins[0];

  // Render nothing if there's no contextual hook to the imaging app.
  if (!firstPin && !challenge) return null;

  const ref = `srangam:${articleSlug}`;

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Telescope className="h-5 w-5 text-primary" />
          Open in Imaging &amp; Astronomy Lab
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Cross-link this article into satellite imagery and the planetarium at{' '}
          <span className="font-medium">{HOST}</span>
          {isAuthenticated ? (
            <Badge variant="outline" className="ml-2 text-[10px]">
              Single sign-on
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2 text-[10px]">
              Sign-in required there
            </Badge>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {firstPin && (
          <Button
            variant="outline"
            className="w-full justify-between gap-2"
            disabled={isLaunching}
            onClick={() =>
              openImaging({
                kind: 'viewer',
                params: {
                  lat: firstPin.lat,
                  lon: firstPin.lon,
                  zoom: 12,
                  ref,
                },
              })
            }
          >
            <span className="flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              <span className="text-left">
                <span className="block text-sm">View {firstPin.name} in satellite imagery</span>
                <span className="block text-[11px] text-muted-foreground">
                  Map Explorer · {firstPin.lat.toFixed(2)}°, {firstPin.lon.toFixed(2)}°
                </span>
              </span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0" />
          </Button>
        )}

        {challenge && (
          <Button
            variant="outline"
            className="w-full justify-between gap-2"
            disabled={isLaunching}
            onClick={() =>
              openImaging({
                kind: 'astronomy-lab',
                params: { challenge: challenge.challengeId, ref },
              })
            }
          >
            <span className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="text-left">
                <span className="block text-sm">{challenge.label}</span>
                <span className="block text-[11px] text-muted-foreground">
                  Astronomy Lab · {challenge.challengeId}
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
          disabled={isLaunching}
          onClick={() => openImaging({ kind: 'dating-lab', params: { ref } })}
        >
          Or open the Srangam Dating Lab hub <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ImagingLabLauncher;
