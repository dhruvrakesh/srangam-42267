/**
 * ImagingLabLauncher — auth-aware bridge from a Srangam article to the
 * imaging / astronomy lab at maps.sankyo.in, plus an internal deep-link
 * back into our own atlas at /maps-data.
 *
 * Phase J.1 — universal launcher. The card now ALWAYS renders on an
 * article page so the "explore on maps" affordance is never silently
 * removed. Buttons are layered conditionally:
 *
 *   1. (when pin)        → satellite imagery for the first pin
 *   2. (when challenge)  → matching astronomy-lab seed challenge
 *   3. (always)          → internal /maps-data atlas
 *   4. (always)          → external Map Explorer (signed-handoff if logged in)
 *   5. (always, ghost)   → Srangam Dating Lab hub
 *   6. (admin & no pins) → deep-link to /admin/geography-media to add pins
 *
 * Admin CTA reads `isAdmin` from useAuth(); RLS on srangam_article_pins
 * already restricts writes to admin role, so this is purely a UX shortcut
 * to the existing authoring surface — no privilege escalation.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Telescope,
  Satellite,
  FlaskConical,
  ExternalLink,
  ArrowRight,
  Map as MapIcon,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useImagingDeepLink } from '@/hooks/useImagingDeepLink';
import { useAuth } from '@/contexts/AuthContext';
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
  const { isAdmin } = useAuth();
  const challenge = matchChallenge({ tags, theme, title: articleTitle });
  const firstPin = pins[0];
  const ref = `srangam:${articleSlug}`;
  const noPins = pins.length === 0;

  return (
    <Card className="border-primary/30 bg-primary/[0.03]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Telescope className="h-5 w-5 text-primary" />
          Maps, Imagery &amp; Astronomy
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Cross-link this article into our atlas, satellite imagery at{' '}
          <span className="font-medium">{HOST}</span>, and the planetarium.
          {isAuthenticated ? (
            <Badge variant="outline" className="ml-2 text-[10px]">
              Single sign-on
            </Badge>
          ) : (
            <Badge variant="secondary" className="ml-2 text-[10px]">
              Sign-in required for external lab
            </Badge>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* 1. Pin-targeted satellite imagery (when the article has a geo-pin) */}
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

        {/* 2. Matched astronomy-lab challenge */}
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

        {/* 3. Internal atlas — always available, no token, same tab */}
        <Button asChild variant="outline" className="w-full justify-between gap-2">
          <Link to={`/maps-data?focus=${encodeURIComponent(articleSlug)}`}>
            <span className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="text-left">
                <span className="block text-sm">Open in Atlas</span>
                <span className="block text-[11px] text-muted-foreground">
                  Article-aware view of /maps-data
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </Button>

        {/* 4. External Map Explorer — universal even without coords */}
        <Button
          variant="outline"
          className="w-full justify-between gap-2"
          disabled={isLaunching}
          onClick={() => openImaging({ kind: 'viewer', params: { ref } })}
        >
          <span className="flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            <span className="text-left">
              <span className="block text-sm">Open Map Explorer on {HOST}</span>
              <span className="block text-[11px] text-muted-foreground">
                Satellite imagery + place lookup
              </span>
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0" />
        </Button>

        {/* 5. Dating Lab hub */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
          disabled={isLaunching}
          onClick={() => openImaging({ kind: 'dating-lab', params: { ref } })}
        >
          Or open the Srangam Dating Lab hub <ExternalLink className="h-3 w-3 ml-1" />
        </Button>

        {/* 6. Admin-only authoring shortcut when this article has no pins */}
        {isAdmin && noPins && (
          <div className="pt-2 mt-1 border-t border-border/40">
            <Button
              asChild
              variant="secondary"
              className="w-full justify-between gap-2"
            >
              <Link to={`/admin/geography-media?article=${encodeURIComponent(articleSlug)}`}>
                <span className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="text-left">
                    <span className="block text-sm">Add geo-pins for this article</span>
                    <span className="block text-[11px] text-muted-foreground">
                      Admin · Geography &amp; Media
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
          </div>
        )}

        <p className="text-[11px] leading-snug text-muted-foreground/80 pt-1 border-t border-border/40">
          First visit to {HOST}? It will ask for Google sign-in and may
          queue your account for a one-time admin approval before unlocking
          the labs.
        </p>
      </CardContent>
    </Card>
  );
};

export default ImagingLabLauncher;
